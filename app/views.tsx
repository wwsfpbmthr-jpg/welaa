'use client';
import {useDeferredValue,useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Search,MapPin,Clock,Users,ArrowUpRight,SlidersHorizontal,Map,LayoutGrid,ShieldCheck,ChevronLeft,ChevronRight,ChevronDown,CalendarDays,MessageCircle,X,Building2,Landmark,Mountain,Waves} from 'lucide-react';
import {Slider} from '@/components/ui/slider';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {useApp} from './context';
import {useSlowLoading} from '@/hooks/use-slow-loading';
import {SpaceCard,SectionHead,Categories,Choice,Check,Empty,LoadingDots} from './ui';
import {today,parseSearch,money,hour,slotStatus,instantInfo,cities,types,facilities,normalizeCategory,coordinates} from './data';
export function SearchBox({compact=false,hero=false,onSearch}:{compact?:boolean;hero?:boolean;onSearch?:()=>void}){
  const {go,all}=useApp(),p=useSearchParams();
  const [q,setQ]=useState(p.get('q')||'');
  const [city,setCity]=useState(p.get('city')||'ทั้งหมด');
  const [date,setDate]=useState(p.get('date')||'');
  const [start,setStart]=useState(p.get('start')||'any');
  const [guests,setGuests]=useState(p.get('guests')||'1');
  const [advanced,setAdvanced]=useState(p.has('start')||Number(p.get('guests'))>1);
  const cityOptions=useMemo(()=>{
    const options=[...cities,...new Set(all.map(s=>s.city).filter(c=>c&&!cities.includes(c)))];
    if(city!=='ทั้งหมด'&&!options.includes(city))options.push(city);
    return options;
  },[all,city]);
  function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const x=parseSearch(q),a=new URLSearchParams();
    if(q.trim())a.set('q',q.trim());
    if((x.city||city)!=='ทั้งหมด')a.set('city',x.city||city);
    const cat=x.cat!=='ทั้งหมด'?x.cat:normalizeCategory(p.get('cat')||'ทั้งหมด');
    if(cat!=='ทั้งหมด')a.set('cat',cat);
    if(x.date||date||x.start||start!=='any')a.set('date',x.date||date||today());
    if(x.start||start!=='any')a.set('start',String(x.start||start));
    if(x.duration)a.set('duration',String(x.duration));
    else if(p.has('duration'))a.set('duration',p.get('duration')!);
    a.set('guests',String(x.guests||guests||1));
    onSearch?.();
    go('/search?'+a.toString());
  }
  return <form className={'discovery-search'+(compact?' compact':'')+(hero?' home-discovery-search':'')} onSubmit={submit}>
    <div className="discovery-query"><Search size={21} aria-hidden="true"/><input aria-label="ค้นหาพื้นที่" value={q} onChange={e=>setQ(e.target.value)} placeholder="ห้องประชุม สตูดิโอ หรือพื้นที่จัดกิจกรรม"/></div>
    <div className="discovery-search-main">
      <label className="discovery-field"><span><MapPin size={14}/>สถานที่</span><Choice value={city} onChange={setCity} label="สถานที่" options={[{value:'ทั้งหมด',label:'ทุกเมือง'},...cityOptions]}/></label>
      <label className="discovery-field"><span><CalendarDays size={14}/>วันที่</span><input aria-label="วันที่ค้นหา" type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)}/>{!date&&<small className="date-placeholder" aria-hidden="true">เลือกวันที่</small>}</label>
      <button className="button discovery-submit"><Search size={18}/>ค้นหาพื้นที่</button>
    </div>
    <div className="discovery-search-extra">
      <button type="button" className="search-more" aria-expanded={advanced} aria-controls={compact?'search-options-results':'search-options-home'} onClick={()=>setAdvanced(v=>!v)}><SlidersHorizontal size={14}/>{advanced?'ซ่อนตัวเลือกเพิ่มเติม':'เวลาและจำนวนคน'}<ChevronDown size={14} className={advanced?'rotated':''}/></button>
      <span>เลือกวันภายหลังได้</span>
    </div>
    {advanced&&<div className="discovery-options" id={compact?'search-options-results':'search-options-home'}>
      <label className="discovery-field"><span>ช่วงเวลา</span><Choice value={start} onChange={setStart} label="เวลาเริ่ม" options={[{value:'any',label:'ทุกช่วงเวลา'},...Array.from({length:16},(_,i)=>({value:String(i+8),label:hour(i+8)}))]}/></label>
      <label className="discovery-field"><span>จำนวนคน</span><input aria-label="จำนวนคน" type="number" min="1" max="500" required value={guests} onChange={e=>setGuests(e.target.value)}/></label>
    </div>}
  </form>;
}
export function SpaceSkeletons(){return <div className="space-grid space-skeletons" role="status" aria-label="กำลังโหลดพื้นที่">{Array.from({length:4},(_,i)=><div key={i} className="space-skeleton" aria-hidden="true"><div/><span/><span/><span/></div>)}</div>}
const popularCities=[
  {name:'กรุงเทพฯ',english:'BANGKOK',image:'/photos/bangkok-riverside.jpg'},
  {name:'เชียงใหม่',english:'CHIANG MAI',image:'https://images.unsplash.com/photo-1678916022050-6063137a5d5a?auto=format&fit=crop&w=1000&q=82'},
  {name:'ภูเก็ต',english:'PHUKET',image:'https://images.unsplash.com/photo-1717748904007-5721bcca6a13?auto=format&fit=crop&w=1000&q=82'},
  {name:'พัทยา',english:'PATTAYA',image:'https://images.unsplash.com/photo-1643174769637-813001aa18e1?auto=format&fit=crop&w=1000&q=82'},
  {name:'หาดใหญ่',english:'HAT YAI',image:'https://images.unsplash.com/photo-1683119109118-9c96dd9618f5?auto=format&fit=crop&w=1000&q=82'},
];
export function Home(){
  const {go,all,ready}=useApp();
  const cityRail=useRef<HTMLDivElement>(null);
  function scrollCities(direction:number){const rail=cityRail.current;if(rail)rail.scrollBy({left:direction*rail.clientWidth*.8,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  const recentSpaces=all.filter(space=>space.status==='published').slice(0,4);
  return <div className="discovery-home">
    <section className="discovery-intro container" aria-labelledby="discovery-title">
      <h1 id="discovery-title" className="search-screen-title">ค้นหาพื้นที่ WELAA</h1>
      <SearchBox hero/>
      <div id="categories"><Categories value="ทั้งหมด" onChange={next=>go(next==='ทั้งหมด'?'/search':`/search?cat=${encodeURIComponent(next)}`)}/></div>
    </section>
    <section className="section discovery-spaces"><SectionHead title="ค้นพบพื้นที่ของคุณ" sub="ดูรายละเอียด ราคา และเวลาที่เปิด" href="/search"/>{!ready?<SpaceSkeletons/>:recentSpaces.length>0?<div className="space-grid">{recentSpaces.map(space=><SpaceCard key={space.id} s={space}/>)}</div>:<Empty title="พื้นที่ใหม่กำลังมา" sub="ระหว่างนี้ เลือกเมืองที่คุณสนใจเพื่อเริ่มค้นหา"><Link href="/search" className="button secondary">ค้นหาพื้นที่</Link></Empty>}</section>
    <section className="section home-cities discovery-cities">
      <div className="city-section-heading"><SectionHead title="เริ่มจากเมืองที่คุณชอบ" sub="เลือกจุดหมาย แล้วค้นหาพื้นที่ที่เหมาะกับคุณ"/><div className="city-controls"><button type="button" aria-label="เลื่อนเมืองไปทางซ้าย" onClick={()=>scrollCities(-1)}><ChevronLeft size={18}/></button><button type="button" aria-label="เลื่อนเมืองไปทางขวา" onClick={()=>scrollCities(1)}><ChevronRight size={18}/></button></div></div>
      <div className="city-grid" ref={cityRail} role="region" aria-label="เมืองยอดนิยม เลื่อนเพื่อดูเมืองเพิ่มเติม" tabIndex={0}>
        {popularCities.map(({name,english,image})=><Link className="city-card" href={`/search?city=${encodeURIComponent(name)}`} key={name} aria-label={`ค้นหาพื้นที่ใน${name}`}>
          <img className="city-card-image" src={image} alt="" loading="lazy"/>
          <span className="city-card-shade"/>
          <span className="city-card-copy"><b>{name}</b><small>{english}</small></span>
          <ArrowUpRight className="city-card-arrow" size={18}/>
        </Link>)}
      </div>
    </section>
    <section className="section discovery-confidence" aria-label="จองอย่างมั่นใจ"><div><Clock size={23}/><h3>พื้นที่ตามเวลาของคุณ</h3><p>เลือกวัน เวลา และจำนวนคนที่เหมาะกับกิจกรรม</p></div><div><ShieldCheck size={23}/><h3>รายละเอียดชัดเจน</h3><p>ดูราคา สิ่งอำนวยความสะดวก และกฎก่อนจอง</p></div><div><MessageCircle size={23}/><h3>คุยกับเจ้าของได้</h3><p>สอบถามรายละเอียด แล้วค่อยตัดสินใจ</p></div></section>
    <section className="section discovery-host"><div><span className="eyebrow">สำหรับเจ้าของพื้นที่</span><h2>เปลี่ยนพื้นที่ว่าง<br/>เป็นโอกาสใหม่</h2><p>ลงพื้นที่ของคุณ เลือกเวลาและราคาได้เอง</p><Link className="button" href="/host/new">เริ่มปล่อยพื้นที่ <ArrowUpRight size={17}/></Link></div><img src="/photos/meeting.jpg" alt="พื้นที่ประชุมพร้อมต้อนรับไอเดียใหม่" loading="lazy"/></section>
  </div>;
}
function searchInteger(value:string|null,fallback:number,min:number,max:number){
  const number=Number(value);
  return value!==null&&value.trim()!==''&&Number.isFinite(number)?Math.max(min,Math.min(max,Math.floor(number))):fallback;
}
export function SearchPage(){const p=useSearchParams(),{all,data,go,ready}=useApp();const [category,setCategory]=useState(normalizeCategory(p.get('cat')||'ทั้งหมด')),[price,setPrice]=useState(1500),[priceFiltered,setPriceFiltered]=useState(false),[distance,setDistance]=useState('all'),[type,setType]=useState('all'),[instant,setInstant]=useState(p.get('instant')==='1'),[amenities,setAmenities]=useState<string[]>([]),[filter,setFilter]=useState(false),[mode,setMode]=useState('list'),[sort,setSort]=useState('recommended'),[selected,setSelected]=useState(''),[editing,setEditing]=useState(false);useEffect(()=>{setCategory(normalizeCategory(p.get('cat')||'ทั้งหมด'));setInstant(p.get('instant')==='1')},[p.toString()]);const q=p.get('q')||'',parsed=useMemo(()=>parseSearch(q),[q]),city=p.get('city')||'ทั้งหมด',date=p.get('date')||'',start=searchInteger(p.get('start'),0,0,23),duration=searchInteger(p.get('duration'),1,1,24),guests=searchInteger(p.get('guests'),1,1,500);const deferredCategory=useDeferredValue(category);const showSearchLoading=useSlowLoading(!ready||deferredCategory!==category);const maxPrice=useMemo(()=>Math.ceil(Math.max(1500,...all.map(s=>s.price))/25)*25,[all]);const results=useMemo(()=>{const filtered=all.filter(s=>s.status==='published'&&s.activities.length>0&&(deferredCategory==='ทั้งหมด'||s.activities.includes(deferredCategory))&&(city==='ทั้งหมด'||s.city===city)&&(!priceFiltered||s.price<=price)&&s.guests>=guests&&(distance==='all'||s.distance<=Number(distance))&&(type==='all'||s.type===type)&&(!instant||!!instantInfo(s,data))&&amenities.every(a=>s.amenities.includes(a))&&(!q||parsed.cat!=='ทั้งหมด'||parsed.city||parsed.date||parsed.guests||parsed.duration||`${s.name} ${s.type} ${s.city} ${s.area} ${s.activities.join(' ')}`.toLowerCase().includes(q.toLowerCase()))&&(!date||Array.from({length:start?1:s.close-s.open},(_,i)=>start||s.open+i).some(h=>h+duration<=s.close&&Array.from({length:duration},(_,i)=>h+i).every(hh=>slotStatus(s,date,hh,data)==='available'))));filtered.sort((a,b)=>sort==='low'?a.price-b.price:sort==='rating'?b.rating-a.rating:a.distance-b.distance);return filtered},[all,data,deferredCategory,city,priceFiltered,price,distance,type,instant,amenities,q,parsed,date,start,duration,guests,sort]);const selectedSpace=results.find(s=>s.id===selected)||results[0];const [mapLat,mapLng]=coordinates(city);const clear=()=>{setPrice(1500);setPriceFiltered(false);setDistance('all');setType('all');setInstant(false);setAmenities([])};
const activeCount=Number(priceFiltered)+Number(distance!=='all')+Number(type!=='all')+Number(instant)+amenities.length;
const selectCategory=(value:string)=>{setCategory(value);const next=new URLSearchParams(p.toString());if(value==='ทั้งหมด')next.delete('cat');else next.set('cat',value);go('/search?'+next.toString())};
const removeParam=(key:string)=>{const next=new URLSearchParams(p.toString());next.delete(key);if(key==='date'){next.delete('start');next.delete('duration')}go('/search?'+next.toString())};
const chips=[...(city!=='ทั้งหมด'?[{label:city,remove:()=>removeParam('city')}]:[]),...(date?[{label:date,remove:()=>removeParam('date')}]:[]),...(guests>1?[{label:`${guests} คน`,remove:()=>removeParam('guests')}]:[]),...(q?[{label:q,remove:()=>removeParam('q')}]:[]),...(category!=='ทั้งหมด'?[{label:category,remove:()=>selectCategory('ทั้งหมด')}]:[]),...(priceFiltered?[{label:`ไม่เกิน ฿${money(price)}/ชม.`,remove:()=>setPriceFiltered(false)}]:[]),...(distance!=='all'?[{label:`ระยะ ${distance} กม.`,remove:()=>setDistance('all')}]:[]),...(type!=='all'?[{label:type,remove:()=>setType('all')}]:[]),...(instant?[{label:'ว่างตอนนี้',remove:()=>setInstant(false)}]:[]),...amenities.map(a=>({label:a,remove:()=>setAmenities(v=>v.filter(x=>x!==a))}))];
return <div className="page search-page"><h1 className="search-screen-title">ค้นหาพื้นที่ของคุณ</h1><div className="search-topbar"><button className="search-summary" onClick={()=>setEditing(true)} aria-label="แก้ไขการค้นหา"><Search size={22}/><span><strong>{q|| (city==='ทั้งหมด'?'ค้นหาทุกเมือง':city)}</strong><small>{date||'เลือกวันภายหลังได้'}<span aria-hidden="true"> · </span>{guests} คน{start>0&&` · ${hour(start)}`}</small></span><span className="search-summary-edit"><SlidersHorizontal size={17}/></span></button><div className="search-controls"><button className="button secondary" onClick={()=>setFilter(true)}><SlidersHorizontal size={16}/>ตัวกรอง{activeCount>0&&<span className="filter-count">{activeCount}</span>}</button><button className={'button secondary budget-shortcut'+(priceFiltered?' selected':'')} onClick={()=>setFilter(true)}>{priceFiltered?`ไม่เกิน ฿${money(price)}`:'ช่วงราคา'}<ChevronDown size={14}/></button><Choice value={sort} onChange={setSort} label="เรียงลำดับ" options={[{value:'recommended',label:'แนะนำสำหรับคุณ'},{value:'low',label:'ราคาต่ำไปสูง'},{value:'rating',label:'คะแนนสูงสุด'}]}/></div></div><Categories value={category} onChange={selectCategory}/><Dialog open={editing} onOpenChange={setEditing}><DialogContent className="search-editor-dialog"><DialogTitle>แก้ไขการค้นหา</DialogTitle><DialogDescription>เลือกเมือง วัน และจำนวนคนที่เหมาะกับคุณ</DialogDescription><SearchBox key={p.toString()} compact onSearch={()=>setEditing(false)}/></DialogContent></Dialog>{chips.length>0&&<div className="search-chips" aria-label="เงื่อนไขการค้นหาที่เลือก">{chips.map((chip,i)=><button key={chip.label+i} type="button" onClick={chip.remove} aria-label={`ล้างเงื่อนไข ${chip.label}`}>{chip.label}<X size={13}/></button>)}<button className="clear-search" type="button" onClick={()=>{clear();setCategory('ทั้งหมด');go('/search')}}>ล้างทั้งหมด</button></div>}<div className="results-toolbar"><span role="status" aria-live="polite"><b>{results.length}</b> พื้นที่{date&&` · ${date}`}{start>0&&` · ${hour(start)}–${hour(start+duration)}`}</span><div className="row"><button className="button secondary" onClick={()=>setMode(mode==='list'?'map':'list')}>{mode==='list'?<Map size={17}/>:<LayoutGrid size={17}/>} {mode==='list'?'แผนที่':'รายการ'}</button></div></div><div aria-busy={deferredCategory!==category} className={'results-layout '+(mode==='map'?'with-map':'')}>{showSearchLoading?<LoadingDots/>:!ready?<SpaceSkeletons/>:results.length?<div className="space-grid">{results.map(s=><div key={s.id}><SpaceCard s={s} instant={instant} result/></div>)}</div>:<Empty title="ยังไม่เจอพื้นที่ที่ตรงกัน" sub="ลองเปลี่ยนวัน ลดจำนวนคน หรือล้างตัวกรองเพื่อดูพื้นที่เพิ่มเติม"><button className="button secondary" onClick={()=>{clear();setCategory('ทั้งหมด');go('/search')}}>ดูทุกเมือง</button></Empty>}{mode==='map'&&ready&&!showSearchLoading&&<div className="map-panel"><iframe title="แผนที่พื้นที่โดยประมาณ" src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedSpace?.lng??mapLng)-.045}%2C${(selectedSpace?.lat??mapLat)-.03}%2C${(selectedSpace?.lng??mapLng)+.045}%2C${(selectedSpace?.lat??mapLat)+.03}&layer=mapnik&marker=${selectedSpace?.lat??mapLat}%2C${selectedSpace?.lng??mapLng}`} loading="lazy"/><div className="map-caption"><MapPin size={18}/><div><b>{selectedSpace?.name||(city==='ทั้งหมด'?'เมืองที่เลือก':city)}</b><p>ตำแหน่งโดยประมาณ</p></div></div><div className="map-space-pills">{results.slice(0,6).map(s=><button className={selectedSpace?.id===s.id?'selected':''} key={s.id} onClick={()=>setSelected(s.id)}>฿{s.price} · {s.name}</button>)}</div></div>}</div><Dialog open={filter} onOpenChange={setFilter}><DialogContent><DialogTitle>เลือกพื้นที่ที่ใช่</DialogTitle><DialogDescription>กำหนดงบและสิ่งที่คุณต้องการ</DialogDescription><div className="stack"><div className="field"><div className="row between"><b>ราคาสูงสุด / ชั่วโมง</b><span>{priceFiltered?`฿${money(price)}`:'ทุกช่วงราคา'}</span></div><Slider aria-label="ราคาสูงสุด" value={[priceFiltered?price:maxPrice]} onValueChange={v=>{setPrice(v[0]);setPriceFiltered(true)}} min={25} max={maxPrice} step={25}/></div><div className="two-col"><label className="field">ระยะจากใจกลางเมือง<Choice value={distance} onChange={setDistance} label="ระยะทาง" options={[{value:'all',label:'ทุกระยะ'},...['3','5','10'].map(v=>({value:v,label:`ไม่เกิน ${v} กม.`}))]}/></label><label className="field">ประเภทพื้นที่<Choice value={type} onChange={setType} label="ประเภทพื้นที่" options={[{value:'all',label:'ทุกประเภท'},...types]}/></label></div><Check checked={instant} onChange={setInstant}>ว่างตอนนี้ · จองได้ทันที</Check><b>สิ่งอำนวยความสะดวก</b><div className="selection-grid">{facilities.slice(0,4).map(a=><Check key={a} checked={amenities.includes(a)} onChange={v=>setAmenities(v?[...amenities,a]:amenities.filter(x=>x!==a))}>{a}</Check>)}</div><button className="text-link" onClick={clear}>ล้างตัวกรอง</button></div><button className="button full" onClick={()=>setFilter(false)}>ดู {results.length} พื้นที่</button></DialogContent></Dialog></div>}
export function HowItWorks(){return <div className="page how-page"><div className="eyebrow">GOOD SPACES. GREAT POSSIBILITIES.</div><h1 className="page-title">พื้นที่พอดี กับเวลาที่คุณต้องการ</h1><p className="muted">เริ่มจากหนึ่งชั่วโมง แล้วให้ไอเดียของคุณไปต่อ</p><Tabs defaultValue="guest"><TabsList><TabsTrigger value="guest">ฉันกำลังหาพื้นที่</TabsTrigger><TabsTrigger value="host">ฉันมีพื้นที่ว่าง</TabsTrigger></TabsList>{['guest','host'].map(mode=><TabsContent value={mode} key={mode}><div className="how-steps">{(mode==='guest'?[['หาพื้นที่ที่ใช่','บอกกิจกรรม สถานที่ และจำนวนคน แล้วเลือกพื้นที่ที่เหมาะกับคุณ'],['เลือกเวลาของคุณ','ดูปฏิทิน ตรวจสอบกฎ และเห็นยอดรวมก่อนยืนยัน'],['จอง แล้วเริ่มทำสิ่งที่ชอบ','ดูรายละเอียดในการจองของฉัน และส่งข้อความหาเจ้าของได้']]:[['เล่าเรื่องพื้นที่ของคุณ','ใส่รูป บอกกิจกรรมที่ทำได้ และกำหนดกฎที่ชัดเจน'],['เลือกเวลาและราคาเอง','เปิดช่วงว่างล่วงหน้า หรือเปิดพื้นที่ตอนนี้ในราคาที่คุณกำหนด'],['ต้อนรับไอเดียใหม่','จัดการการจอง ปฏิทิน และข้อความในหน้าของเจ้าของพื้นที่']]).map((x,i)=><div key={x[0]}><span>0{i+1}</span><h2>{x[0]}</h2><p>{x[1]}</p></div>)}</div><Link className="button" href={mode==='guest'?'/search':'/host/new'}>{mode==='guest'?'ค้นหาพื้นที่':'เริ่มปล่อยพื้นที่'}<ArrowUpRight size={17}/></Link></TabsContent>)}</Tabs><div className="outline-panel"><h2>ความสบายใจ เริ่มจากความชัดเจน</h2><p>อ่านกฎและนโยบายยกเลิกก่อนจอง เจ้าของต้องยืนยันสิทธิ์ในการนำพื้นที่มาให้ใช้งาน และเคารพข้อจำกัดของอาคารและเพื่อนบ้าน</p><p className="notice">WELAA รุ่นทดลอง: รายการเริ่มต้นและรีวิวเป็นข้อมูลตัวอย่าง การจองไม่ใช่การเช่าสถานที่จริง และการชำระเงินไม่เรียกเก็บเงินจริง</p></div></div>}
