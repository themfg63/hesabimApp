import { NextRequest } from "next/server";

import { proxyJson } from "../../_lib/backend";

type RouteContext = {
  params: Promise<{
    ipoId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { ipoId } = await context.params;
  return proxyJson(request, `/api/ipos/${ipoId}`);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { ipoId } = await context.params;
  return proxyJson(request, `/api/ipos/${ipoId}`, { method: "DELETE" });
}