'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {Activity,ArrowLeft,Building2,CalendarDays,Check,ChevronRight,ClipboardList,Flag,LayoutDashboard,Loader2,RefreshCw,ShieldCheck,Users} from 'lucide-react';
import {toast} from 'sonner';
import {useApp} from './context';
import {money,thaiDate,hour} from './data';
import {supabase} from '@/lib/supabase/client';

type AdminTab='overview'|'listings'|'members'|'bookings'|'reports'|'activity';
type Listing=Record<string,any>;
type Profile=Record<string,any>;
type Booking=Record<string,any>;
type Report=Record<string,any>;
type Audit=Record<string,any>;
const db=supabase as any;
const tabs:{id:AdminTab;label:string;icon:typeof LayoutDashboard}[]=[
  {id:'overview',label:'ภาพรวม',icon:LayoutDashboard},{id:'listings',label:'ประกาศ',icon:Building2},{id:'members',label:'สมาชิก',icon:Users},{id:'bookings',label:'การจอง',icon:CalendarDays},{id:'reports',label:'รายงาน',icon:Flag},{id:'activity',label:'ประวัติ',icon:Activity},
];
const reasonLabel:Record<string,string>={misleading:'ข้อมูลไม่ตรงจริง',unsafe:'ความปลอดภัย',unauthorized:'สงสัยว่าไม่มีสิทธิ์ให้เช่า',other:'อื่น ๆ'};
const statusLabel:Record<string,string>={published:'เผยแพร่แล้ว',archived:'ซ่อนประกาศ',draft:'ฉบับร่าง',open:'รอตรวจ',reviewed:'ตรวจแล้ว',dismissed:'ปิดเรื่อง',pending:'รอยืนยัน',confirmed:'ยืนยันแล้ว',cancelled:'ยกเลิก',completed:'เสร็จสิ้น'};

