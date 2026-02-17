"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AthleteUpdateEmailButton({ athleteUuid, name }: { athleteUuid: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/athletes/${athleteUuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed");
      setOpen(false);
      setValue("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" className="btn-ghost" onClick={() => setOpen(true)} style={{ padding: "0.2rem 0.5rem", fontSize: "13px" }}>
        Update Email
      </button>
      {open && (
        <div className="card" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 20, minWidth: "320px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          <h3 style={{ margin: "0 0 0.5rem" }}>Update email for {name}</h3>
          <input
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Email"
            style={{ marginBottom: "0.5rem", display: "block", width: "100%", padding: "0.5rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => { setOpen(false); setValue(""); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {open && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 19 }} onClick={() => setOpen(false)} aria-hidden />}
    </>
  );
}
