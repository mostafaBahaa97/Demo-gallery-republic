"use client";

import { useEffect, useRef, useState } from "react";

export function AreaCombobox({
  areas,
  value,
  onChange,
}: {
  areas: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = query.trim() ? areas.filter((a) => a.includes(query.trim())) : areas;
  const showOther = query.trim() && !areas.includes(query.trim());

  return (
    <div className="relative" ref={wrapRef}>
      <label className="mb-2 block text-sm font-medium text-umber">
        المنطقة <span className="font-normal text-umber/40">(اختياري، بيسهّل التوصيل)</span>
      </label>
      <input
        type="text"
        autoComplete="off"
        value={query}
        placeholder="اكتبي اسم منطقتك للبحث…"
        className="w-full rounded-xl border border-[var(--line)] bg-ivory/40 px-4 py-3"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />
      {open && (
        <ul className="combo-list absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[var(--line)] bg-white text-sm shadow-lg">
          {filtered.map((a) => (
            <li
              key={a}
              className="cursor-pointer px-4 py-2.5 hover:bg-ivory"
              onMouseDown={() => {
                setQuery(a);
                onChange(a);
                setOpen(false);
              }}
            >
              {a}
            </li>
          ))}
          {showOther && (
            <li
              className="cursor-pointer px-4 py-2.5 font-medium text-gold hover:bg-ivory"
              onMouseDown={() => {
                onChange(query.trim());
                setOpen(false);
              }}
            >
              + منطقة أخرى: &quot;{query.trim()}&quot;
            </li>
          )}
          {filtered.length === 0 && !showOther && (
            <li className="px-4 py-2.5 text-umber/50">لا توجد نتائج</li>
          )}
        </ul>
      )}
    </div>
  );
}