export function Admin(){
  const {data,authReady,auth,go}=useApp();
  const [allowed,setAllowed]=useState<boolean|null>(null),[loading,setLoading]=useState(false),[tab,setTab]=useState<AdminTab>('overview'),[query,setQuery]=useState(''),[ownerFilter,setOwnerFilter]=useState('');
  const [listings,setListings]=useState<Listing[]>([]),[members,setMembers]=useState<Profile[]>([]),[bookings,setBookings]=useState<Booking[]>([]),[reports,setReports]=useState<Report[]>([]),[audit,setAudit]=useState<Audit[]>([]);

  const loadData=useCallback(async()=>{
    setLoading(true);
    try{
      const [l,m,b,r,a]=await Promise.all([
        db.from('listings').select('*').order('created_at',{ascending:false}).limit(300),
        db.from('profiles').select('id,display_name,avatar_path,created_at').order('created_at',{ascending:false}).limit(300),
        db.from('bookings').select('*').order('created_at',{ascending:false}).limit(300),
        db.from('listing_reports').select('*').order('created_at',{ascending:false}).limit(300),
        db.from('admin_audit_logs').select('*').order('created_at',{ascending:false}).limit(50),
      ]);
      const err=[l,m,b,r,a].find(x=>x.error)?.error;if(err)throw err;
      setListings(l.data??[]);setMembers(m.data??[]);setBookings(b.data??[]);setReports(r.data??[]);setAudit(a.data??[]);
    }catch(e:any){toast.error(e?.message||'โหลดข้อมูล Admin ไม่สำเร็จ')}
    finally{setLoading(false)}
  },[]);

  useEffect(()=>{
    let active=true;
    if(!authReady)return;
    if(!data.user){setAllowed(false);return}
    setAllowed(null);
    (async()=>{
      const {data:row,error}=await db.from('admin_members').select('user_id').eq('user_id',data.user.id).maybeSingle();
      if(!active)return;
      if(error){setAllowed(false);toast.error('ตรวจสิทธิ์ Admin ไม่สำเร็จ');return}
      const isAdmin=!!row;setAllowed(isAdmin);if(isAdmin)void loadData();
    })();
    return()=>{active=false};
  },[authReady,data.user?.id,loadData]);

  const memberById=useMemo(()=>new Map(members.map(m=>[m.id,m])),[members]);
  const listingById=useMemo(()=>new Map(listings.map(l=>[l.id,l])),[listings]);
  const pendingReports=reports.filter(r=>r.status==='open').length;
  const visibleListings=listings.filter(l=>!ownerFilter||l.owner_id===ownerFilter).filter(l=>`${l.title} ${l.city} ${l.area} ${memberById.get(l.owner_id)?.display_name||''}`.toLowerCase().includes(query.toLowerCase()));

  async function setListingStatus(item:Listing,status:'published'|'archived'){
    const {error}=await db.rpc('admin_set_listing_status',{p_listing_id:item.id,p_status:status});
    if(error){toast.error(error.message||'เปลี่ยนสถานะไม่สำเร็จ');return}
    toast.success(status==='archived'?'ซ่อนประกาศแล้ว':'นำประกาศกลับมาแสดงแล้ว');await loadData();
  }
  async function setReportStatus(item:Report,status:'open'|'reviewed'|'dismissed'){
    const {error}=await db.rpc('admin_set_report_status',{p_report_id:item.id,p_status:status});
    if(error){toast.error(error.message||'อัปเดตรายงานไม่สำเร็จ');return}
    toast.success(status==='open'?'เปิดรายงานอีกครั้ง':'อัปเดตรายงานแล้ว');await loadData();
  }
  function showMemberListings(id:string){setOwnerFilter(id);setQuery('');setTab('listings')}

  if(!authReady||allowed===null)return <div className="page admin-state"><Loader2 className="spin"/><p>กำลังตรวจสิทธิ์ผู้ดูแล…</p></div>;
  if(!data.user)return <div className="page admin-state"><ShieldCheck size={42}/><h1>เข้าสู่ระบบ CEO</h1><p>ใช้บัญชี CEO WELAA เพื่อเปิดศูนย์จัดการ</p><button className="button" onClick={()=>auth()}>เข้าสู่ระบบ</button></div>;
  if(!allowed)return <div className="page admin-state"><ShieldCheck size={42}/><h1>ไม่มีสิทธิ์เข้าถึง</h1><p>บัญชีนี้ไม่ได้รับสิทธิ์ผู้ดูแลระบบ</p><button className="button secondary" onClick={()=>go('/')}>กลับหน้า WELAA</button></div>;

  return <div className="page admin-page">
    <div className="admin-heading"><div><div className="eyebrow">WELAA · CONTROL ROOM</div><h1>ศูนย์จัดการ</h1><p>สวัสดี {data.user.name} · CEO</p></div><div className="row"><button className="button secondary" onClick={()=>void loadData()} disabled={loading}><RefreshCw size={16} className={loading?'spin':''}/>รีเฟรช</button><Link className="button secondary" href="/"><ArrowLeft size={16}/>กลับหน้าเว็บ</Link></div></div>
    <nav className="admin-tabs" aria-label="เมนูศูนย์จัดการ">{tabs.map(t=><button key={t.id} className={tab===t.id?'active':''} onClick={()=>{setTab(t.id);setOwnerFilter('');setQuery('')}}><t.icon size={17}/>{t.label}{t.id==='reports'&&pendingReports>0&&<i>{pendingReports}</i>}</button>)}</nav>
    {tab==='overview'&&<section className="admin-content"><div className="admin-welcome"><div><span className="admin-tag"><ShieldCheck size={15}/>บัญชี CEO · สิทธิ์ผู้ดูแลเต็ม</span><h2>ภาพรวม WELAA</h2><p>ตรวจสถานะประกาศ สมาชิก การจอง และเรื่องที่ต้องติดตาม</p></div><button className="button" onClick={()=>setTab('listings')}>จัดการประกาศ<ChevronRight size={16}/></button></div><div className="admin-stats">
      <button onClick={()=>setTab('listings')}><span><Building2/></span><small>ประกาศทั้งหมด</small><b>{listings.length}</b><em>{listings.filter(x=>x.status==='published').length} กำลังแสดง</em></button>
      <button onClick={()=>setTab('members')}><span><Users/></span><small>สมาชิก</small><b>{members.length}</b><em>บัญชีที่ลงทะเบียน</em></button>
      <button onClick={()=>setTab('bookings')}><span><CalendarDays/></span><small>การจอง</small><b>{bookings.length}</b><em>ระบบยังไม่รับเงินจริง</em></button>
      <button onClick={()=>setTab('reports')}><span><Flag/></span><small>รายงานที่รอตรวจ</small><b>{pendingReports}</b><em>{pendingReports?'ต้องติดตาม':'ไม่มีเรื่องค้าง'}</em></button>
    </div><div className="admin-lower"><div className="admin-panel"><div className="row between"><h3>ประกาศล่าสุด</h3><button className="admin-text-button" onClick={()=>setTab('listings')}>ดูทั้งหมด <ChevronRight size={15}/></button></div>{listings.slice(0,5).map(l=><div className="admin-mini-row" key={l.id}><span className="admin-mini-icon"><Building2 size={17}/></span><span><b>{l.title}</b><small>{l.area} · {l.city}</small></span><i className={'admin-status '+l.status}>{statusLabel[l.status]||l.status}</i></div>)}{!listings.length&&<p className="admin-empty">ยังไม่มีประกาศ</p>}</div><div className="admin-panel"><div className="row between"><h3>รายงานล่าสุด</h3><button className="admin-text-button" onClick={()=>setTab('reports')}>ดูทั้งหมด <ChevronRight size={15}/></button></div>{reports.filter(r=>r.status==='open').slice(0,5).map(r=><div className="admin-mini-row" key={r.id}><span className="admin-mini-icon warn"><Flag size={17}/></span><span><b>{listingById.get(r.listing_id)?.title||'พื้นที่ที่ถูกแจ้ง'}</b><small>{reasonLabel[r.reason]||r.reason} · {new Date(r.created_at).toLocaleDateString('th-TH')}</small></span><i className="admin-status open">รอตรวจ</i></div>)}{!pendingReports&&<p className="admin-empty">ไม่มีรายงานที่รอตรวจ</p>}</div></div><p className="admin-note">สิทธิ์ผู้ดูแลจำกัดอยู่ที่บัญชี CEO ที่ได้รับอนุญาตในฐานข้อมูล การเปลี่ยนสถานะทุกครั้งจะถูกบันทึกในประวัติ</p></section>}

    {tab==='listings'&&<section className="admin-content"><div className="admin-section-heading"><div><h2>จัดการประกาศ</h2><p>{ownerFilter?'กำลังแสดงประกาศของสมาชิกที่เลือก':'ตรวจสอบและซ่อนประกาศที่มีปัญหา'}</p></div>{ownerFilter&&<button className="button secondary" onClick={()=>setOwnerFilter('')}>แสดงสมาชิกทั้งหมด</button>}</div><input className="admin-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาชื่อพื้นที่ เมือง หรือเจ้าของ" aria-label="ค้นหาประกาศ"/><div className="admin-list">{visibleListings.map(l=><article className="admin-record" key={l.id}><div className="admin-record-main"><div className="admin-record-image">{l.image_paths?.[0]?<img src={supabase.storage.from('listing-images').getPublicUrl(l.image_paths[0]).data.publicUrl} alt=""/>:<Building2/>}</div><div className="admin-record-copy"><div className="row wrap"><h3>{l.title}</h3><i className={'admin-status '+l.status}>{statusLabel[l.status]||l.status}</i></div><p>{l.area} · {l.city} · {l.type}</p><small>เจ้าของ {l.host_display_name||memberById.get(l.owner_id)?.display_name||'สมาชิก'} · {money(l.hourly_price)} บาท/ชม. · {l.guest_limit} คน</small><small>ลงเมื่อ {new Date(l.created_at).toLocaleDateString('th-TH')} · รหัส {l.id.slice(0,8)}</small></div></div><div className="admin-record-actions">{l.status==='published'?<button className="button secondary" onClick={()=>void setListingStatus(l,'archived')}>ซ่อนประกาศ</button>:<button className="button" onClick={()=>void setListingStatus(l,'published')}>นำกลับมาแสดง</button>}<Link className="admin-text-button" href={'/spaces/'+l.id} target="_blank">ดูหน้าประกาศ <ChevronRight size={15}/></Link></div></article>)}{!visibleListings.length&&<div className="admin-empty">ไม่พบประกาศ</div>}</div></section>}

    {tab==='members'&&<section className="admin-content"><div className="admin-section-heading"><div><h2>สมาชิก</h2><p>ดูบัญชีและประกาศของสมาชิก โดยแสดงเฉพาะข้อมูลที่จำเป็น</p></div></div><input className="admin-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาชื่อสมาชิกหรือรหัสบัญชี" aria-label="ค้นหาสมาชิก"/><div className="admin-list">{members.filter(m=>`${m.display_name||''} ${m.id}`.toLowerCase().includes(query.toLowerCase())).map(m=>{const own=listings.filter(l=>l.owner_id===m.id);const active=own.filter(l=>l.status==='published').length;return <article className="admin-member" key={m.id}><span className="admin-member-avatar">{(m.display_name||'ส').slice(0,1)}</span><div className="admin-member-info"><b>{m.display_name||'สมาชิก WELAA'}</b><small>สมาชิกตั้งแต่ {new Date(m.created_at).toLocaleDateString('th-TH')} · ID {m.id.slice(0,8)}</small><small>{own.length} ประกาศ · แสดงอยู่ {active}</small></div><button className="button secondary" onClick={()=>showMemberListings(m.id)}>ดูประกาศ</button></article>})}{!members.length&&<div className="admin-empty">ยังไม่มีสมาชิก</div>}</div></section>}

    {tab==='bookings'&&<section className="admin-content"><div className="admin-section-heading"><div><h2>การจอง</h2><p>ตรวจสอบสถานะการจองและคู่สัญญา · ไม่มีการรับหรือคืนเงินจริงในรุ่นนี้</p></div></div><div className="admin-list">{bookings.map(b=><article className="admin-booking" key={b.id}><div className="row between wrap"><div><b>{listingById.get(b.listing_id)?.title||'พื้นที่'}</b><small>ผู้จอง {memberById.get(b.renter_id)?.display_name||b.renter_id.slice(0,8)} · เจ้าของ {memberById.get(listingById.get(b.listing_id)?.owner_id)?.display_name||'—'}</small></div><i className={'admin-status '+b.status}>{statusLabel[b.status]||b.status}</i></div><div className="admin-booking-meta"><span>{thaiDate(b.booking_date)} · {hour(b.start_hour)}–{hour(b.end_hour)}</span><span>{b.guest_count} คน</span><b>฿{money(b.total)} <small>จำลอง</small></b></div><small>รหัส {b.id.slice(0,8)} · สร้าง {new Date(b.created_at).toLocaleString('th-TH')}</small></article>)}{!bookings.length&&<div className="admin-empty"><CalendarDays size={26}/><b>ยังไม่มีการจอง</b><span>การจองใหม่จะแสดงที่นี่</span></div>}</div></section>}

    {tab==='reports'&&<section className="admin-content"><div className="admin-section-heading"><div><h2>รายงานจากสมาชิก</h2><p>ตรวจเหตุผลและรายละเอียด แล้วปิดหรือเปิดเรื่องกลับมาตรวจต่อได้</p></div><select className="admin-select" aria-label="กรองสถานะรายงาน" onChange={e=>setQuery(e.target.value)} value={query||'open'}><option value="open">รอตรวจ</option><option value="reviewed">ตรวจแล้ว</option><option value="dismissed">ปิดเรื่อง</option><option value="all">ทั้งหมด</option></select></div><div className="admin-list">{reports.filter(r=>query==='all'||r.status===(query||'open')).map(r=><article className="admin-report" key={r.id}><div className="row between wrap"><div><i className={'admin-status '+r.status}>{statusLabel[r.status]}</i><h3>{listingById.get(r.listing_id)?.title||'พื้นที่ที่ถูกแจ้ง'}</h3></div><small>{new Date(r.created_at).toLocaleString('th-TH')}</small></div><p><b>เหตุผล:</b> {reasonLabel[r.reason]||r.reason}</p>{r.details&&<p className="admin-report-details">{r.details}</p>}<small>ผู้แจ้ง {memberById.get(r.reporter_id)?.display_name||r.reporter_id.slice(0,8)} · ประกาศ {r.listing_id.slice(0,8)}</small><div className="admin-record-actions"><Link className="admin-text-button" href={'/spaces/'+r.listing_id} target="_blank">ดูประกาศ <ChevronRight size={15}/></Link>{r.status==='open'?<><button className="button secondary" onClick={()=>void setReportStatus(r,'dismissed')}>ปิดรายงาน</button><button className="button" onClick={()=>void setReportStatus(r,'reviewed')}><Check size={15}/>ทำเครื่องหมายตรวจแล้ว</button></>:<button className="button secondary" onClick={()=>void setReportStatus(r,'open')}>เปิดเรื่องอีกครั้ง</button>}</div></article>)}{!reports.filter(r=>query==='all'||r.status===(query||'open')).length&&<div className="admin-empty"><Flag size={26}/><b>ไม่มีรายงานในสถานะนี้</b></div>}</div></section>}

    {tab==='activity'&&<section className="admin-content"><div className="admin-section-heading"><div><h2>ประวัติการจัดการ</h2><p>บันทึกการเปลี่ยนสถานะประกาศและรายงาน</p></div></div><div className="admin-list">{audit.map(a=><article className="admin-audit" key={a.id}><span><Activity size={18}/></span><div><b>{a.action==='listing_status_changed'?'เปลี่ยนสถานะประกาศ':'อัปเดตรายงาน'}</b><small>{a.target_type==='listing'?'ประกาศ':'รายงาน'} {a.target_id.slice(0,8)} · {statusLabel[a.details?.status]||a.details?.status}</small><small>{new Date(a.created_at).toLocaleString('th-TH')} · ผู้ดำเนินการ {a.actor_id===data.user.id?'คุณ':a.actor_id.slice(0,8)}</small></div></article>)}{!audit.length&&<div className="admin-empty"><ClipboardList size={26}/><b>ยังไม่มีประวัติ</b><span>ทุกการจัดการจะถูกบันทึกโดยอัตโนมัติ</span></div>}</div></section>}
  </div>;
}
