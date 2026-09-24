'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronRight, Check, CircleHelp, Clock3, Heart, House, Languages, LogOut, Mail, MessageCircle, Plus, Settings, Star, UserRound, type LucideIcon } from 'lucide-react';
import { useApp } from './context';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

function ProfileLink({href,icon:Icon,title,sub}: {href:string;icon:LucideIcon;title:string;sub:string}) {
  return <Link className="profile-hub-row" href={href}><Icon/><span><b>{title}</b><small>{sub}</small></span><ChevronRight/></Link>;
}

export function Profile() {
  const {data,authReady,auth,signOut}=useApp();
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [languageOpen,setLanguageOpen]=useState(false);
  if(!authReady) return <div className="page auth-gate" aria-busy="true"><p className="muted">กำลังตรวจสอบบัญชี…</p></div>;
  if(!data.user) return <div className="page profile-page">
    <section className="profile-hero">
      <div className="profile-avatar"><UserRound size={29}/></div>
      <div className="profile-welcome"><div className="eyebrow">YOUR WELAA ACCOUNT</div><h1>โปรไฟล์ของคุณ</h1><p>เข้าสู่ระบบเพื่อจัดการการจอง พื้นที่ที่บันทึก และบัญชีของคุณ</p></div>
      <div className="profile-auth-actions"><button className="button profile-login" onClick={()=>auth()}>เข้าสู่ระบบ</button><button className="button profile-register" onClick={()=>auth(true)}>สมัครสมาชิก</button></div>
    </section>
    <div className="profile-menu-grid">
      <section className="profile-menu-group"><h2>บัญชีของฉัน</h2>
        <button className="profile-row" onClick={()=>auth()}><CalendarDays/><span><b>การจองของฉัน</b><small>ดูสถานะและรายละเอียดการจอง</small></span><ChevronRight/></button>
        <button className="profile-row" onClick={()=>auth()}><Heart/><span><b>พื้นที่ที่บันทึกไว้</b><small>กลับไปดูพื้นที่ที่คุณสนใจ</small></span><ChevronRight/></button>
        <button className="profile-row" onClick={()=>auth()}><MessageCircle/><span><b>ข้อความ</b><small>พูดคุยกับเจ้าของพื้นที่</small></span><ChevronRight/></button>
      </section>
      <section className="profile-menu-group"><h2>การตั้งค่าและความช่วยเหลือ</h2>
        <button className="profile-row" onClick={()=>setSettingsOpen(true)}><Settings/><span><b>ตั้งค่า</b><small>จัดการภาษาและการตั้งค่าบัญชี</small></span><ChevronRight/></button>
        <button className="profile-row" onClick={()=>setLanguageOpen(true)}><Languages/><span><b>ภาษา</b><small>ภาษาไทย · English เร็ว ๆ นี้</small></span><ChevronRight/></button>
        <Link className="profile-row" href="/how-it-works"><CircleHelp/><span><b>วิธีใช้งานและความปลอดภัย</b><small>รู้จักการจองและการใช้พื้นที่</small></span><ChevronRight/></Link>
        <Link className="profile-row" href="/host/new"><House/><span><b>ปล่อยพื้นที่กับ WELAA</b><small>เริ่มสร้างรายได้จากพื้นที่ว่าง</small></span><ChevronRight/></Link>
      </section>
    </div>
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}><DialogContent><DialogTitle>ตั้งค่า WELAA</DialogTitle><DialogDescription>จัดการการใช้งานบัญชีของคุณ</DialogDescription><button className="profile-row" onClick={()=>{setSettingsOpen(false);setLanguageOpen(true)}}><Languages/><span><b>ภาษา</b><small>ภาษาไทย</small></span><ChevronRight/></button><p className="notice">การแก้ไขข้อมูลส่วนตัวและออกจากระบบจะอยู่ในหน้าโปรไฟล์หลังเข้าสู่ระบบ</p></DialogContent></Dialog>
    <Dialog open={languageOpen} onOpenChange={setLanguageOpen}><DialogContent><DialogTitle>เลือกภาษา</DialogTitle><DialogDescription>เลือกภาษาที่ใช้ใน WELAA</DialogDescription><button className="profile-language-option active" onClick={()=>setLanguageOpen(false)}><span><b>ภาษาไทย</b><small>ใช้งานอยู่</small></span><Check/></button><button className="profile-language-option" disabled><span><b>English</b><small>กำลังเตรียมให้บริการ</small></span></button></DialogContent></Dialog>
  </div>;

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
