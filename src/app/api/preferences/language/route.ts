import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { locale?: string };
  const locale = body.locale === "en" ? "en" : "fr";

  const response = NextResponse.json({ success: true, locale });
  response.cookies.set("yasarpack_locale", locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return response;
}
