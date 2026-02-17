"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function AthletesSearchForm({ initialQ = "", initialNonApp = false }: { initialQ?: string; initialNonApp?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = (inputRef.current?.value ?? "").trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    params.delete("cursor");
    router.push(`/dashboard/athletes?${params.toString()}`);
  }

  function toggleNonApp() {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("nonApp") === "1") {
      params.delete("nonApp");
    } else {
      params.set("nonApp", "1");
    }
    params.delete("cursor");
    router.push(`/dashboard/athletes?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={initialQ}
          placeholder="Search by name..."
          style={{ flex: "1", maxWidth: "320px" }}
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
        <input type="checkbox" checked={initialNonApp} onChange={toggleNonApp} />
        Filter Non App Athletes
      </label>
    </div>
  );
}
