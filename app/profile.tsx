'use client';

import Link from 'next/link';
import { CalendarDays, ChevronRight, CircleHelp, Clock3, Heart, House, LogOut, Mail, MessageCircle, Plus, Star, UserRound, type LucideIcon } from 'lucide-react';
import { useApp } from './context';

function ProfileLink({href,icon:Icon,title,sub}: {href:string;icon:LucideIcon;title:string;sub:string}) {
  return <Link className="profile-hub-row" href={href}><Icon/><span><b>{title}</b><small>{sub}</small></span><ChevronRight/></Link>;
}

export function Profile() {
  const {data,authReady,auth,signOut}=useApp();
  if(!authReady) return <div className="page auth-gate" aria-busy="true"><p className="muted">กำลังตรวจสอบบัญชี…</p></div>;
  if(!data.user) return <div className="page profile-page"><section className="profile-hero"><div className="profile-avatar"><UserRound size={29}/></div><div className="profile-welcome"><div className="eyebrow">YOUR WELAA ACCOUNT</div><h1>โปรไฟล์ของคุณ</h1><p>เข้าสู่ระบบเพื่อดูการจอง พื้นที่ที่บันทึก และจัดการบัญชี</p></div><div className="profile-auth-actions"><button className="button profile-login" onClick={()=>auth()}>เข้าสู่ระบบ</button><button className="button profile-register" onClick={()=>auth(true)}>สมัครสมาชิก</button></div></section></div>;

  const name=data.user.name?.trim()||'สมาชิก WELAA';
  const initials=[...name][0]?.toUpperCase()||'W';
  const bookings=data.bookings.filter(b=>b.user_id===data.user?.id);
  const saved=data.favorites.length;

  return <div className="page profile-hub">
    <section className="profile-hub-hero">
      <div className="profile-hub-avatar" aria-hidden="true">{initials}</div>
      <div className="profile-hub-heading"><div className="eyebrow">YOUR WELAA ACCOUNT</div><h1>สวัสดี, {name}</h1><p>{data.user.email}</p></div>
      <div className="profile-hub-shortcuts">
        <Link href="/account?tab=bookings"><CalendarDays/>การจอง</Link>
        <Link href="/account?tab=saved"><Heart/>ที่บันทึก</Link>
      </div>
    </section>

    <div className="profile-hub-counts">
      <Link className="profile-hub-count" href="/account?tab=bookings"><CalendarDays/><span><b>การจองของฉัน</b><small>ดูสถานะและรายละเอียด</small></span><strong>{bookings.length}</strong></Link>
      <Link className="profile-hub-count" href="/account?tab=saved"><Heart/><span><b>พื้นที่ที่บันทึก</b><small>กลับมาดูพื้นที่ที่สนใจ</small></span><strong>{saved}</strong></Link>
    </div>

    <div className="profile-hub-groups">
      <section className="profile-hub-group"><h2>บัญชีของฉัน</h2>
        <ProfileLink href="/account?tab=profile" icon={UserRound} title="ข้อมูลส่วนตัว" sub="ชื่อ เบอร์โทรศัพท์ และแนะนำตัว"/>
        <ProfileLink href="/account?tab=messages" icon={MessageCircle} title="ข้อความ" sub="พูดคุยเกี่ยวกับพื้นที่"/>
        <ProfileLink href="/account?tab=reviews" icon={Star} title="รีวิวของฉัน" sub="ประสบการณ์หลังใช้พื้นที่"/>
      </section>
      <section className="profile-hub-group"><h2>สำหรับเจ้าของพื้นที่</h2>
        <ProfileLink href="/host" icon={House} title="จัดการพื้นที่ของฉัน" sub="รายการพื้นที่และเวลาว่าง"/>
        <ProfileLink href="/host/calendar" icon={Clock3} title="ปฏิทินพื้นที่" sub="จัดการช่วงเวลาและราคา"/>
        <ProfileLink href="/host/new" icon={Plus} title="เพิ่มพื้นที่" sub="เริ่มลงพื้นที่กับ WELAA"/>
      </section>
      <section className="profile-hub-group"><h2>ช่วยเหลือ</h2>
        <ProfileLink href="/how-it-works" icon={CircleHelp} title="วิธีใช้งานและความปลอดภัย" sub="รู้จักการจองและการใช้พื้นที่"/>
        <a className="profile-hub-row" href="mailto:support@welaa.online?subject=WELAA%20Support"><Mail/><span><b>ติดต่อทีมงาน</b><small>ส่งอีเมลถึงฝ่ายช่วยเหลือ</small></span><ChevronRight/></a>
      </section>
      <section className="profile-hub-group"><h2>บัญชีและการตั้งค่า</h2>
        <ProfileLink href="/account?tab=profile" icon={UserRound} title="ตั้งค่าบัญชี" sub="แก้ไขข้อมูลที่แสดงใน WELAA"/>
        <button className="profile-hub-row profile-hub-signout" onClick={()=>void signOut()}><LogOut/><span><b>ออกจากระบบ</b><small>ออกจากบัญชีนี้บนอุปกรณ์</small></span><ChevronRight/></button>
      </section>
    </div>
  </div>;
}
