"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  House,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Breadcrumbs } from "./discover";
export const faqs = [
  {
    question: "WELAA คืออะไร?",
    answer:
      "แพลตฟอร์มค้นหาและส่งคำขอจองพื้นที่รายชั่วโมงสำหรับประชุม ถ่าย Content เวิร์กช็อป และจัดกิจกรรม ขณะนี้ยังอยู่ในระยะทดลอง ไม่มีการรับเงินจริง",
    tag: "ทั่วไป",
  },
  {
    question: "ส่งคำขอแล้วจองสำเร็จทันทีไหม?",
    answer:
      "ยังไม่สำเร็จทันที เจ้าของต้องตอบรับก่อน ตรวจสอบสถานะได้ที่การจองของฉัน และดูขั้นตอนถัดไปในแต่ละรายการ",
    tag: "การจอง",
  },
  {
    question: "คิดราคาอย่างไร?",
    answer:
      "ค่าพื้นที่คำนวณตามราคาของแต่ละชั่วโมงที่เลือก และค่าบริการ 8% ระบบตรวจราคาและเวลาว่างอีกครั้งก่อนส่งคำขอ ยอดรวมแสดงก่อนยืนยัน",
    tag: "การจอง",
  },
  {
    question: "ระบบรับเงินจริงหรือไม่?",
    answer:
      "ยังไม่มีการรับเงินจริง บาง Preview รองรับ Stripe Test Mode ใช้ข้อมูลทดสอบเท่านั้น รายการชำระเงินจำลองไม่ใช่หลักฐานการโอนเงินจริง",
    tag: "การชำระเงิน",
  },
  {
    question: "ยกเลิกคำขอจองได้อย่างไร?",
    answer:
      "เปิดการจองของฉัน แล้วเลือกยกเลิกก่อนเวลาเริ่มใช้งาน ระบบคืนช่วงเวลาให้จองได้ตามเงื่อนไขเดิม ไม่มีการคืนเงินจริงเพราะยังไม่รับเงินจริง",
    tag: "การจอง",
  },
  {
    question: "จะเริ่มปล่อยพื้นที่ได้อย่างไร?",
    answer:
      "สมัครหรือเข้าสู่ระบบ เพิ่มรูป รายละเอียด กิจกรรม กฎ และราคา จากนั้นกำหนดเวลาว่างในปฏิทินเจ้าของพื้นที่ หากไม่มีเวลาเปิดให้จอง ผู้เช่าจะเลือกเวลานั้นไม่ได้",
    tag: "เจ้าของพื้นที่",
  },
  {
    question: "เจ้าของได้รับการยืนยันตัวตนแล้วหรือยัง?",
    answer:
      "ยังไม่เปิดระบบตรวจสอบตัวตนหรือยืนยันเบอร์โทรศัพท์ด้วย OTP การมีบัญชีและข้อมูลโปรไฟล์ไม่ได้แปลว่าเจ้าของผ่านการตรวจสอบ",
    tag: "ความปลอดภัย",
  },
  {
    question: "ส่งข้อความหาเจ้าของได้ไหม?",
    answer:
      "ระบบแชตยังไม่เปิดให้บริการ กรุณาใช้ข้อมูลในหน้ารายละเอียดประกอบการตัดสินใจ หากข้อมูลไม่เพียงพออย่าส่งคำขอจนกว่าจะตรวจสอบได้",
    tag: "ทั่วไป",
  },
  {
    question: "พบข้อมูลพื้นที่ผิดหรือไม่ปลอดภัยต้องทำอย่างไร?",
    answer:
      "เข้าสู่ระบบ เปิดหน้าพื้นที่แล้วเลือก “รายงาน” ระบุเหตุผลและรายละเอียด ระบบจะบันทึกรายงานให้ทีมตรวจสอบ แต่ยังไม่มีการรับประกันระยะเวลาตอบกลับ",
    tag: "ความปลอดภัย",
  },
];
const pages: Record<
  string,
  { title: string; lead: string; sections: { title: string; body: string }[] }
