'use client';
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {ArrowRight,CalendarDays,ShieldCheck,FlaskConical,Clock} from 'lucide-react';
import {useApp} from './context';
import {Space,today,datePlus,hour,money,slotStatus,slotPrice,isPast} from './data';
import type {Selection} from '@/lib/booking';

export function selectionParams(s:Selection) {
  return new URLSearchParams({listingId:s.listingId,date:s.date,start:String(s.start),end:String(s.end),guests:String(s.guests),hypothetical:String(s.hypothetical)}).toString();
}
export function ReservationPanel({space,date,start,end,guests,setDate,setStart,setEnd,setGuests}:{space:Space;date:string;start:number;end:number;guests:string;setDate:(v:string)=>void;setStart:(v:number)=>void;setEnd:(v:number)=>void;setGuests:(v:string)=>void}) {
  const {data,go} = useApp();
  const params=useSearchParams();
  const [hypothetical,setHypothetical]=useState(params.get('hypothetical')==='true');
  const ranges=Array.from({length:Math.max(0,space.close-space.open)},(_,i)=>space.open+i);
  const starts=ranges.filter(h=>!isPast(date,h)&&(hypothetical||slotStatus(space,date,h,data)==='available'));
  const ends=start>=0?ranges.filter(h=>h>=start && ranges.filter(x=>x>=start&&x<=h).every(x=>hypothetical||slotStatus(space,date,x,data)==='available')).map(h=>h+1):[];
  const selected=Array.from({length:Math.max(0,end-start)},(_,i)=>start+i);
  const valid=starts.includes(start)&&ends.includes(end)&&Number(guests)>=1&&Number(guests)<=space.guests&&Number.isInteger(Number(guests));
  const subtotal=selected.reduce((sum,h)=>sum+Math.round((hypothetical?space.price:slotPrice(space,date,h,data))*100),0);
  const estimatedTotal=(subtotal+Math.round(subtotal*.08))/100;
  const nextDates=[...new Set(data.availability.filter(a=>a.space_id===space.id&&a.is_open&&slotStatus(space,a.date,a.hour,data)==='available').map(a=>a.date as string))].sort().slice(0,3);
  function changeDate(v:string){setDate(v);setStart(-1);setEnd(-1)}
  return <div className="booking-panel reservation-panel" id="reservation">
    <div className="reservation-price"><div><strong>฿{money(space.price)}</strong><span> / ชั่วโมง</span></div><span className="preview-tag"><FlaskConical size={13}/> พรีวิว</span></div>
    <p className="reservation-intro">เวลาของคุณ พื้นที่ที่ใช่</p>
    <label className="field">วันที่ใช้งาน<input type="date" aria-label="วันที่ในสรุปการจอง" min={today()} max={datePlus(179)} value={date} onChange={e=>changeDate(e.target.value)}/></label>
    {!hypothetical && nextDates.length>0 && <div className="reservation-dates">{nextDates.map(d=><button key={d} type="button" onClick={()=>changeDate(d)}><CalendarDays size={13}/>{d.slice(8)}/{d.slice(5,7)}</button>)}</div>}
    <div className="two-col">
      <label className="field">เริ่ม<select aria-label="เวลาเริ่มจอง" value={start<0?'':start} onChange={e=>{setStart(Number(e.target.value));setEnd(Number(e.target.value)+1)}}><option value="" disabled>เลือกเวลา</option>{starts.map(h=><option key={h} value={h}>{hour(h)}</option>)}</select></label>
      <label className="field">สิ้นสุด<select aria-label="เวลาสิ้นสุด" disabled={start<0} value={end<0?'':end} onChange={e=>setEnd(Number(e.target.value))}><option value="" disabled>เลือกเวลา</option>{ends.map(h=><option key={h} value={h}>{hour(h)}</option>)}</select></label>
    </div>
    <label className="field">จำนวนผู้ใช้งาน<input type="number" aria-label="จำนวนผู้ใช้งาน" min={1} max={space.guests} value={guests} onChange={e=>setGuests(e.target.value)}/><small>รองรับได้สูงสุด {space.guests} คน</small></label>
    {!starts.length && !hypothetical && <div className="reservation-empty"><Clock size={18}/><p>ยังไม่มีเวลาที่เปิดในวันนี้<br/><small>เลือกวันอื่น หรือทดลองขั้นตอนด้านล่าง</small></p></div>}
    <div className="reservation-estimate" aria-live="polite"><span>{valid?`${end-start} ชั่วโมง รวมค่าบริการ 8%`:'เลือกเวลาเพื่อดูยอดประมาณการ'}</span>{valid&&<strong>฿{money(estimatedTotal)}</strong>}</div>
    <button className="button full" disabled={!valid} onClick={()=>go('/checkout?'+selectionParams({listingId:space.id,date,start,end,guests:Number(guests),hypothetical}))}>ตรวจราคาและรายละเอียด <ArrowRight size={18}/></button>
    <p className="booking-note"><ShieldCheck size={15}/>ยังไม่เรียกเก็บเงินและไม่ล็อกช่วงเวลา</p>
    <details className="sandbox-options" open={hypothetical||undefined}><summary>ทดลองขั้นตอนการจอง</summary><p>เฉพาะพรีวิว · ใช้ราคาประกาศจริงกับเวลาสมมติ ไม่มีการจองหรือส่งข้อความจริง</p><label className="native-check"><input type="checkbox" checked={hypothetical} onChange={e=>{setHypothetical(e.target.checked);changeDate(datePlus(1));if(e.target.checked){setStart(space.open);setEnd(space.open+1)}}}/>ใช้เวลาสมมติเพื่อทดลอง</label></details>
  </div>;
}
