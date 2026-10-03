'use client';

import { PaymentMark } from './payment-mark';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, CreditCard, QrCode, Loader2, ShieldCheck } from 'lucide-react';
import { useApp } from './context';
import { Empty } from './ui';
import { hour, isPast, money, thaiDate } from './data';

export function ReservationPayment({ id }: { id: string }) {
  const { data, all, ready, authReady, auth, act, busy } = useApp();
  const [method, setMethod] = useState<'card' | 'promptpay'>('card');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const booking = data.bookings.find(b => b.id === id && b.user_id === data.user?.id);
  const space = all.find(s => s.id === booking?.space_id);
  if (!authReady || !ready) return <div className="page"><p role="status">กำลังโหลดการจอง…</p></div>;
  if (!data.user) return <div className="page"><Empty title="เข้าสู่ระบบเพื่อชำระเงิน"><button className="button" onClick={() => auth()}>เข้าสู่ระบบ</button></Empty></div>;
  if (!booking || !space) return <div className="page"><Empty title="ไม่พบการจองนี้"><Link className="button" href="/account">กลับไปการจองของฉัน</Link></Empty></div>;
  const payment = booking.payment;
  const paid = !!payment || !!receipt;
  const cancelled = booking.status === 'cancelled' || booking.status === 'rejected';
  const eligible = booking.status === 'confirmed' && !isPast(booking.date, booking.start) && !paid;
  async function pay() {
    if (inFlight.current || busy || !eligible) return;
    inFlight.current = true;
    setSubmitting(true);
    setError('');
    try {
      const result = await act({ action: 'pay-demo', id, method });
      if (result?.id) setReceipt(result.id);
      else setError('บันทึกการชำระไม่สำเร็จ กรุณาลองอีกครั้ง หากเจ้าของเปลี่ยนสถานะรายการ ให้กลับไปตรวจสอบการจอง');
    } finally { inFlight.current = false; setSubmitting(false); }
  }
  return <div className="page checkout-page reservation-payment">
    <Link className="row small" href="/account?tab=bookings"><ArrowLeft size={17}/>การจองของฉัน</Link>
    <div className="checkout-heading"><span className="pill">โหมดทดสอบ · ไม่มีการตัดเงินจริง</span><h1>{paid ? 'ชำระเงินทดสอบสำเร็จ' : 'ชำระเงินสำหรับการจอง'}</h1><p className="muted">{paid ? 'บันทึกรายการแล้ว ทั้งคุณและเจ้าของพื้นที่ดูสถานะนี้ได้' : 'ตรวจสอบการจอง แล้วเลือกวิธีชำระเงิน'}</p></div>
    <div className="checkout-layout"><section className="outline-panel stack">
      <div className="checkout-space"><Image src={space.image} alt={space.name} width={100} height={100} unoptimized/><div><h2>{space.name}</h2><p>{space.area}, {space.city}</p></div></div>
      <dl className="checkout-details"><div><dt>วันที่</dt><dd>{thaiDate(booking.date)}</dd></div><div><dt>เวลา</dt><dd>{hour(booking.start)}–{hour(booking.end)} ({booking.end-booking.start} ชั่วโมง)</dd></div><div><dt>ผู้ใช้งาน</dt><dd>{booking.guests} คน</dd></div><div><dt>รหัสการจอง</dt><dd>{booking.id.slice(0,8).toUpperCase()}</dd></div></dl>
      <div className="price-breakdown"><div><span>ค่าพื้นที่</span><b>฿{money(booking.subtotal)}</b></div><div><span>ค่าบริการ</span><b>฿{money(booking.fee)}</b></div><div className="total"><b>ยอดรวม</b><b>฿{money(booking.total)}</b></div></div>
      <p className="small muted">เจ้าของอนุมัติ → ชำระเงิน → ดูรายละเอียดการจอง</p>
    </section><section className="outline-panel stack">
      {paid ? <><div className="success-icon"><Check/></div><h2>{cancelled ? 'การจองถูกยกเลิก' : 'ชำระเงินแล้ว (ทดสอบ)'}</h2><p>วิธีชำระ: {(payment?.method || method) === 'card' ? 'บัตรเครดิต / เดบิต' : 'พร้อมเพย์'}</p><p className="small muted checkout-reference">เลขอ้างอิง {payment?.id || receipt}</p><p className="notice">{cancelled ? 'ไม่มีการคืนเงินจริง เพราะรายการนี้เป็นการทดสอบ' : 'รายการนี้เป็นการทดสอบ ไม่มีการตัดบัตรหรือโอนเงินจริง'}</p><Link className="button full" href="/account?tab=bookings">ดูการจองของฉัน</Link></> : !eligible ? <><h2>{booking.status === 'pending' ? 'รอเจ้าของอนุมัติ' : cancelled ? 'การจองนี้ถูกยกเลิกหรือปฏิเสธแล้ว' : 'พ้นเวลาชำระเงินแล้ว'}</h2><p className="muted">{booking.status === 'pending' ? 'เมื่อเจ้าของอนุมัติ ปุ่มชำระเงินจะปรากฏในการจองของฉัน' : 'รายการนี้ไม่สามารถชำระเงินได้'}</p><Link className="button secondary" href="/account">กลับไปการจอง</Link></> : <>
        <h2>เลือกวิธีชำระเงิน</h2>
        <fieldset className="payment-methods"><legend className="sr-only">วิธีชำระเงิน</legend>{(['card','promptpay'] as const).map(value => <label key={value} className={'payment-method '+(method===value?'selected':'')}><input type="radio" name="payment-method" value={value} checked={method===value} onChange={() => {setMethod(value);setError('');}}/><PaymentMark method={value}/><span><b>{value==='card'?'บัตรเครดิต / เดบิต':'พร้อมเพย์'}</b><small>{value==='card'?'บัตรเครดิตและบัตรเดบิต':'สแกน QR ด้วยแอปธนาคาร'}</small></span></label>)}</fieldset>
        {method==='card' ? <div className="test-payment-panel"><CreditCard size={28}/><b>บัตรทดสอบ •••• 4242</b><p>ใช้บัตรตัวอย่างนี้เพื่อทดลองขั้นตอน ไม่ต้องกรอกข้อมูลบัตรจริง</p></div> : <div className="test-payment-panel"><QrCode size={58}/><b>พร้อมเพย์โหมดทดสอบ</b><p>เมื่อเชื่อมผู้ให้บริการ ระบบจะแสดง QR สำหรับยอดนี้ ตอนนี้กดปุ่มด้านล่างเพื่อจำลองการจ่ายสำเร็จ</p></div>}
        {error && <p className="notice" role="alert">{error}</p>}
        <button className="button full" disabled={busy || submitting} onClick={() => void pay()}>{submitting?<Loader2 className="spin" size={18}/>:<ShieldCheck size={18}/>} {submitting?'กำลังบันทึก…':`ชำระเงินทดสอบ ฿${money(booking.total)}`}</button>
        <p className="small muted">ไม่มีการรับเงินหรือเก็บข้อมูลบัตรจริง</p>
      </>}
    </section></div>
  </div>;
}
