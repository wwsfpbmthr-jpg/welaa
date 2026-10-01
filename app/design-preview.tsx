'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Smartphone,Tablet,Monitor,ArrowUpRight} from 'lucide-react';

const devices=[{name:'มือถือ',width:390,Icon:Smartphone},{name:'แท็บเล็ต',width:820,Icon:Tablet},{name:'คอมพิวเตอร์',width:1280,Icon:Monitor}];
export default function DesignPreview(){
  const [device,setDevice]=useState(0);
  return <div className="design-preview-workspace"><header><div><b>WELAA</b><span>พรีวิวการออกแบบ</span></div><div className="design-device-switch" role="group" aria-label="ขนาดหน้าจอ">{devices.map(({name,Icon},i)=><button key={name} aria-pressed={device===i} onClick={()=>setDevice(i)}><Icon size={16}/>{name}</button>)}</div><Link href="/" target="_blank">เปิดเว็บพรีวิว <ArrowUpRight size={16}/></Link></header><div className="design-preview-canvas"><iframe title="พรีวิว WELAA" src="/" style={{width:devices[device].width,height:844}}/></div></div>;
}
