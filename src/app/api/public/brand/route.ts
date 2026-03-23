import { NextResponse } from "next/server";
import { getBrandSettings } from "@/lib/branding";

export async function GET() {
  const brand = await getBrandSettings();
  return NextResponse.json(brand);
}
