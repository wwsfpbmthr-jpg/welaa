'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {AlertCircle,CheckCircle2,Clock,Loader2,RotateCcw} from 'lucide-react';
import {hour,money} from './data';
type Result={status:'paid'|'pending'|'expired';id:string;title:string;total:number;date:string;start:number;end:number;guests:number;listingId:string;method:'card'|'promptpay'};
export default function PaymentReturn({sessionId}:{sessionId:string}) {
  const [result,setResult]=useState<Result|null>(null),[error,setError]=useState(''),[checking,setChecking]=useState(true),[retry,setRetry]=useState(0);
  const title=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{
    const abort=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined,checks=0;
    async function check(){
      try{
        const response=await fetch('/api/payments/status?session_id='+encodeURIComponent(sessionId),{signal:abort.signal,cache:'no-store'});
        const data=await response.json();
        if(!response.ok)throw new Error(data.error||'ตรวจผลชำระเงินไม่สำเร็จ');
        if(abort.signal.aborted)return;
        setResult(data);setError('');setChecking(false);
        if(data.status==='pending'&&++checks<15)timer=setTimeout(()=>void check(),3000);
      }catch(e){if(!abort.signal.aborted){setError((e as Error).message);setChecking(false)}}
    }
    // Start a cancellable server status check when the receipt URL changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecking(true);setResult(null);setError('');void check();title.current?.focus();
    return()=>{abort.abort();clearTimeout(timer)};
  },[sessionId,retry]);
  return <section className="checkout-card payment-return"><div className="payment-result-icon">{checking?<Loader2 className="spin"/>:error||result?.status==='expired'?<AlertCircle/>:result?.status==='paid'?<CheckCircle2/>:<Clock/>}</div><h1 ref={title} tabIndex={-1}>{checking?'กำลังตรวจผลกับ Stripe':error?'ยังตรวจผลไม่ได้':result?.status==='paid'?'ชำระเงินทดสอบสำเร็จ':result?.status==='expired'?'รายการชำระเงินหมดอายุ':'กำลังรอผลชำระเงิน'}</h1><p className="checkout-lead">{error||'รายการนี้เป็นโหมดทดสอบ ไม่มีการตัดเงินจริงหรือยืนยันการจองพื้นที่'}</p>{result&&<><div className="payment-return-summary"><h2>{result.title}</h2><p>{result.date} · {hour(result.start)}–{hour(result.end)} · {result.guests} คน</p><p>{result.method==='promptpay'?'พร้อมเพย์':'บัตรเครดิต / เดบิต'} · <b>฿{money(result.total/100)}</b></p></div>{result.status==='pending'&&<p className="checkout-note">หากทำรายการใน Stripe แล้ว กรุณารอการยืนยัน ยอดชำระจะตรวจจาก Stripe โดยตรง</p>}{result.status==='expired'&&<p className="checkout-note">กลับไปเลือกเวลาเพื่อตรวจราคาและเริ่มรายการใหม่</p>}</>}{!checking&&(error||result?.status==='pending')&&<button className="button secondary" onClick={()=>setRetry(v=>v+1)}><RotateCcw size={17}/>ตรวจผลอีกครั้ง</button>}<div className="payment-return-links">{result&&<Link className="button secondary" href={'/spaces/'+result.listingId}>กลับไปดูพื้นที่</Link>}<Link className="button" href="/search">ค้นหาพื้นที่</Link></div></section>;
}
