'use client';
import {useApp} from './context';
import {Space,today,datePlus,hour,money,slotStatus,isPast} from './data';
import {CalendarDays,Clock,ShieldCheck} from 'lucide-react';
import type {Selection} from '@/lib/booking';
export function selectionParams(s:Selection) {
  return new URLSearchParams({listingId:s.listingId,date:s.date,start:String(s.start),end:String(s.end),guests:String(s.guests),hypothetical:String(s.hypothetical)}).toString();
}
export function ReservationPanel({space,date,start,end,guests,setDate,setStart,setEnd,setGuests}:{space:Space;date:string;start:number;end:number;guests:string;setDate:(v:string)=>void;setStart:(v:number)=>void;setEnd:(v:number)=>void;setGuests:(v:string)=>void}) {
  const {data,go,previewMode,ready}=useApp();
  const ranges=Array.from({length:Math.max(0,space.close-space.open)},(_,i)=>space.open+i);
  const starts=ranges.filter(h=>!isPast(date,h)&&slotStatus(space,date,h,data)==='available');
  const ends=start>=0?ranges.filter(h=>h>=start&&ranges.filter(x=>x>=start&&x<=h).every(x=>slotStatus(space,date,x,data)==='available')).map(h=>h+1):[];
  const valid=starts.includes(start)&&ends.includes(end)&&Number.isInteger(Number(guests))&&Number(guests)>=1&&Number(guests)<=space.guests;
  const selected=data.availability.filter(a=>a.space_id===space.id&&a.date===date&&a.hour>=start&&a.hour<end);
  const subtotal=selected.reduce((sum,a)=>sum+a.price,0),fee=Math.round(subtotal*.08);
  const own=space.owner===data.user?.id;
  const nextDates=[...new Set(data.availability.filter(a=>a.space_id===space.id&&a.is_open&&slotStatus(space,a.date,a.hour,data)==='available').map(a=>a.date as string))].sort().slice(0,4);
  function changeDate(v:string){setDate(v);setStart(-1);setEnd(-1)}
  function proceed(){if(valid&&!own)go('/checkout?'+selectionParams({listingId:space.id,date,start,end,guests:Number(guests),hypothetical:false}))}
  return <section className="booking-panel reservation-panel" id="reservation" aria-label="เลือกวันเวลาและจองพื้นที่">
    <div className="reservation-price"><div><strong>฿{money(space.price)}</strong><span> / ชั่วโมง</span></div><span className="pill"><Clock size={14}/>ขั้นต่ำ 1 ชั่วโมง</span></div>
    <h2>จองพื้นที่นี้</h2>
    <label className="field">วันที่ใช้งาน<input id="reservation-date" type="date" aria-label="วันที่ใช้งาน" min={today()} max={datePlus(179)} value={date} onChange={e=>changeDate(e.target.value)}/></label>
    {nextDates.length>0&&<div className="reservation-dates" aria-label="วันที่มีเวลาว่าง">{nextDates.map(d=><button key={d} type="button" aria-pressed={date===d} onClick={()=>changeDate(d)}><CalendarDays size={14}/>{d.slice(8)}/{d.slice(5,7)}</button>)}</div>}
    <div className="two-col"><label className="field">เริ่ม<select aria-label="เวลาเริ่มจอง" value={starts.includes(start)?start:''} onChange={e=>{setStart(Number(e.target.value));setEnd(Number(e.target.value)+1)}}><option value="" disabled>เลือกเวลา</option>{starts.map(h=><option key={h} value={h}>{hour(h)}</option>)}</select></label><label className="field">สิ้นสุด<select aria-label="เวลาสิ้นสุด" disabled={!starts.includes(start)} value={ends.includes(end)?end:''} onChange={e=>setEnd(Number(e.target.value))}><option value="" disabled>เลือกเวลา</option>{ends.map(h=><option key={h} value={h}>{hour(h)}</option>)}</select></label></div>
    <label className="field">จำนวนคน<input type="number" aria-label="จำนวนผู้ใช้งาน" min={1} max={space.guests} value={guests} onChange={e=>setGuests(e.target.value)}/><small>สูงสุด {space.guests} คน</small></label>
    {!starts.length&&<p className="reservation-empty" role="status">{!ready?'กำลังตรวจเวลาว่าง…':nextDates.length?'วันนี้ไม่มีเวลาว่าง เลือกวันที่ด้านบนได้เลย':'เจ้าของยังไม่ได้เปิดเวลาว่างสำหรับจอง'}</p>}
    {valid&&<div className="price-breakdown" aria-live="polite"><div><span>ค่าพื้นที่ · {end-start} ชั่วโมง</span><b>฿{money(subtotal)}</b></div><div><span>ค่าบริการ 8%</span><b>฿{money(fee)}</b></div><div className="total"><b>รวมทั้งหมด</b><b>฿{money(subtotal+fee)}</b></div></div>}
    {own?<button className="button full" onClick={()=>go('/host/calendar?space='+space.id)}>จัดการเวลาว่างของพื้นที่</button>:<button className="button full" disabled={!valid} onClick={proceed}>ดำเนินการจอง</button>}
    {!valid&&starts.length>0&&<p className="small muted">เลือกเวลาเริ่ม สิ้นสุด และจำนวนคนก่อนดำเนินการ</p>}
    <p className="booking-note"><ShieldCheck size={15}/>ตรวจรายละเอียดและการชำระเงินในหน้าถัดไป</p>
    {previewMode&&<details className="sandbox-options"><summary>ทดลองหน้าชำระเงิน</summary><p>ใช้เวลาสมมติ ไม่ส่งคำขอจองและไม่เรียกเก็บเงิน</p><button className="button secondary full" onClick={()=>go('/checkout/test?'+selectionParams({listingId:space.id,date:datePlus(1),start:space.open,end:space.open+1,guests:1,hypothetical:true}))}>เปิดการชำระเงินทดสอบ</button></details>}
  </section>;
}
