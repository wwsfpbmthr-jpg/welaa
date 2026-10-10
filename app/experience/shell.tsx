"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Heart,
  House,
  UserRound,
  Wallet,
} from "lucide-react";
import { Logo } from "../ui";
import { useApp } from "../context";
export function DesktopNavigation() {
  const path = usePathname();
  return (
    <nav aria-label="เมนูหลักบนคอมพิวเตอร์">
      {[
        ["/search", "ค้นหาพื้นที่"],
        ["/explore", "สำรวจ"],
        ["/become-a-host", "ปล่อยพื้นที่"],
        ["/help", "ช่วยเหลือ"],
      ].map(([href, label]) => (
        <Link
          href={href}
          key={href}
          aria-current={
            path === href || path.startsWith(href + "/") ? "page" : undefined
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
export function Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-footer-main">
        <div className="v2-footer-brand">
          <Logo />
          <p>พื้นที่มีค่า ทุกเวลา</p>
          <small>
            สร้างความเป็นไปได้ใหม่
            <br />
            จากพื้นที่และเวลาที่คุณมี
          </small>
        </div>
        {[
          {
            label: "ค้นพบพื้นที่",
            links: [
              ["/explore", "สำรวจ WELAA"],
              ["/search", "ค้นหาพื้นที่"],
              ["/explore/activity/meetings", "พื้นที่ประชุม"],
              ["/explore/activity/content", "พื้นที่ถ่าย Content"],
            ],
          },
          {
            label: "ใช้งาน WELAA",
            links: [
              ["/how-it-works", "วิธีใช้งาน"],
              ["/become-a-host", "เป็นเจ้าของพื้นที่"],
              ["/account/bookings", "การจองของฉัน"],
              ["/account/saved", "พื้นที่ที่บันทึกไว้"],
            ],
          },
          {
            label: "รู้จักเรา",
            links: [
              ["/about", "เกี่ยวกับ WELAA"],
              ["/help", "ศูนย์ช่วยเหลือ"],
              ["/trust-and-safety", "ความปลอดภัย"],
              ["/contact", "ติดต่อและขอความช่วยเหลือ"],
            ],
          },
        ].map((group) => (
          <div key={group.label}>
            <h2>{group.label}</h2>
            {group.links.map(([href, label]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="v2-footer-bottom">
        <span>© {new Date().getFullYear()} WELAA</span>
        <Link href="/terms">ข้อควรรู้ในการใช้งาน</Link>
        <Link href="/privacy">ข้อมูลส่วนบุคคล</Link>
        <span className="v2-test-note">รุ่นทดลอง · ยังไม่มีการรับเงินจริง</span>
      </div>
    </footer>
  );
}
const accountLinks = [
  ["/account/bookings", "การจองของฉัน", CalendarDays],
  ["/account/saved", "พื้นที่ที่บันทึก", Heart],
  ["/account/payments", "การชำระเงิน", Wallet],
  ["/account/profile", "ข้อมูลส่วนตัว", UserRound],
] as const;
const hostLinks = [
  ["/host", "ภาพรวมและคำขอจอง", CalendarDays],
  ["/host/listings", "พื้นที่ของฉัน", House],
  ["/host/calendar", "เวลาว่างและราคา", CalendarDays],
  ["/host/earnings", "ยอดทดสอบ", Wallet],
] as const;
export function AccountNavigation({ host = false }: { host?: boolean }) {
  const path = usePathname(),
    query = useSearchParams();
  const active =
    path === "/account"
      ? "/account/" + (query.get("tab") || "bookings")
      : path === "/host" && query.get("tab") === "spaces"
        ? "/host/listings"
        : path === "/host" && query.get("tab") === "earnings"
          ? "/host/earnings"
          : path === "/host/bookings"
            ? "/host"
            : path;
  const { data } = useApp();
  return (
    <div className="v2-account-nav">
      <div className="v2-account-title">
        <div>
          <span className="eyebrow">
            {host ? "HOST WORKSPACE" : "YOUR WELAA"}
          </span>
          <h1>{host ? "ศูนย์เจ้าของพื้นที่" : "บัญชีของคุณ"}</h1>
          <p>
            {data.user
              ? `สวัสดี ${data.user.name}`
              : "เข้าสู่ระบบเพื่อจัดการข้อมูลของคุณ"}
          </p>
        </div>
        <Link
          className="button secondary"
          href={host ? "/account/bookings" : "/host"}
        >
          {host ? "ไปโหมดผู้เช่า" : "ไปโหมดเจ้าของพื้นที่"}
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <nav aria-label={host ? "เมนูเจ้าของพื้นที่" : "เมนูบัญชี"}>
        {(host ? hostLinks : accountLinks).map(([href, label, Icon]) => (
          <Link
            href={href}
            key={href}
            aria-current={active === href ? "page" : undefined}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