> = {
  "/about": {
    title: "พื้นที่มีค่า ทุกเวลา",
    lead: "WELAA เริ่มจากแนวคิดเรียบง่าย: พื้นที่ที่ว่างอยู่ อาจพอดีกับสิ่งที่ใครบางคนอยากทำ",
    sections: [
      {
        title: "พื้นที่สำหรับความเป็นไปได้",
        body: "เราสร้างเครื่องมือให้คนค้นหาพื้นที่ตามกิจกรรม เมือง และช่วงเวลา โดยไม่ต้องเริ่มจากการเช่าระยะยาว เจ้าของกำหนดรายละเอียด ราคา และเวลาว่างเองได้",
      },
      {
        title: "พัฒนาอย่างตรงไปตรงมา",
        body: "WELAA อยู่ในระยะทดลอง ระบบค้นหา บัญชี คำขอจอง และปฏิทินเชื่อมกับข้อมูลจริง แต่ยังไม่รับเงินจริง ไม่เปิดแชต และยังไม่มีการรับประกันหรือระบบตรวจสอบตัวตน",
      },
    ],
  },
  "/trust-and-safety": {
    title: "ความมั่นใจ เริ่มจากความชัดเจน",
    lead: "รู้ว่าระบบทำอะไรได้ และตรวจอะไรด้วยตัวเองก่อนส่งคำขอจอง",
    sections: [
      {
        title: "ตรวจรายละเอียดก่อนเลือกเวลา",
        body: "ดูรูป จำนวนคน สิ่งอำนวยความสะดวก กฎการใช้งาน และยอดรวม ข้อมูลพื้นที่มาจากเจ้าของ แผนที่แสดงตำแหน่งโดยประมาณ ไม่ใช่การยืนยันที่อยู่จริง",
      },
      {
        title: "สถานะบัญชีไม่เท่ากับการยืนยันตัวตน",
        body: "WELAA ยังไม่เปิดการตรวจสอบตัวตน การยืนยันเบอร์ด้วย OTP การประกันความเสียหาย หรือการรับประกันพื้นที่ โปรดอย่าตีความการแสดงโปรไฟล์ว่าเป็นการรับรอง",
      },
      {
        title: "รายงานพื้นที่ที่น่าสงสัย",
        body: "ผู้ใช้ที่เข้าสู่ระบบสามารถส่งรายงานจากปุ่ม “รายงาน” ในหน้าพื้นที่ได้ ระบุสิ่งที่พบโดยไม่ใส่ข้อมูลส่วนตัวที่ไม่จำเป็น หากมีเหตุฉุกเฉินให้ติดต่อหน่วยงานฉุกเฉินในพื้นที่",
      },
      {
        title: "ไม่มีการรับเงินจริงในขณะนี้",
        body: "คำขอจองต้องรอเจ้าของตอบรับ การชำระเงินที่เปิดในรุ่นทดสอบเป็นการจำลองหรือ Stripe Test Mode เท่านั้น ไม่ใช่หลักฐานว่าชำระเงินจริงแล้ว",
      },
    ],
  },
  "/contact": {
    title: "ต้องการความช่วยเหลือ?",
    lead: "เลือกช่องทางที่มีให้บริการจริงในขณะนี้",
    sections: [
      {
        title: "คำถามเกี่ยวกับการจอง",
        body: "ดูสถานะและรายละเอียดจากการจองของฉัน หรืออ่านคำถามที่พบบ่อยเพื่อเข้าใจขั้นตอน ระบบแชตและแบบฟอร์มติดต่อทีมยังไม่เปิดให้บริการ",
      },
      {
        title: "แจ้งปัญหาข้อมูลพื้นที่",
        body: "เข้าสู่ระบบและใช้ปุ่ม “รายงาน” ในหน้ารายละเอียดพื้นที่ ระบบบันทึกปัญหาให้ทีมตรวจสอบ ยังไม่มีช่องทางรับเรื่องเร่งด่วนหรือการรับประกันเวลาตอบกลับ",
      },
    ],
  },
  "/terms": {
    title: "ข้อควรรู้ในการใช้ WELAA รุ่นทดลอง",
    lead: "ข้อมูลการทำงานของระบบปัจจุบัน เอกสารข้อกำหนดทางกฎหมายฉบับสมบูรณ์ยังไม่เผยแพร่",
    sections: [
      {
        title: "คำขอจองและราคา",
        body: "ตรวจวัน เวลา จำนวนคน และกฎพื้นที่ก่อนส่งคำขอ เจ้าของต้องตอบรับก่อนดำเนินการต่อ ราคาคิดรายชั่วโมงและค่าบริการ 8% ตามที่แสดงในสรุป ระบบยังไม่รับเงินจริง",
      },
      {
        title: "ข้อมูลและสิทธิ์ของเจ้าของพื้นที่",
        body: "เจ้าของควรลงข้อมูลที่ถูกต้องและมีสิทธิ์นำพื้นที่มาให้ใช้งาน รายการเผยแพร่ไม่ได้แปลว่าผ่านการตรวจสอบตัวตนหรือการรับรองสิทธิ์โดย WELAA",
      },
      {
        title: "การยกเลิกและบริการที่ยังไม่เปิด",
        body: "ยกเลิกคำขอได้ก่อนเวลาเริ่มจากหน้าการจองของฉัน ยังไม่มีการคืนเงินจริง แชต รีวิวหลังใช้งาน ประกัน และการจ่ายรายได้ให้เจ้าของยังไม่เปิดให้บริการ",
      },
    ],
  },
  "/privacy": {
    title: "ข้อมูลของคุณใน WELAA",
    lead: "อธิบายการใช้ข้อมูลจากระบบที่มีอยู่ นโยบายความเป็นส่วนตัวฉบับสมบูรณ์ยังไม่เผยแพร่",
    sections: [
      {
        title: "บัญชีและโปรไฟล์",
        body: "ระบบใช้ Supabase สำหรับบัญชีและฐานข้อมูล เก็บอีเมล ชื่อที่แสดง และข้อมูลโปรไฟล์ที่คุณกรอก เช่น เบอร์โทรและคำแนะนำตัว เบอร์โทรที่กรอกยังไม่ได้ผ่านการยืนยัน OTP",
      },
      {
        title: "ข้อมูลการใช้งาน",
        body: "ระบบบันทึกพื้นที่ที่ลง รายการโปรด คำขอจอง เวลาว่าง และรายงานพื้นที่ตามการใช้งาน ข้อมูลชื่อเจ้าของและรายละเอียดพื้นที่ที่เผยแพร่แสดงต่อผู้เข้าชม",
      },
      {
        title: "ข้อมูลบนอุปกรณ์",
        body: "ระบบเก็บ session การเข้าสู่ระบบและแบบร่างการลงพื้นที่บนอุปกรณ์เพื่อให้ทำงานต่อได้ อย่ากรอกข้อมูลอ่อนไหวลงในรายละเอียดหรือรูปพื้นที่",
      },
      {
        title: "ข้อจำกัดของรุ่นทดลอง",
        body: "ยังไม่มีหน้าจัดการคำขอส่งออกหรือลบบัญชีด้วยตนเอง และยังไม่ประกาศระยะเวลาเก็บข้อมูลหรือช่องทางติดต่อด้านความเป็นส่วนตัวอย่างเป็นทางการ จึงไม่ควรใช้ระบบทดลองเก็บข้อมูลอ่อนไหว",
      },
    ],
  },
};
export function Help() {
  const [query, setQuery] = useState("");
  const results = faqs.filter((f) =>
    (f.question + f.answer + f.tag).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="page v2-support">
      <Breadcrumbs
        items={[{ label: "หน้าหลัก", href: "/" }, { label: "ศูนย์ช่วยเหลือ" }]}
      />
      <header className="v2-page-heading">
        <span className="eyebrow">WELAA HELP</span>
        <h1>เริ่มต้นได้อย่างเข้าใจ</h1>
        <p>คำตอบเกี่ยวกับการจอง พื้นที่ และการใช้งานรุ่นทดลอง</p>
        <label className="v2-help-search">
          <Search size={20} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา เช่น ยกเลิก ราคา หรือปล่อยพื้นที่"
            aria-label="ค้นหาคำถามที่พบบ่อย"
          />
        </label>
      </header>
      <div className="v2-help-topics">
        {[
          ["/account/bookings", "จัดการการจอง", CalendarDays],
          ["/become-a-host", "สำหรับเจ้าของพื้นที่", House],
          ["/trust-and-safety", "ความปลอดภัย", ShieldCheck],
        ].map(([href, label, Icon]) => {
          const I = Icon as typeof House;
          return (
            <Link key={String(href)} href={String(href)}>
              <I size={22} />
              {String(label)}
              <ArrowUpRight size={16} />
            </Link>
          );
        })}
      </div>
      <section className="v2-faq">
        <h2>คำถามที่พบบ่อย</h2>
        <p className="muted" role="status">
          {results.length} คำถาม
        </p>
        {results.map((f) => (
          <details key={f.question}>
            <summary>
              {f.question}
              <span>+</span>
            </summary>
            <p>{f.answer}</p>
          </details>
        ))}
        {!results.length && (
          <p className="outline-panel">
            ไม่พบคำถาม ลองใช้คำสั้นลงหรือ
            <button className="text-link" onClick={() => setQuery("")}>
              ดูคำถามทั้งหมด
            </button>
          </p>
        )}
      </section>
      <Link href="/contact" className="v2-text-link">
        ดูช่องทางช่วยเหลือที่มีอยู่ <ArrowRight size={18} />
      </Link>
    </div>
  );
}
export function SupportPage({ path }: { path: string }) {
  if (path === "/help" || path === "/faq") return <Help />;
  const page = pages[path];
  if (!page) return null;
  return (
    <div className="page v2-support">
      <Breadcrumbs
        items={[{ label: "หน้าหลัก", href: "/" }, { label: page.title }]}
      />
      <header className="v2-page-heading">
        <span className="eyebrow">KNOW YOUR WELAA</span>
        <h1>{page.title}</h1>
        <p>{page.lead}</p>
      </header>
      <div className="v2-support-body">
        {page.sections.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </section>
        ))}
      </div>
      <div className="v2-related">
        <Link href="/help">
          คำถามที่พบบ่อย <ArrowUpRight size={16} />
        </Link>
        <Link href="/how-it-works">
          วิธีใช้งาน <ArrowUpRight size={16} />
        </Link>
        <Link href="/search">
          ค้นหาพื้นที่ <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
