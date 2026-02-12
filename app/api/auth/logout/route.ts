import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Clear the cookie on the Next.js side
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
