// Shared, deterministic booking rules. Amounts are integer satang, never floats.
export type Selection = { listingId: string; date: string; start: number; end: number; guests: number; hypothetical: boolean };
export type ListingQuoteSource = { id: string; title: string; status: string; hourly_price: number; guest_limit: number; open_hour: number; close_hour: number };
export type AvailableHour = { hour: number; hourly_price: number; is_open: boolean };
export type Quote = { selection: Selection; title: string; lines: { hour: number; amount: number }[]; subtotal: number; fee: number; total: number; currency: 'THB'; expiresAt: number; mode: 'simulation'; inventory: 'hypothetical' | 'published_schedule'; };
export class BookingError extends Error {}
export const FEE_BASIS_POINTS = 800;
export function previewAllowed(env: { VERCEL_ENV?: string; NODE_ENV?: string }) {
  return env.VERCEL_ENV === 'preview' || (!env.VERCEL_ENV && env.NODE_ENV === 'development');
}
export function validateSelection(value: unknown, now = Date.now()): Selection {
  if (!value || typeof value !== 'object') throw new BookingError('กรุณาเลือกวัน เวลา และจำนวนคน');
  const v = value as Selection;
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(v.listingId)) throw new BookingError('ไม่พบรหัสพื้นที่');
  if (typeof v.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v.date) || new Date(v.date + 'T00:00:00Z').toISOString().slice(0,10) !== v.date) throw new BookingError('วันที่ไม่ถูกต้อง');
  if (![v.start, v.end, v.guests].every(Number.isInteger) || v.start < 0 || v.end > 24 || v.end <= v.start || v.guests < 1 || v.guests > 500) throw new BookingError('เวลาและจำนวนคนไม่ถูกต้อง');
  const startsAt = Date.parse(`${v.date}T${String(v.start).padStart(2,'0')}:00:00+07:00`);
  if (startsAt <= now || startsAt > now + 180 * 86400000) throw new BookingError('เลือกเวลาในอนาคต ภายใน 180 วัน');
  if (typeof v.hypothetical !== 'boolean') throw new BookingError('กรุณาระบุโหมดการทดลอง');
  return {listingId:v.listingId,date:v.date,start:v.start,end:v.end,guests:v.guests,hypothetical:v.hypothetical};
}
function satang(value: number) {
  if (!Number.isFinite(value) || value <= 0 || value > 10000000) throw new BookingError('ราคาพื้นที่ไม่ถูกต้อง กรุณาติดต่อเจ้าของ');
  return Math.round(value * 100);
}
export function makeQuote(selection: Selection, listing: ListingQuoteSource, availability: AvailableHour[], now = Date.now()): Quote {
  const s = validateSelection(selection, now);
  if (listing.id !== s.listingId || listing.status !== 'published') throw new BookingError('พื้นที่นี้ยังไม่เปิดให้จอง');
  if (s.guests > listing.guest_limit) throw new BookingError(`พื้นที่นี้รองรับได้ไม่เกิน ${listing.guest_limit} คน`);
  if (s.start < listing.open_hour || s.end > listing.close_hour) throw new BookingError('ช่วงเวลานี้อยู่นอกเวลาเปิดพื้นที่');
  const lines = Array.from({length:s.end-s.start},(_,i)=> {
    const hour = s.start+i, slot = availability.find(a=>a.hour===hour);
    if (!s.hypothetical && !slot?.is_open) throw new BookingError('เจ้าของยังไม่เปิดช่วงเวลานี้ กรุณาเลือกเวลาใหม่');
    return {hour,amount:satang(s.hypothetical ? listing.hourly_price : slot!.hourly_price)};
  });
  const subtotal = lines.reduce((sum,l)=>sum+l.amount,0);
  const fee = Math.round(subtotal * FEE_BASIS_POINTS / 10000);
  return {selection:s,title:listing.title,lines,subtotal,fee,total:subtotal+fee,currency:'THB',expiresAt:now+10*60*1000,mode:'simulation',inventory:s.hypothetical?'hypothetical':'published_schedule'};
}
export type BookingStatus = 'awaiting_payment' | 'awaiting_host' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'failed' | 'paid' | 'refund_pending' | 'refunded';
export type SandboxEvent = 'payment_success' | 'payment_failure' | 'host_accept' | 'cancel' | 'refund_complete';
export type SandboxBooking = { version:1; id:string; quote:Quote; method?:'card'|'promptpay'; booking:BookingStatus; payment:PaymentStatus; history:{ event:string; at:number }[] };
export function beginBooking(quote:Quote,id:string,now=Date.now()):SandboxBooking {
  if (now >= quote.expiresAt) throw new BookingError('ราคาหมดอายุ กรุณาตรวจราคาอีกครั้ง');
  return {version:1,id,quote,booking:'awaiting_payment',payment:'unpaid',history:[{event:'created',at:now}]};
}
export function transition(current:SandboxBooking,event:SandboxEvent,now=Date.now()):SandboxBooking {
  const next = {...current};
  if (event==='payment_success' || event==='payment_failure') {
    if (current.booking!=='awaiting_payment') return current; // Duplicate completion cannot charge/fulfil twice.
    if (now>=current.quote.expiresAt) throw new BookingError('ราคาหมดอายุ กรุณากลับไปตรวจราคาใหม่');
    next.payment=event==='payment_success'?'paid':'failed';
    if (event==='payment_success') next.booking='awaiting_host';
  } else if (event==='host_accept') {
    if (current.booking!=='awaiting_host'||current.payment!=='paid') return current;
    next.booking='confirmed';
  } else if (event==='cancel') {
    if (current.booking==='cancelled') return current;
    next.booking='cancelled';
    if(current.payment==='paid') next.payment='refund_pending';
  } else if (event==='refund_complete') {
    if(current.booking!=='cancelled'||current.payment!=='refund_pending') return current;
    next.payment='refunded';
  }
  return {...next,history:[...current.history,{event,at:now}]};
}
export const bookingLabels:Record<BookingStatus,string> = {awaiting_payment:'รอชำระเงิน',awaiting_host:'รอเจ้าของยืนยัน',confirmed:'ยืนยันการจองแล้ว',cancelled:'ยกเลิกแล้ว'};
export const paymentLabels:Record<PaymentStatus,string> = {unpaid:'ยังไม่ชำระ',failed:'ชำระไม่สำเร็จ',paid:'ชำระแล้ว (จำลอง)',refund_pending:'รอคืนเงิน (จำลอง)',refunded:'คืนเงินแล้ว (จำลอง)'};
