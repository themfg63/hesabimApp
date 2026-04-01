import { NextRequest } from "next/server";

import { proxyJson } from "../_lib/backend";

export async function GET(request: NextRequest) {
  return proxyJson(request, "/api/ipos");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyJson(request, "/api/ipos", { method: "POST", body });
}