"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Map, LayoutGrid } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useApp } from "../context";
import {
  Categories,
  Choice,
  Check,
  Empty,
  SpaceCard,
  DataUnavailable,
} from "../ui";
import {
  facilities,
  types,
  normalizeCategory,
  money,
  slotStatus,
  instantInfo,
  parseSearch,
} from "../data";
import { SearchBox, SpaceSkeletons } from "./search-box";
import { Breadcrumbs } from "./discover";
function bounded(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  const n = Number(value);
  return value !== null && value !== "" && Number.isFinite(n)
    ? Math.min(max, Math.max(min, Math.floor(n)))
    : fallback;
}
export function SearchExperience() {
  const p = useSearchParams(),
    { all, data, ready, dataError, go } = useApp();
  const [editing, setEditing] = useState(false),
    [filter, setFilter] = useState(false),
    [mode, setMode] = useState<"grid" | "map">("grid"),
    [selected, setSelected] = useState("");
  const category = normalizeCategory(p.get("cat") || "ทั้งหมด"),
    city = p.get("city") || "ทั้งหมด",
    q = p.get("q") || "",
    date = p.get("date") || "",
    guests = bounded(p.get("guests"), 1, 1, 500),
    start = p.has("start") ? bounded(p.get("start"), 0, 0, 23) : null,
    duration = bounded(p.get("duration"), 1, 1, 24),
    min = bounded(p.get("min"), 0, 0, 100000),
    max = bounded(p.get("max"), 100000, 0, 100000),
    type = p.get("type") || "all",
    amenitiesParam = p.get("amenities") || "",
    instant = p.get("instant") === "1",
    sort = p.get("sort") || "newest";
  const amenities = useMemo(
    () => amenitiesParam.split(",").filter((a) => facilities.includes(a)),
    [amenitiesParam],
  );
  const [draft, setDraft] = useState({
    min: String(min || ""),
    max: max === 100000 ? "" : String(max),
    type,
    amenities,
    instant,
  });
  const parsed = useMemo(() => parseSearch(q), [q]);
  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(p.toString());
    Object.entries(changes).forEach(([k, v]) => {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    });
    go("/search" + (next.size ? "?" + next.toString() : ""));
  }
  function openFilters() {
    setDraft({
      min: String(min || ""),
      max: max === 100000 ? "" : String(max),
      type,
      amenities,
      instant,
    });
    setFilter(true);
  }
  const results = useMemo(() => {
    const matches = all.filter(
      (s) =>
        s.status === "published" &&
        (category === "ทั้งหมด" || s.activities.includes(category)) &&
        (city === "ทั้งหมด" || city === s.city) &&
        s.guests >= guests &&
        s.price >= min &&
        s.price <= max &&
        (type === "all" || s.type === type) &&
        amenities.every((a) => s.amenities.includes(a)) &&
        (!instant || !!instantInfo(s, data)) &&
        (!q ||
          parsed.cat !== "ทั้งหมด" ||
          parsed.city ||
          parsed.date ||
          parsed.guests ||
          parsed.duration ||
          `${s.name} ${s.description} ${s.city} ${s.area} ${s.type}`
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!date ||
          Array.from(
            { length: start !== null ? 1 : Math.max(0, s.close - s.open) },
            (_, i) => start ?? s.open + i,
          ).some(
            (h) =>
              h >= s.open &&
              h + duration <= s.close &&
              Array.from({ length: duration }, (_, i) => h + i).every(
                (hh) => slotStatus(s, date, hh, data) === "available",
              ),
          )),
    );
    if (sort === "low") matches.sort((a, b) => a.price - b.price);
    else if (sort === "high") matches.sort((a, b) => b.price - a.price);
    else if (sort === "capacity") matches.sort((a, b) => b.guests - a.guests);
    return matches;
  }, [
    all,
    data,
    category,
    city,
    guests,
    min,
    max,
    type,
    amenities,
    instant,
    q,
    parsed,
    date,
    start,
    duration,
    sort,
  ]);
  const mapped = results.filter((s) => s.hasCoordinates),
    mapSpace = mapped.find((s) => s.id === selected) || mapped[0];
  const chips = [
    ...(q ? [{ label: q, key: "q" }] : []),
    ...(city !== "ทั้งหมด" ? [{ label: city, key: "city" }] : []),
    ...(category !== "ทั้งหมด" ? [{ label: category, key: "cat" }] : []),
    ...(date ? [{ label: date, key: "date" }] : []),
    ...(guests > 1 ? [{ label: `${guests} คน`, key: "guests" }] : []),
    ...(min > 0 ? [{ label: `ตั้งแต่ ฿${money(min)}`, key: "min" }] : []),
    ...(max < 100000 ? [{ label: `ไม่เกิน ฿${money(max)}`, key: "max" }] : []),
    ...(type !== "all" ? [{ label: type, key: "type" }] : []),
    ...(instant ? [{ label: "มีช่วงว่างวันนี้", key: "instant" }] : []),
    ...amenities.map((a) => ({ label: a, key: "amenities" })),
  ];
  const count =
    Number(min > 0) +
    Number(max < 100000) +
    Number(type !== "all") +
    Number(instant) +
    amenities.length;
  return (
    <div className="page search-page v2-search">
      <Breadcrumbs
        items={[{ label: "หน้าหลัก", href: "/" }, { label: "ค้นหาพื้นที่" }]}
      />
      <header className="v2-search-heading">
        <div>
          <span className="eyebrow">FIND YOUR SPACE</span>
          <h1>ค้นหาพื้นที่ของคุณ</h1>
        </div>
        <p>เลือกสิ่งที่ต้องการ แล้วเปรียบเทียบก่อนจอง</p>
      </header>
      <div className="search-topbar">
        <button
          className="search-summary"
          onClick={() => setEditing(true)}
          aria-label="แก้ไขการค้นหา"
        >
          <Search size={21} />
          <span>
            <strong>
              {q || (city === "ทั้งหมด" ? "ค้นหาทุกเมือง" : city)}
            </strong>
            <small>
              {date || "เลือกวันภายหลังได้"} · {guests} คน
            </small>
          </span>
          <SlidersHorizontal size={18} />
        </button>
        <div className="search-controls">
          <button className="button secondary" onClick={openFilters}>
            <SlidersHorizontal size={17} />
            ตัวกรอง{count > 0 && <span className="filter-count">{count}</span>}
          </button>
          <Choice
            value={sort}
            onChange={(v) => update({ sort: v === "newest" ? null : v })}
            label="เรียงลำดับ"
            options={[
              { value: "newest", label: "เผยแพร่ล่าสุด" },
              { value: "low", label: "ราคาต่ำไปสูง" },
              { value: "high", label: "ราคาสูงไปต่ำ" },
              { value: "capacity", label: "ความจุมากที่สุด" },
            ]}
          />
        </div>
      </div>
      <Categories
        value={category}
        onChange={(v) => update({ cat: v === "ทั้งหมด" ? null : v })}
      />
      {chips.length > 0 && (
        <div className="search-chips" aria-label="เงื่อนไขที่เลือก">
          {chips.map((c) => (
            <button
              key={c.key + c.label}
              aria-label={"ล้าง " + c.label}
              onClick={() =>
                update(
                  c.key === "date"
                    ? { date: null, start: null, duration: null }
                    : c.key === "amenities"
                      ? {
                          amenities: amenities
                            .filter((a) => a !== c.label)
                            .join(","),
                        }
                      : { [c.key]: null },
                )
              }
            >
              {c.label}
              <X size={13} />
            </button>
          ))}
          <button className="clear-search" onClick={() => go("/search")}>
            ล้างทั้งหมด
          </button>
        </div>
      )}
      <div className="results-toolbar">
        <span role="status" aria-live="polite">
          {dataError ? (
            "ข้อมูลพื้นที่ยังไม่พร้อม"
          ) : ready ? (
            <>
              <b>{results.length}</b> พื้นที่{date && ` · ${date}`}
            </>
          ) : (
            "กำลังโหลดพื้นที่…"
          )}
        </span>
        {mapped.length > 0 && (
          <button
            className="button secondary"
            onClick={() => setMode(mode === "map" ? "grid" : "map")}
          >
            {mode === "map" ? <LayoutGrid size={17} /> : <Map size={17} />}{" "}
            {mode === "map" ? "ดูรายการ" : "ดูแผนที่"}
          </button>
        )}
      </div>
      <div
        className={
          "results-layout " + (mode === "map" && mapSpace ? "with-map" : "")
        }
      >
        {!ready ? (
          <SpaceSkeletons />
        ) : dataError ? (
          <DataUnavailable />
        ) : results.length ? (
          <div className="space-grid">
            {results.map((s) => (
              <SpaceCard key={s.id} s={s} result />
            ))}
          </div>
        ) : (
          <Empty
            title="ยังไม่พบพื้นที่ที่ตรงกับคุณ"
            sub="ลองเปลี่ยนเมือง วันเวลา หรือล้างตัวกรองเพื่อค้นหาใหม่"
          >
            <button className="button secondary" onClick={() => go("/search")}>
              ล้างเงื่อนไขและดูทั้งหมด
            </button>
          </Empty>
        )}
        {mode === "map" && mapSpace && (
          <aside className="map-panel">
            <iframe
              title="ตำแหน่งพื้นที่โดยประมาณ"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapSpace.lng - 0.025}%2C${mapSpace.lat - 0.02}%2C${mapSpace.lng + 0.025}%2C${mapSpace.lat + 0.02}&layer=mapnik&marker=${mapSpace.lat}%2C${mapSpace.lng}`}
              loading="lazy"
            />
            <div className="map-caption">
              <b>{mapSpace.name}</b>
              <p>ตำแหน่งโดยประมาณ · แสดงเฉพาะพื้นที่ที่ระบุพิกัด</p>
            </div>
            <div className="map-space-pills">
              {mapped.map((s) => (
                <button
                  key={s.id}
                  aria-pressed={s.id === mapSpace.id}
                  className={s.id === mapSpace.id ? "selected" : ""}
                  onClick={() => setSelected(s.id)}
                >
                  ฿{money(s.price)} · {s.name}
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="search-editor-dialog">
          <DialogTitle>แก้ไขการค้นหา</DialogTitle>
          <DialogDescription>เลือกเมือง วัน เวลา และจำนวนคน</DialogDescription>
          <SearchBox
            key={p.toString()}
            compact
            onSearch={() => setEditing(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={filter} onOpenChange={setFilter}>
        <DialogContent>
          <DialogTitle>พื้นที่แบบที่คุณต้องการ</DialogTitle>
          <DialogDescription>
            เลือกงบ ประเภท และสิ่งอำนวยความสะดวก
          </DialogDescription>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              update({
                min: draft.min,
                max: draft.max,
                type: draft.type === "all" ? null : draft.type,
                amenities: draft.amenities.join(","),
                instant: draft.instant ? "1" : null,
              });
              setFilter(false);
            }}
          >
            <div className="two-col">
              <label className="field">
                ราคาต่ำสุด / ชั่วโมง
                <input
                  aria-label="ราคาต่ำสุด"
                  type="number"
                  min="0"
                  max="100000"
                  value={draft.min}
                  onChange={(e) => setDraft({ ...draft, min: e.target.value })}
                  placeholder="ไม่จำกัด"
                />
              </label>
              <label className="field">
                ราคาสูงสุด / ชั่วโมง
                <input
                  aria-label="ราคาสูงสุด"
                  type="number"
                  min={draft.min || "0"}
                  max="100000"
                  value={draft.max}
                  onChange={(e) => setDraft({ ...draft, max: e.target.value })}
                  placeholder="ไม่จำกัด"
                />
              </label>
            </div>
            <label className="field">
              ประเภทพื้นที่
              <Choice
                value={draft.type}
                onChange={(v) => setDraft({ ...draft, type: v })}
                label="ประเภทพื้นที่"
                options={[{ value: "all", label: "ทุกประเภท" }, ...types]}
              />
            </label>
            <Check
              checked={draft.instant}
              onChange={(v) => setDraft({ ...draft, instant: v })}
            >
              มีช่วงว่างวันนี้ · ยังต้องรอเจ้าของตอบรับ
            </Check>
            <b>สิ่งอำนวยความสะดวก</b>
            <div className="selection-grid">
              {facilities.map((a) => (
                <Check
                  key={a}
                  checked={draft.amenities.includes(a)}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      amenities: v
                        ? [...draft.amenities, a]
                        : draft.amenities.filter((x) => x !== a),
                    })
                  }
                >
                  {a}
                </Check>
              ))}
            </div>
            <div className="row between">
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  setDraft({
                    min: "",
                    max: "",
                    type: "all",
                    amenities: [],
                    instant: false,
                  })
                }
              >
                ล้างตัวกรอง
              </button>
              <button className="button">ใช้ตัวกรอง</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
