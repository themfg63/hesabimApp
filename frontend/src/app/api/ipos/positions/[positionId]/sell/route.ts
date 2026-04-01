import { NextRequest } from "next/server";

import { proxyJson } from "../../../../_lib/backend";

type RouteContext = {
  params: Promise<{
    positionId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const body = await request.json();
  const { positionId } = await context.params;
  return proxyJson(request, `/api/ipos/positions/${positionId}/sell`, { method: "PATCH", body });
}