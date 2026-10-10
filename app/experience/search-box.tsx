"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  CalendarDays,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useApp } from "../context";
import { Choice } from "../ui";
import { cities, parseSearch, today, hour, normalizeCategory } from "../data";
export function SearchBox({
  compact = false,
  hero = false,
  onSearch,
}: {
  compact?: boolean;
  hero?: boolean;
  onSearch?: () => void;
}) {
  const { go, all } = useApp(),
    p = useSearchParams();
  const [q, setQ] = useState(p.get("q") || "");
  const [city, setCity] = useState(p.get("city") || "ทั้งหมด");
  const [date, setDate] = useState(p.get("date") || "");
  const [start, setStart] = useState(p.get("start") || "any");
  const [guests, setGuests] = useState(p.get("guests") || "1");
  const [advanced, setAdvanced] = useState(
    p.has("start") || Number(p.get("guests")) > 1,
  );
  const cityOptions = useMemo(() => {
    const options = [
      ...cities,
      ...new Set(
        all.map((s) => s.city).filter((c) => c && !cities.includes(c)),
      ),
    ];
    if (city !== "ทั้งหมด" && !options.includes(city)) options.push(city);
    return options;
  }, [all, city]);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const x = parseSearch(q),
      a = new URLSearchParams(compact ? p.toString() : "");
    ["q", "city", "date", "start", "duration", "guests"].forEach((key) =>
      a.delete(key),
    );
    if (q.trim()) a.set("q", q.trim());
    if ((x.city || city) !== "ทั้งหมด") a.set("city", x.city || city);
    const cat =
      x.cat !== "ทั้งหมด"
        ? x.cat
        : normalizeCategory(p.get("cat") || "ทั้งหมด");
    if (cat !== "ทั้งหมด") a.set("cat", cat);
    if (x.date || date || x.start || start !== "any")
      a.set("date", x.date || date || today());
    if (x.start || start !== "any") a.set("start", String(x.start || start));
    if (x.duration) a.set("duration", String(x.duration));
    else if (p.has("duration")) a.set("duration", p.get("duration")!);
    a.set("guests", String(x.guests || guests || 1));
    onSearch?.();
    go("/search?" + a.toString());
  }
  return (
    <form
      className={
        "discovery-search" +
        (compact ? " compact" : "") +
        (hero ? " home-discovery-search" : "")
      }
      onSubmit={submit}
    >
      <div className="discovery-query">
        <Search size={21} aria-hidden="true" />
        <input
          aria-label="ค้นหาพื้นที่"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ห้องประชุม สตูดิโอ หรือพื้นที่จัดกิจกรรม"
        />
      </div>
      <div className="discovery-search-main">
        <label className="discovery-field">
          <span>
            <MapPin size={14} />
            สถานที่
          </span>
          <Choice
            value={city}
            onChange={setCity}
            label="สถานที่"
            options={[{ value: "ทั้งหมด", label: "ทุกเมือง" }, ...cityOptions]}
          />
        </label>
        <label className="discovery-field">
          <span>
            <CalendarDays size={14} />
            วันที่
          </span>
          <input
            aria-label="วันที่ค้นหา"
            type="date"
            min={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {!date && (
            <small className="date-placeholder" aria-hidden="true">
              เลือกวันที่
            </small>
          )}
        </label>
        <button className="button discovery-submit">
          <Search size={18} />
          ค้นหาพื้นที่
        </button>
      </div>
      <div className="discovery-search-extra">
        <button
          type="button"
          className="search-more"
          aria-expanded={advanced}
          aria-controls={
            compact ? "search-options-results" : "search-options-home"
          }
          onClick={() => setAdvanced((v) => !v)}
        >
          <SlidersHorizontal size={14} />
          {advanced ? "ซ่อนตัวเลือกเพิ่มเติม" : "เวลาและจำนวนคน"}
          <ChevronDown size={14} className={advanced ? "rotated" : ""} />
        </button>
        <span>เลือกวันภายหลังได้</span>
      </div>
      {advanced && (
        <div
          className="discovery-options"
          id={compact ? "search-options-results" : "search-options-home"}
        >
          <label className="discovery-field">
            <span>ช่วงเวลา</span>
            <Choice
              value={start}
              onChange={setStart}
              label="เวลาเริ่ม"
              options={[
                { value: "any", label: "ทุกช่วงเวลา" },
                ...Array.from({ length: 16 }, (_, i) => ({
                  value: String(i + 8),
                  label: hour(i + 8),
                })),
              ]}
            />
          </label>
          <label className="discovery-field">
            <span>จำนวนคน</span>
            <input
              aria-label="จำนวนคน"
              type="number"
              min="1"
              max="500"
              required
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </label>
        </div>
      )}
    </form>
  );
}
export function SpaceSkeletons() {
  return (
    <div
      className="space-grid space-skeletons"
      role="status"
      aria-label="กำลังโหลดพื้นที่"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-skeleton" aria-hidden="true">
          <div />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
