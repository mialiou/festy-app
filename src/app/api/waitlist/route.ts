import { NextRequest, NextResponse } from "next/server";

// Replace with your Google Apps Script deployment URL
const GAS_URL = process.env.GAS_WAITLIST_URL ?? "";

export async function POST(request: NextRequest) {
  const { name, city, email } = await request.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (!GAS_URL) {
    // Dev fallback: just log and succeed
    console.log("Waitlist submission (no GAS_URL set):", { name, city, email });
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city, email, timestamp: new Date().toISOString() }),
    });

    if (!res.ok) throw new Error("GAS request failed");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
