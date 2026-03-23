import { NextResponse } from "next/server";
import { getDictionary, isSupportedLocale } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale");
  const locale = isSupportedLocale(localeParam) ? localeParam : "fr";
  const dictionary = await getDictionary(locale);
  return NextResponse.json(dictionary);
}
