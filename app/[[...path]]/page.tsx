import type { Metadata } from "next";
const titles: Record<string, string> = {
  "/": "พื้นที่มีค่า ทุกเวลา",
  "/search": "ค้นหาพื้นที่",
  "/explore": "สำรวจพื้นที่",
  "/become-a-host": "ปล่อยพื้นที่กับ WELAA",
  "/host": "ศูนย์เจ้าของพื้นที่",
  "/host/new": "เพิ่มพื้นที่",
  "/host/listings": "พื้นที่ของฉัน",
  "/host/calendar": "เวลาว่างและราคา",
  "/host/earnings": "ยอดทดสอบ",
  "/account": "บัญชีของคุณ",
  "/account/bookings": "การจองของฉัน",
  "/account/saved": "พื้นที่ที่บันทึก",
  "/account/payments": "การชำระเงิน",
  "/account/profile": "ข้อมูลส่วนตัว",
  "/profile": "โปรไฟล์",
  "/checkout": "ตรวจสอบการจอง",
  "/login": "เข้าสู่ระบบ",
  "/about": "รู้จัก WELAA",
  "/help": "ศูนย์ช่วยเหลือ",
  "/faq": "คำถามที่พบบ่อย",
  "/how-it-works": "วิธีใช้งาน",
  "/trust-and-safety": "ความปลอดภัย",
  "/contact": "ติดต่อและขอความช่วยเหลือ",
  "/terms": "ข้อควรรู้ในการใช้งาน",
  "/privacy": "ข้อมูลส่วนบุคคล",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const { path = [] } = await params;
  const route = "/" + path.join("/");
  const title =
    titles[route] ||
    (path[0] === "explore"
      ? "ค้นพบพื้นที่ในแบบของคุณ"
      : path[0] === "spaces"
        ? "รายละเอียดพื้นที่"
        : "WELAA");
  return { title: `${title} — WELAA` };
}
export default function Page() {
  return null;
}
