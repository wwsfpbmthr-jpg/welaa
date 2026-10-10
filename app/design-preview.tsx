"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
const widths = [375, 390, 768, 1024, 1440];
const routes = [
  ["/", "หน้าแรก"],
  ["/explore", "สำรวจ"],
  ["/search", "ค้นหา"],
  ["/become-a-host", "เจ้าของพื้นที่"],
  ["/help", "ช่วยเหลือ"],
  ["/account/bookings", "บัญชี"],
  ["/login", "เข้าสู่ระบบ"],
];
/** Existing preview-only workspace. iframe width is the actual responsive viewport. */
export default function DesignPreview() {
  const [width, setWidth] = useState(390),
    [route, setRoute] = useState("/");
  return (
    <div className="design-preview-workspace">
      <header>
        <div>
          <b>WELAA 2.0</b>
          <span>ตรวจดีไซน์ · เฉพาะ Preview</span>
        </div>
        <label>
          หน้าที่ตรวจ{" "}
          <select
            aria-label="หน้าที่ตรวจ"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
          >
            {routes.map(([path, label]) => (
              <option key={path} value={path}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div
          className="design-device-switch"
          role="group"
          aria-label="ขนาดหน้าจอ"
        >
          {widths.map((w) => (
            <button
              key={w}
              aria-pressed={width === w}
              onClick={() => setWidth(w)}
            >
              {w}px
            </button>
          ))}
        </div>
        <Link href={route} target="_blank">
          เปิดหน้า <ArrowUpRight size={16} />
        </Link>
      </header>
      <div className="design-preview-canvas">
        <iframe
          title="พรีวิว WELAA"
          src={route}
          style={{ width, height: 900 }}
        />
      </div>
    </div>
  );
}
