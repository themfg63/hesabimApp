import { NextRequest, NextResponse } from "next/server";

export const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8080"
    : "https://hesabimapp-production.up.railway.app");

export async function proxyJson(
  request: NextRequest,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
  }
) {
  try {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const authorizationHeader = request.headers.get("authorization");
    if (authorizationHeader) {
      headers.set("Authorization", authorizationHeader);
    }

    const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: options?.method ?? request.method,
      headers,
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Backend proxy error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}