import { NextRequest } from "next/server";

import { proxyJson } from "../../../_lib/backend";

type RouteContext = {
  params: Promise<{
    ipoId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const body = await request.json();
  const { ipoId } = await context.params;
  return proxyJson(request, `/api/ipos/${ipoId}/price`, { method: "PATCH", body });
}