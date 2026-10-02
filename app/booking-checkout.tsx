'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {ArrowLeft,CalendarDays,Clock,Users,CreditCard,QrCode,ShieldCheck,CheckCircle2,Loader2} from 'lucide-react';
import {useApp} from './context';
import {money,hour,thaiDate} from './data';
import type {Quote,Selection} from '@/lib/booking';
import {selectionParams} from './reservation';

async function fetchQuote(selection:Selection,signal?:AbortSignal):Promise<Quote> {
  const response=await fetch('/api/booking/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(selection),signal});
  const body=await response.json();
  if(!response.ok)throw new Error(body.error||'ตรวจราคาไม่สำเร็จ');
  return body.quote;
}
export default function BookingCheckout(){
  const params=useSearchParams(),query=params.toString();
  const {data,all,auth,authReady,ready,act,go,refresh,previewMode}=useApp();
  const [quote,setQuote]=useState<Quote|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[agree,setAgree]=useState(false),[retry,setRetry]=useState(0);
  const inFlight=useRef(false),revision=useRef(0);
  const bookingId=params.get('booking');
  const booking=data.bookings.find(b=>b.id===bookingId&&b.user_id===data.user?.id);
  const listingId=booking?.space_id||params.get('listingId')||'';
  const space=all.find(s=>s.id===listingId);
  const selection:Selection={listingId,date:params.get('date')||'',start:Number(params.get('start')),end:Number(params.get('end')),guests:Number(params.get('guests')),hypothetical:false};
  const back=listingId?'/spaces/'+listingId+'?'+selectionParams(selection):'/search';
  useEffect(()=>{
    const abort=new AbortController(),current=++revision.current;
    setError('');setQuote(null);setAgree(false);setLoading(!bookingId);
    if(!bookingId)fetchQuote(selection,abort.signal).then(q=>{if(revision.current===current)setQuote(q)}).catch(e=>{if(!abort.signal.aborted)setError(e.message)}).finally(()=>{if(!abort.signal.aborted)setLoading(false)});
    return()=>{abort.abort();revision.current++};
  },[query,retry,bookingId]);
  async function submit(){
    if(inFlight.current||!quote||!agree)return;
    if(!data.user){auth();return}
    inFlight.current=true;setSaving(true);setError('');const current=revision.current;
    try{
      const latest=await fetchQuote(quote.selection);
      if(current!==revision.current)return;
      if(latest.total!==quote.total){setQuote(latest);setAgree(false);setError('ราคาเปลี่ยน กรุณาตรวจยอดใหม่แล้วกดยืนยันอีกครั้ง');return}
      const result=await act({action:'book',spaceId:latest.selection.listingId,date:latest.selection.date,start:latest.selection.start,end:latest.selection.end,guests:latest.selection.guests,expectedTotal:latest.total/100});
      if(result)go('/checkout?booking='+encodeURIComponent(result.id));
      else {setError('ยังยืนยันคำขอไม่ได้ ลองตรวจรายการจองของคุณก่อนส่งอีกครั้ง');await refresh()}
    }catch(e){if(current===revision.current)setError((e as Error).message)}
    finally{inFlight.current=false;setSaving(false)}
  }
  const paymentNotice=<section className="checkout-card payment-readiness"><h2>การชำระเงิน</h2><div className="payment-available-methods"><div><CreditCard size={23}/><b>บัตรเครดิต / เดบิต</b><small>ยังไม่เปิดรับชำระ</small></div><div><QrCode size={23}/><b>พร้อมเพย์</b><small>ยังไม่เปิดรับชำระ</small></div></div><p className="checkout-hint">ขณะนี้ส่งคำขอให้เจ้าของพิจารณาได้ แต่ยังไม่รับชำระเงินจริง จึงไม่มีการตัดบัตรหรือ QR ให้โอนเงิน</p>{previewMode&&quote&&<Link className="text-link" href={'/checkout/test?'+selectionParams({...quote.selection,hypothetical:true})}>ทดลองเลือกบัตรหรือพร้อมเพย์โดยไม่จ่ายเงินจริง</Link>}</section>;
  if(bookingId)return <div className="page checkout-page"><Link className="row small" href="/account?tab=bookings"><ArrowLeft size={17}/>การจองของฉัน</Link>{!authReady||(!ready&&data.user)?<p role="status">กำลังตรวจรายการ…</p>:!data.user?<section className="checkout-card"><h1>เข้าสู่ระบบเพื่อดูคำขอจอง</h1><button className="button" onClick={()=>auth()}>เข้าสู่ระบบ</button></section>:!booking?<section className="checkout-card"><h1>ไม่พบคำขอจองในบัญชีนี้</h1><Link className="button" href="/account?tab=bookings">ดูรายการของฉัน</Link></section>:<><div className="booking-result-heading"><CheckCircle2 size={30}/><div><h1>{booking.status==='pending'?'ส่งคำขอจองแล้ว':booking.status==='confirmed'?'เจ้าของตอบรับแล้ว':booking.status==='rejected'?'เจ้าของปฏิเสธคำขอ':'ยกเลิกคำขอแล้ว'}</h1><p>{booking.status==='pending'?'รอเจ้าของพื้นที่ตอบรับ ติดตามได้จากการจองของฉัน':booking.status==='confirmed'?'เจ้าของยอมรับช่วงเวลานี้แล้ว ยังไม่มีการชำระเงิน':'ช่วงเวลานี้ไม่ได้ถูกจองด้วยคำขอนี้แล้ว'}</p></div></div><div className="checkout-layout"><section className="checkout-card"><h2>{space?.name||'รายละเอียดคำขอ'}</h2><p className="receipt-id">หมายเลขคำขอ {booking.id}</p><div className="checkout-selection"><span><CalendarDays size={18}/>{thaiDate(booking.date)}</span><span><Clock size={18}/>{hour(booking.start)}–{hour(booking.end)}</span><span><Users size={18}/>{booking.guests} คน</span></div><div className="price-breakdown"><div><span>ค่าพื้นที่</span><b>฿{money(booking.subtotal)}</b></div><div><span>ค่าบริการ</span><b>฿{money(booking.fee)}</b></div><div className="total"><b>ยอดรวม</b><b>฿{money(booking.total)}</b></div></div><p className="checkout-note">สถานะการชำระเงิน: ยังไม่มีการรับชำระ</p><Link className="button full" href="/account?tab=bookings">จัดการคำขอจอง</Link></section>{paymentNotice}</div></> }</div>;
  return <div className="page checkout-page customer-checkout"><Link className="row small" href={back}><ArrowLeft size={17}/>แก้ไขวันและเวลา</Link><ol className="checkout-steps"><li className="done">1 · เลือกวันเวลา</li><li className="active" aria-current="step">2 · ตรวจสอบและส่งคำขอ</li><li>3 · เจ้าของตอบรับ</li></ol><h1>ตรวจสอบการจอง</h1><p className="checkout-lead">รายละเอียด ราคา และการชำระเงินในหน้าเดียว</p>{loading?<div className="checkout-card checkout-loading" role="status"><Loader2 className="spin" size={20}/>กำลังตรวจเวลาว่างและราคา…</div>:quote&&<div className="checkout-layout"><div className="checkout-main"><section className="checkout-card"><div className="checkout-property">{space?.image&&<img src={space.image} width={96} height={88} alt={quote.title}/>}<div><small>{space?.city}</small><h2>{quote.title}</h2><Link href={back}>แก้ไขรายละเอียด</Link></div></div><div className="checkout-selection"><span><CalendarDays size={18}/>{thaiDate(quote.selection.date)}</span><span><Clock size={18}/>{hour(quote.selection.start)}–{hour(quote.selection.end)} · {quote.selection.end-quote.selection.start} ชั่วโมง</span><span><Users size={18}/>{quote.selection.guests} คน</span></div><details className="checkout-policy"><summary>กฎพื้นที่และการยกเลิก</summary><p>{space?.rules||'กรุณาตรวจรายละเอียดกับเจ้าของพื้นที่'}</p><p>ยกเลิกคำขอได้ก่อนเริ่มใช้งานจากการจองของฉัน ขณะนี้ยังไม่มีการเรียกเก็บหรือคืนเงินจริง</p></details></section>{paymentNotice}</div><aside className="checkout-card checkout-summary"><h2>สรุปค่าใช้จ่าย</h2><div className="checkout-amounts"><div><span>ค่าพื้นที่ · {quote.lines.length} ชั่วโมง</span><b>฿{money(quote.subtotal/100)}</b></div><div><span>ค่าบริการ 8%</span><b>฿{money(quote.fee/100)}</b></div><div className="checkout-total"><b>ยอดรวม</b><strong>฿{money(quote.total/100)}</strong></div></div><p className="checkout-note"><ShieldCheck size={18}/>ส่งคำขอจองโดยยังไม่ชำระเงิน</p><label className="native-check checkout-consent"><input type="checkbox" checked={agree} disabled={saving} onChange={e=>setAgree(e.target.checked)}/><span>ตรวจวันเวลา จำนวนคน และยอมรับกฎพื้นที่แล้ว</span></label>{data.user?<button className="button full" disabled={!agree||saving||space?.owner===data.user.id} onClick={()=>void submit()}>{saving?'กำลังส่งคำขอ…':space?.owner===data.user.id?'ไม่สามารถจองพื้นที่ของตัวเอง':'ส่งคำขอจอง'}</button>:<button className="button full" disabled={!authReady} onClick={()=>auth()}>เข้าสู่ระบบเพื่อจองต่อ</button>}<p className="small muted mt">{data.user?'เจ้าของต้องตอบรับก่อน การส่งคำขอไม่ใช่หลักฐานการชำระเงิน':'วันเวลาและจำนวนคนที่เลือกจะยังอยู่หลังเข้าสู่ระบบ'}</p></aside></div>}{error&&<div className="checkout-error" role="alert"><div><p>{error}</p><div className="row wrap mt"><button className="text-link" onClick={()=>setRetry(v=>v+1)}>ตรวจราคาอีกครั้ง</button><Link className="text-link" href={back}>เลือกเวลาใหม่</Link><Link className="text-link" href="/account?tab=bookings">ดูคำขอของฉัน</Link></div></div></div>}</div>;
}