export function HostLanding() {
  return (
    <div className="page v2-host-landing">
      <Breadcrumbs
        items={[{ label: "หน้าหลัก", href: "/" }, { label: "ปล่อยพื้นที่" }]}
      />
      <section className="v2-host-intro">
        <div className="v2-page-heading">
          <span className="eyebrow">YOUR SPACE. NEW POSSIBILITIES.</span>
          <h1>
            เปิดพื้นที่ของคุณ
            <br />
            ให้ไอเดียใหม่ได้เริ่มต้น
          </h1>
          <p>
            พื้นที่ประชุม สตูดิโอ หรือมุมทำงาน
            <br />
            เลือกเวลาและราคาที่เหมาะกับคุณ
          </p>
          <div className="row wrap">
            <Link className="button" href="/host/new">
              เริ่มลงพื้นที่ <ArrowUpRight size={18} />
            </Link>
            <Link className="button secondary" href="/host">
              ศูนย์เจ้าของพื้นที่
            </Link>
          </div>
        </div>
        <div className="v2-host-photo">
          <Image
            src="/photos/workspace.jpg"
            alt="ภาพประกอบพื้นที่ทำงาน"
            fill
            sizes="(max-width:768px) 100vw, 50vw"
          />
        </div>
      </section>
      <div className="v2-host-tools">
        {[
          [
            House,
            "ลงรายละเอียดครั้งเดียว",
            "รูป กิจกรรม สิ่งอำนวยความสะดวก และกฎพื้นที่",
          ],
          [
            CalendarDays,
            "เปิดเวลาได้ตามสะดวก",
            "กำหนดชั่วโมงและราคาในปฏิทินของแต่ละพื้นที่",
          ],
          [
            UserRound,
            "เลือกตอบรับคำขอ",
            "ตรวจวัน เวลา และจำนวนคนก่อนตอบรับหรือปฏิเสธ",
          ],
        ].map(([Icon, title, body]) => {
          const I = Icon as typeof House;
          return (
            <div key={String(title)}>
              <I size={25} />
              <h2>{String(title)}</h2>
              <p>{String(body)}</p>
            </div>
          );
        })}
      </div>
      <section className="outline-panel v2-host-checklist">
        <h2>เตรียมอะไรบ้างก่อนเริ่ม?</h2>
        <ul>
          <li>บัญชี WELAA และสิทธิ์นำพื้นที่มาให้ใช้งาน</li>
          <li>รูปพื้นที่จริง รายละเอียดตำแหน่ง และความจุ</li>
          <li>กฎการใช้พื้นที่ ราคาต่อชั่วโมง และช่วงเวลาที่พร้อม</li>
        </ul>
        <p className="notice">
          ขณะนี้ยังไม่มีการรับเงินจริงหรือจ่ายรายได้ให้เจ้าของ ยอดใน Dashboard
          เป็นยอดทดสอบ ไม่ใช่รายได้จริง
        </p>
        <Link className="v2-text-link" href="/trust-and-safety">
          อ่านข้อควรรู้ก่อนเผยแพร่ <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
}
export const supportPaths = [
  "/about",
  "/help",
  "/faq",
  "/trust-and-safety",
  "/contact",
  "/terms",
  "/privacy",
];
