export type Space={id:string;name:string;type:string;area:string;city:string;price:number;guests:number;rating:number;reviews:number;image:string;images?:string[];activities:string[];amenities:string[];description:string;host:string;distance:number;lat:number;lng:number;open:number;close:number;instant:boolean;owner?:string;rules:string;date?:string};
export const categories=['ประชุม','ถ่าย Content','เวิร์กช็อป','จัดกิจกรรม'] as const;
export const types=['ห้องประชุม','ห้องทำงาน','สตูดิโอ','ห้องเวิร์กช็อป','ห้องอเนกประสงค์','พื้นที่จัดกิจกรรม','คาเฟ่','ดาดฟ้า','สวน'];
export const cities=['กรุงเทพฯ','เชียงใหม่','ภูเก็ต','พัทยา','หาดใหญ่'];
const oldCategories:Record<string,string>={'ทำงาน':'ประชุม','ถ่ายภาพ':'ถ่าย Content','ติว / เรียน':'เวิร์กช็อป','จัดงาน':'จัดกิจกรรม','Pop-up':'จัดกิจกรรม'};
export const normalizeActivities=(activities:string[]=[])=>[...new Set(activities.map(a=>oldCategories[a]||a).filter(a=>categories.includes(a as typeof categories[number])))];
export const normalizeCategory=(category:string)=>category==='ทั้งหมด'?'ทั้งหมด':normalizeActivities([category])[0]||'ทั้งหมด';
export const facilities=['Wi-Fi','เครื่องปรับอากาศ','ที่จอดรถ','แสงธรรมชาติ','ห้องน้ำ','โปรเจคเตอร์','ปลั๊กไฟ','น้ำดื่ม'];
export const coordinates=(city:string):[number,number]=>city==='กรุงเทพฯ'?[13.745,100.532]:city==='เชียงใหม่'?[18.79,98.985]:city==='ภูเก็ต'?[7.88,98.392]:city==='พัทยา'?[12.928,100.877]:city==='สงขลา'?[7.198,100.59]:[7.008,100.474];
export const spaces:Space[]=[];
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const datePlus=(n:number)=>{const d=new Date(today()+'T12:00:00+07:00');d.setDate(d.getDate()+n);return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok'}).format(d)};
export const money=(n:number)=>new Intl.NumberFormat('th-TH').format(n);
export const hour=(n:number)=>`${String(n).padStart(2,'0')}:00`;
export const thaiDate=(s:string)=>{const [y,m,d]=s.split('-').map(Number);return `${d} ${['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][m-1]||''}`};
export const isPast=(d:string,h:number)=>new Date(`${d}T${hour(h)}:00+07:00`).getTime()<=Date.now();
export const seedBooked=(s:Space,h:number)=>{const n=Number(s.id.split('-')[1]),first=n%3===0?10:n%3===1?12:16;return s.id.startsWith('space-')&&(h===first||h===first+1)};
export type AppData={user:any;spaces:Space[];occupied:any[];availability:any[];bookings:any[];favorites:string[];messages:any[];reviews:any[];draft:any};
export const initial:AppData={user:null,spaces:[],occupied:[],availability:[],bookings:[],favorites:[],messages:[],reviews:[],draft:null};
export function slotStatus(s:Space,date:string,h:number,data:AppData){if(h<s.open||h>=s.close||isPast(date,h))return 'unavailable';const booked=data.occupied.find(o=>o.space_id===s.id&&o.date===date&&o.hour===h);if(booked)return 'booked';const slot=data.availability.find(a=>a.space_id===s.id&&a.date===date&&a.hour===h);return slot?.is_open===true?'available':'unavailable'}
export const slotPrice=(s:Space,d:string,h:number,data:AppData)=>data.availability.find(a=>a.space_id===s.id&&a.date===d&&a.hour===h)?.price??s.price;
export function instantInfo(s:Space,data:AppData){const d=today(),now=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',hour:'2-digit',hourCycle:'h23'}).format(new Date()));const custom=data.availability.filter(a=>a.space_id===s.id&&a.date===d&&a.instant&&a.hour>now&&slotStatus(s,d,a.hour,data)==='available');if(custom.length)return {price:Math.min(...custom.map(a=>a.price)),end:Math.max(...custom.map(a=>a.hour))+1};if(s.instant&&s.close>now+1&&Array.from({length:s.close-s.open},(_,i)=>s.open+i).some(h=>slotStatus(s,d,h,data)==='available'))return {price:s.price,end:s.close};return null}
export function parseSearch(q:string){
  let cat='ทั้งหมด';
  if(/tiktok|content|คอนเทนต์|ถ่ายรูป|ถ่ายภาพ|studio|สตูดิโอ|พอดแคสต์|ถ่ายคลิป/i.test(q))cat='ถ่าย Content';
  else if(/ประชุม|meeting|ทำงาน|สัมภาษณ์งาน/i.test(q))cat='ประชุม';
  else if(/เวิร์กช็อป|workshop|ติว|เรียน|สอน|คลาส/i.test(q))cat='เวิร์กช็อป';
  else if(/จัดงาน|จัดกิจกรรม|อีเวนต์|event|ปาร์ตี้|pop-up|ป๊อปอัพ/i.test(q))cat='จัดกิจกรรม';
  const durationMatch=q.match(/(\d+)\s*(?:[-–]\s*\d+\s*)?(?:ชั่วโมง|ชม\.?)/);
  const city=/กรุงเทพ|กทม|bangkok/i.test(q)?'กรุงเทพฯ':/เชียงใหม่|chiang\s*mai/i.test(q)?'เชียงใหม่':/ภูเก็ต|phuket/i.test(q)?'ภูเก็ต':/พัทยา|pattaya/i.test(q)?'พัทยา':/หาดใหญ่|hat\s*yai/i.test(q)?'หาดใหญ่':/สงขลา|songkhla/i.test(q)?'สงขลา':'';
  return {
    cat,
    date:/พรุ่งนี้/.test(q)?datePlus(1):/วันนี้|คืนนี้/.test(q)?today():'',
    guests:Number(q.match(/(\d+)\s*คน/)?.[1]||0),
    duration:Math.min(24,Number(durationMatch?.[1]||0)),
    start:/คืนนี้|เย็น/.test(q)?18:/บ่าย/.test(q)?13:0,
    city
  }
}
