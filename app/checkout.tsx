'use client';
import { PaymentMark } from './payment-mark';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useSearchParams} from 'next/navigation';
import {ArrowLeft,ArrowRight,Check,CheckCircle2,CreditCard,ShieldCheck,FlaskConical,CalendarDays,Clock,Users,RotateCcw,AlertCircle,Loader2,QrCode,LockKeyhole} from 'lucide-react';
import {useApp} from './context';
import {money,hour} from './data';
import {beginBooking,transition,bookingLabels,paymentLabels,type Selection,type Quote,type SandboxBooking,type SandboxEvent} from '@/lib/booking';
import {selectionParams} from './reservation';
import PaymentReturn from './payment-return';
import type {PaymentConfig,PaymentMethod} from '@/lib/payment-rules';

const KEY='welaa-sandbox-bookings-v1';
function readBookings():SandboxBooking[] {
  try {const value=JSON.parse(sessionStorage.getItem(KEY)||'[]');return Array.isArray(value)?value.filter(x=>x?.version===1&&typeof x.id==='string'&&x.quote?.mode==='simulation'&&Number.isFinite(x.quote.total)&&x.booking in bookingLabels&&x.payment in paymentLabels&&Array.isArray(x.history)).slice(0,20):[]}catch{return []}
}
function saveBooking(b:SandboxBooking) {
  try{sessionStorage.setItem(KEY,JSON.stringify([b,...readBookings().filter(x=>x.id!==b.id)].slice(0,20)))}catch{throw new Error('เบราว์เซอร์ไม่อนุญาตให้เก็บรายการทดสอบ กรุณาอนุญาตพื้นที่จัดเก็บแล้วลองใหม่')}
}
async function getQuote(selection:Selection,signal?:AbortSignal):Promise<Quote> {
  const response=await fetch('/api/preview/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(selection),signal});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||'ตรวจราคาไม่สำเร็จ');
  return result.quote;
}
function Amounts({quote}:{quote:Quote}) {
  return <div className="checkout-amounts"><div><span>ค่าพื้นที่ · {quote.lines.length} ชั่วโมง</span><b>฿{money(quote.subtotal/100)}</b></div><div><span>ค่าบริการ WELAA · 8%</span><b>฿{money(quote.fee/100)}</b></div><div className="checkout-total"><span>ยอดรวม</span><strong>฿{money(quote.total/100)}</strong></div><small>THB · ยอดสำหรับทดลอง ไม่ใช่ใบเสร็จภาษี</small></div>;
}
function SelectionSummary({selection}:{selection:Selection}) {return <div className="checkout-selection"><span><CalendarDays size={18}/>{new Intl.DateTimeFormat('th-TH',{dateStyle:'long',timeZone:'Asia/Bangkok'}).format(new Date(selection.date+'T12:00:00+07:00'))}</span><span><Clock size={18}/>{hour(selection.start)}–{hour(selection.end)} · {selection.end-selection.start} ชั่วโมง</span><span><Users size={18}/>{selection.guests} คน</span></div>}
const eventLabels:Record<string,string>={created:'สร้างรายการทดสอบ',payment_success:'จำลองการชำระสำเร็จ',payment_failure:'จำลองการชำระไม่สำเร็จ',host_accept:'จำลองเจ้าของยืนยัน',cancel:'ยกเลิกรายการทดสอบ',refund_complete:'จำลองคืนเงินสำเร็จ'};

export default function Checkout() {
  const p=useSearchParams(),query=p.toString(),{all,go}=useApp();
  const [method,setMethod]=useState<PaymentMethod>('card'),[gateway,setGateway]=useState<PaymentConfig|null>(null);
  const attempt=useRef('');
  useEffect(()=>{const abort=new AbortController();fetch('/api/payments/config',{signal:abort.signal,cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(setGateway).catch(()=>{if(!abort.signal.aborted)setGateway({mode:'unconfigured',methods:['card','promptpay']})});return()=>abort.abort()},[]);
  const [quote,setQuote]=useState<Quote|null>(null),[phase,setPhase]=useState<'review'|'payment'>('review');
  const [loading,setLoading]=useState(false),[error,setError]=useState(''),[agree,setAgree]=useState(false),[outcome,setOutcome]=useState('success');
  const [booking,setBooking]=useState<SandboxBooking|null>(null),[records,setRecords]=useState<SandboxBooking[]>([]),[retry,setRetry]=useState(0),[cancelOpen,setCancelOpen]=useState(false);
  const errorArea=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(error){errorArea.current?.focus();errorArea.current?.scrollIntoView({block:'nearest'})}},[error]);
  const inFlight=useRef(false),requestRevision=useRef(0),heading=useRef<HTMLHeadingElement>(null);
  const isHistory=p.get('history')==='1',receipt=p.get('receipt'),stripeSession=p.get('stripe_session');
  useEffect(()=>{
    const revision=++requestRevision.current,abort=new AbortController();
    // Synchronize the route with external sessionStorage and a cancellable quote request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError('');setQuote(null);setAgree(false);setPhase('review');setBooking(null);setCancelOpen(false);setRecords(readBookings());
    attempt.current=crypto.randomUUID();
    if(stripeSession){setLoading(false);return ()=>abort.abort()}
    if(isHistory){setLoading(false);return ()=>abort.abort()}
    if(receipt){setBooking(readBookings().find(b=>b.id===receipt)||null);setLoading(false);return ()=>abort.abort()}
    setLoading(true);
    const fields=new URLSearchParams(query);
    const selection:Selection={listingId:fields.get('listingId')||'',date:fields.get('date')||'',start:Number(fields.get('start')),end:Number(fields.get('end')),guests:Number(fields.get('guests')),hypothetical:fields.get('hypothetical')==='true'};
    getQuote(selection,abort.signal).then(q=>{if(revision===requestRevision.current)setQuote(q)}).catch(e=>{if(!abort.signal.aborted)setError(e.message)}).finally(()=>{if(!abort.signal.aborted)setLoading(false)});
    return ()=>{abort.abort();requestRevision.current=revision+1};
  },[query,retry,isHistory,receipt,stripeSession]);
  useEffect(()=>{heading.current?.focus();if(phase==='payment')heading.current?.scrollIntoView({block:'start'})},[phase,receipt]);
  const s=all.find(s=>s.id===(quote?.selection.listingId||booking?.quote.selection.listingId||p.get('listingId')));
  const back=quote?`/spaces/${quote.selection.listingId}?${selectionParams(quote.selection)}`:s?`/spaces/${s.id}`:'/search';
  function update(event:SandboxEvent){if(!booking)return;try{const next=transition(booking,event);saveBooking(next);setBooking(next);setCancelOpen(false)}catch(e){setError((e as Error).message)}}
  async function pay(){
    if(!quote||!agree||inFlight.current)return;
    inFlight.current=true;setLoading(true);setError('');
    const revision=requestRevision.current;
    try{
      const latest=await getQuote(quote.selection);
      if(revision!==requestRevision.current)return;
      if(latest.total!==quote.total||Date.now()>=quote.expiresAt){setQuote(latest);setPhase('review');setAgree(false);setError('ตรวจพบราคาเปลี่ยนหรือหมดอายุ กรุณาตรวจยอดและยืนยันอีกครั้ง');return}
      const current=beginBooking(latest,'TEST-'+crypto.randomUUID());
      const next=transition(current,outcome==='success'?'payment_success':'payment_failure');
      saveBooking({...next,method});
      go('/checkout/test?receipt='+next.id);
    }catch(e){if(revision===requestRevision.current)setError((e as Error).message)}
    finally{inFlight.current=false;if(revision===requestRevision.current)setLoading(false)}
  }
  async function openStripe(){
    if(!quote||!agree||inFlight.current||gateway?.mode!=='stripe_test')return;
    inFlight.current=true;setLoading(true);setError('');const revision=requestRevision.current;
    try{
      const response=await fetch('/api/payments/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({selection:quote.selection,method,expectedTotal:quote.total,agree,attempt:attempt.current})});
      const result=await response.json();if(revision!==requestRevision.current)return;
      if(response.status===409&&result.quote){setQuote(result.quote);setPhase('review');setAgree(false);attempt.current=crypto.randomUUID()}
      if(!response.ok)throw new Error(result.error||'เปิดหน้าชำระเงินไม่สำเร็จ');
      if(new URL(result.url).hostname!=='checkout.stripe.com')throw new Error('ลิงก์ชำระเงินไม่ถูกต้อง');
      window.location.assign(result.url);
    }catch(e){if(revision===requestRevision.current)setError((e as Error).message)}
    finally{inFlight.current=false;if(revision===requestRevision.current)setLoading(false)}
  }
  return <div className="page checkout-page">
    <div className="checkout-topline"><Link href={receipt||isHistory?'/search':back}><ArrowLeft size={17}/>{receipt||isHistory?'ค้นหาพื้นที่':'กลับไปเลือกเวลา'}</Link><Link href="/checkout/test?history=1">รายการทดสอบของฉัน</Link></div>
    <div className="checkout-sandbox"><FlaskConical size={17}/><span><b>โหมดทดลอง</b> ไม่มีการตัดเงินจริง ไม่ล็อกพื้นที่ และไม่ส่งคำขอถึงเจ้าของ</span></div>
    {stripeSession?<PaymentReturn sessionId={stripeSession}/>:isHistory?<><h1 ref={heading} tabIndex={-1}>รายการทดสอบของคุณ</h1><p className="checkout-lead">เก็บเฉพาะในแท็บนี้ แยกจากบัญชีและการจองจริง</p><div className="checkout-records">{records.length?records.map(b=><Link key={b.id} href={'/checkout/test?receipt='+b.id}><div><b>{b.quote.title}</b><p>{b.quote.selection.date} · {hour(b.quote.selection.start)}–{hour(b.quote.selection.end)}</p><small>{bookingLabels[b.booking]} · {paymentLabels[b.payment]}</small></div><ArrowRight size={18}/></Link>):<div className="checkout-card"><p>ยังไม่มีรายการทดลอง</p><Link className="button" href="/search">เริ่มค้นหาพื้นที่</Link></div>}</div></>:
    receipt?booking?<><h1 ref={heading} tabIndex={-1}>{bookingLabels[booking.booking]}</h1><p className="checkout-lead">{booking.payment==='failed'?'ยังไม่มีการชำระเงิน คุณสามารถกลับไปลองใหม่ได้':'ติดตามสถานะทุกขั้นได้จากที่เดียว'} · รายการจำลอง</p><div className="checkout-layout"><section className="checkout-card"><div className="receipt-header"><CheckCircle2 size={28}/><div><h2>{booking.quote.title}</h2><small className="receipt-id">{booking.id}</small></div></div><SelectionSummary selection={booking.quote.selection}/>{booking.method&&<p className="receipt-method">วิธีชำระเงิน · {booking.method==='card'?'บัตรเครดิต / เดบิต':'พร้อมเพย์'} (จำลอง)</p>}<div className="receipt-status"><span>การจอง<b>{bookingLabels[booking.booking]}</b></span><span>การชำระเงิน<b>{paymentLabels[booking.payment]}</b></span></div><ol className="receipt-timeline">{booking.history.map((h,i)=><li key={i}><Check size={15}/><div><b>{eventLabels[h.event]||h.event}</b><small>{new Date(h.at).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})}</small></div></li>)}</ol>{booking.booking==='awaiting_payment'&&<Link className="button full" href={'/checkout/test?'+selectionParams(booking.quote.selection)}>ตรวจราคาแล้วลองใหม่ <RotateCcw size={16}/></Link>}{booking.booking!=='cancelled'&&<button className="text-link" onClick={()=>setCancelOpen(true)}>ยกเลิกรายการทดลอง</button>}{cancelOpen&&<div className="checkout-policy"><b>ยืนยันยกเลิกรายการนี้?</b><p>หากชำระแล้ว สถานะจะเป็นรอคืนเงินจำลอง ไม่มีเงินจริงเกี่ยวข้อง</p><div className="row wrap"><button className="button secondary" onClick={()=>setCancelOpen(false)}>เก็บรายการไว้</button><button className="button" onClick={()=>update('cancel')}>ยืนยันยกเลิก</button></div></div>}<details className="sandbox-options"><summary>เครื่องมือทดสอบสถานะ</summary><p>ใช้จำลองการตอบรับและคืนเงิน ไม่ได้ส่งให้เจ้าของหรือผู้ให้บริการชำระเงินจริง</p>{booking.booking==='awaiting_host'&&<button className="button secondary" onClick={()=>update('host_accept')}>จำลองเจ้าของยืนยัน</button>}{booking.payment==='refund_pending'&&<button className="button secondary" onClick={()=>update('refund_complete')}>จำลองคืนเงินสำเร็จ</button>}</details></section><aside className="checkout-card checkout-summary"><h2>สรุปยอด</h2><Amounts quote={booking.quote}/><p className="checkout-note"><ShieldCheck size={17}/>นี่ไม่ใช่หลักฐานการจองหรือชำระเงินจริง</p></aside></div></>:<div className="checkout-card"><h1>ไม่พบรายการทดสอบในแท็บนี้</h1><p>รายการทดลองไม่ซิงก์ข้ามอุปกรณ์ และอาจหายเมื่อปิดแท็บ</p><Link className="button" href="/search">ค้นหาพื้นที่</Link></div>:
    <><ol className="checkout-steps" aria-label="ขั้นตอนการจอง"><li className="done"><Check size={15}/><span>เลือกพื้นที่</span></li><li className={phase==='review'?'active':'done'} aria-current={phase==='review'?'step':undefined}><span>2</span>ตรวจรายละเอียด</li><li className={phase==='payment'?'active':''} aria-current={phase==='payment'?'step':undefined}><span>3</span>ชำระเงิน</li></ol><h1 ref={heading} tabIndex={-1}>{phase==='review'?'ตรวจให้พร้อม ก่อนจองเวลาของคุณ':'เลือกวิธีชำระเงิน'}</h1><p className="checkout-lead">{phase==='review'?'วัน เวลา และราคา อยู่ครบในที่เดียว':'ยอดรวมชัดเจน เลือกวิธีที่สะดวกสำหรับคุณ'}</p>
    {loading&&!quote&&<div className="checkout-card checkout-loading" role="status"><Loader2 className="spin" size={20}/>กำลังตรวจข้อมูลและราคาล่าสุด…</div>}
    {p.get('cancelled')==='1'&&<p className="checkout-hint" role="status">คุณกลับจาก Stripe สามารถตรวจรายละเอียดและเริ่มรายการใหม่ได้</p>}{quote&&<div className="checkout-layout"><section className="checkout-card"><div className="checkout-property">{s?.image&&<Image src={s.image} alt={s.name} width={96} height={88} unoptimized/>}<div><small>{s?.type||'พื้นที่ของคุณ'} · {s?.city}</small><h2>{quote.title}</h2><Link href={back}>แก้ไขวันและเวลา</Link></div></div><SelectionSummary selection={quote.selection}/>{quote.inventory==='hypothetical'&&<div className="checkout-hint"><FlaskConical size={16}/><span>เวลาสมมติ · ใช้ราคาเริ่มต้นของประกาศ ไม่ใช่เวลาที่เจ้าของเปิดจริง</span></div>}
    {phase==='review'?<><h3>ก่อนยืนยัน มีอะไรที่ควรรู้</h3><div className="checkout-policy"><b>กฎของพื้นที่</b><p>{s?.rules||'ยังไม่มีรายละเอียดกฎเพิ่มเติม กรุณาตรวจสอบกับเจ้าของก่อนจองจริง'}</p><b>การยกเลิกในพรีวิว</b><p>ยกเลิกรายการทดลองได้จากหน้าสถานะ หากจำลองชำระแล้วจะเปลี่ยนเป็นรอคืนเงิน นโยบายคืนเงินจริงยังไม่เปิดใช้</p></div><div className="payment-inline-total"><span>ยอดรวมทั้งหมด</span><strong>฿{money(quote.total/100)}</strong></div><label className="native-check checkout-consent"><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/><span>ฉันตรวจวัน เวลา จำนวนคน และกฎพื้นที่แล้ว และเข้าใจว่านี่เป็นรายการทดสอบ</span></label><button className="button full" disabled={!agree} onClick={()=>{setPhase('payment');setError('')}}>เลือกวิธีชำระเงิน <ArrowRight size={18}/></button></>:<><fieldset className="payment-methods"><legend>วิธีชำระเงิน</legend>{(['card','promptpay'] as const).map(value=><label key={value} className={'payment-method '+(method===value?'selected':'')}><input type="radio" name="payment-method" value={value} checked={method===value} onChange={()=>setMethod(value)} disabled={loading}/><span className="payment-method-icon"><PaymentMark method={value}/></span><span><b>{value==='card'?'บัตรเครดิต / เดบิต':'พร้อมเพย์'}</b><small>{value==='card'?'Visa · Mastercard และบัตรที่ Stripe รองรับ':'สแกน QR ด้วยแอปธนาคารไทย'}</small></span><span className="payment-radio" aria-hidden="true"/></label>)}</fieldset>
    <div className="payment-guidance"><LockKeyhole size={18}/><div><b>{method==='card'?'กรอกข้อมูลบัตรผ่าน Stripe':'ชำระด้วย QR พร้อมเพย์'}</b><p>{method==='card'?'ข้อมูลบัตรและการยืนยันกับธนาคารจะทำผ่านหน้าชำระเงินของ Stripe':'Stripe จะแสดง QR ตามยอดรายการ ให้ชำระครั้งเดียวและรอการยืนยัน'}</p></div></div>
    <div className="payment-inline-total"><span>ยอดรวมทั้งหมด</span><strong>฿{money(quote.total/100)}</strong></div>
    <p className="payment-mode-note" role="status">{!gateway?'กำลังตรวจช่องทางชำระเงิน…':gateway.mode==='stripe_test'?'เชื่อม Stripe โหมดทดสอบแล้ว · ไม่มีการตัดเงินจริง':'ยังไม่ได้เชื่อมบัญชี Stripe · ทดลองขั้นตอนได้โดยไม่ใช้ข้อมูลบัตรหรือโอนเงินจริง'}</p>
    <button className="button full" disabled={loading||!agree||!gateway} onClick={()=>void (gateway?.mode==='stripe_test'?openStripe():pay())}>{loading?<><Loader2 size={17} className="spin"/>กำลังตรวจและเตรียมรายการ…</>:gateway?.mode==='stripe_test'?<>ไปชำระผ่าน Stripe · โหมดทดสอบ <ArrowRight size={17}/></>:<>ทดลองชำระด้วย{method==='card'?'บัตร':'พร้อมเพย์'} <ArrowRight size={17}/></>}</button>
    <button className="text-link" disabled={loading} onClick={()=>setPhase('review')}>กลับไปตรวจรายละเอียด</button>
    <details className="sandbox-options payment-test-options"><summary>ทดสอบกรณีชำระไม่สำเร็จ</summary><p>ตัวจำลองไม่เรียกเก็บเงินจริงและไม่สร้าง QR สำหรับโอนเงิน</p><label className="field">ผลลัพธ์ที่ต้องการ<select aria-label="ผลลัพธ์การชำระเงินทดสอบ" value={outcome} onChange={e=>setOutcome(e.target.value)} disabled={loading}><option value="success">ชำระสำเร็จ → รอเจ้าของยืนยัน</option><option value="failure">ชำระไม่สำเร็จ → ลองใหม่</option></select></label>{gateway?.mode==='stripe_test'&&<button className="button secondary full" disabled={loading||!agree} onClick={()=>void pay()}>ทดลองด้วยตัวจำลอง</button>}</details></>}
    </section><aside className="checkout-card checkout-summary"><h2>ทุกค่าใช้จ่าย ชัดเจนก่อนจอง</h2><Amounts quote={quote}/><details className="checkout-rate-detail"><summary>ดูราคาของแต่ละชั่วโมง</summary>{quote.lines.map(l=><div key={l.hour}><span>{hour(l.hour)}–{hour(l.hour+1)}</span><span>฿{money(l.amount/100)}</span></div>)}</details><p className="checkout-note"><ShieldCheck size={18}/>ราคาตรวจใหม่จากเซิร์ฟเวอร์ก่อนทดลองชำระ ใบเสนอราคามีอายุ 10 นาที</p><p className="checkout-note">ช่วงเวลายังไม่ถูกล็อก ระบบจริงต้องตรวจการจองซ้ำและรอเจ้าของยืนยันอีกครั้ง</p></aside></div>}</>}
    {error&&<div className="checkout-error" role="alert" ref={errorArea} tabIndex={-1}><AlertCircle size={19}/><div><p>{error}</p>{!receipt&&<button className="text-link" onClick={()=>setRetry(v=>v+1)}>ตรวจราคาอีกครั้ง</button>}</div></div>}
  </div>;
}
