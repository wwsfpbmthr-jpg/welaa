export type Space={id:string;name:string;type:string;area:string;city:string;price:number;guests:number;rating:number;reviews:number;image:string;images?:string[];activities:string[];amenities:string[];description:string;host:string;distance:number;lat:number;lng:number;open:number;close:number;instant:boolean;owner?:string;rules:string;date?:string};
export const categories=['ทั้งหมด','ถ่าย Content','ประชุม','ติว / เรียน','จัดงาน','ซ้อมดนตรี','ถ่ายภาพ','Pop-up','กีฬา','ทำงาน','ที่จอดรถ'];
export const types=['สตูดิโอ','ห้องประชุม','ห้องทำงาน','ห้องว่าง','ดาดฟ้า','สวน','คาเฟ่','ห้องซ้อม','สนาม','พื้นที่จัดงาน','พื้นที่ Pop-up','โกดัง','ที่จอดรถ'];
export const cities=['หาดใหญ่','สงขลา','กรุงเทพฯ','เชียงใหม่'];
export const facilities=['Wi-Fi','เครื่องปรับอากาศ','ที่จอดรถ','แสงธรรมชาติ','ห้องน้ำ','โปรเจคเตอร์','ปลั๊กไฟ','น้ำดื่ม'];
const rows:[string,string,string,number,number,string,string[],number,number][]=[
['Daylight Studio','สตูดิโอ','ม.อ. • หาดใหญ่',180,8,'studio',['ถ่าย Content','ถ่ายภาพ'],4.96,38],
['The Meeting Room','ห้องประชุม','ใจกลางเมือง • หาดใหญ่',120,6,'meeting',['ประชุม','ติว / เรียน','ทำงาน'],4.91,24],
['Above the City','ดาดฟ้า','ย่านเมืองเก่า • สงขลา',250,15,'rooftop',['จัดงาน','ถ่าย Content','ถ่ายภาพ'],4.98,17],
['Little Green Garden','สวน','คอหงส์ • หาดใหญ่',200,12,'garden',['จัดงาน','ถ่ายภาพ','Pop-up'],4.89,32],
['A Slow Morning Café','คาเฟ่','คลองเรียน • หาดใหญ่',350,20,'cafe',['ถ่าย Content','Pop-up','จัดงาน'],4.94,21],
['Room for Ideas','ห้องทำงาน','ม.อ. • หาดใหญ่',90,4,'workspace',['ทำงาน','ประชุม','ติว / เรียน'],4.92,46],
['Soundcheck Room','ห้องซ้อม','คลองแห • หาดใหญ่',220,6,'music',['ซ้อมดนตรี','ถ่าย Content'],4.88,15],
['The White Space','พื้นที่จัดงาน','นิมมาน • เชียงใหม่',550,30,'event',['จัดงาน','Pop-up','ถ่ายภาพ'],4.95,19],
['Park & Go Central','ที่จอดรถ','เซ็นทรัล • หาดใหญ่',25,1,'parking',['ที่จอดรถ'],4.82,62],
['Sunday Photo House','สตูดิโอ','อารีย์ • กรุงเทพฯ',400,10,'studio',['ถ่ายภาพ','ถ่าย Content'],4.97,51],
['Common Ground','ห้องทำงาน','สีลม • กรุงเทพฯ',150,8,'workspace',['ทำงาน','ประชุม','ติว / เรียน'],4.90,27],
['Green Court','สนาม','คอหงส์ • หาดใหญ่',180,12,'sport',['กีฬา','จัดงาน'],4.86,14],
['Window Seat','ห้องว่าง','ย่านเมืองเก่า • สงขลา',100,3,'cafe2',['ทำงาน','ติว / เรียน','ถ่าย Content'],4.93,18],
['Open House Pop-up','พื้นที่ Pop-up','สันติธรรม • เชียงใหม่',280,15,'event',['Pop-up','จัดงาน'],4.85,12],
['Blue Hour Rooftop','ดาดฟ้า','ทองหล่อ • กรุงเทพฯ',650,25,'rooftop',['จัดงาน','ถ่ายภาพ'],4.96,29],
['The Workshop','โกดัง','บางกล่ำ • หาดใหญ่',300,20,'meeting',['จัดงาน','Pop-up','ถ่าย Content'],4.87,9],
['Private Study Club','ห้องประชุม','ม.อ. • หาดใหญ่',80,6,'workspace',['ติว / เรียน','ทำงาน','ประชุม'],4.95,33],
['Backyard Sessions','สวน','เขารูปช้าง • สงขลา',240,18,'garden',['จัดงาน','ถ่าย Content','ถ่ายภาพ'],4.94,16]
];
export const coordinates=(city:string)=>city==='กรุงเทพฯ'?[13.745,100.532]:city==='เชียงใหม่'?[18.79,98.985]:city==='สงขลา'?[7.198,100.59]:[7.008,100.474];
void rows;
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
export function parseSearch(q:string){let cat='ทั้งหมด';if(/tiktok|content|คอนเทนต์/i.test(q))cat='ถ่าย Content';else if(/ถ่ายรูป|ถ่ายภาพ|studio|สตูดิโอ/i.test(q))cat='ถ่ายภาพ';else if(/ประชุม|meeting/i.test(q))cat='ประชุม';else if(/ติว|เรียน/.test(q))cat='ติว / เรียน';else if(/ซ้อม|ดนตรี/.test(q))cat='ซ้อมดนตรี';else if(/จอด/.test(q))cat='ที่จอดรถ';else if(/กีฬา|สนาม/.test(q))cat='กีฬา';else if(/ทำงาน/.test(q))cat='ทำงาน';else if(/จัดงาน/.test(q))cat='จัดงาน';return {cat,date:/พรุ่งนี้/.test(q)?datePlus(1):/วันนี้|คืนนี้/.test(q)?today():'',guests:Number(q.match(/(\d+)\s*คน/)?.[1]||0),duration:Math.min(24,Number(q.match(/(\d+)\s*ชั่วโมง/)?.[1]||0)),start:/คืนนี้|เย็น/.test(q)?18:/บ่าย/.test(q)?13:0,city:cities.find(c=>q.includes(c))||''}}
