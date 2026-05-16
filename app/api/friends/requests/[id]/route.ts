import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cancelFriendRequest, respondToFriendRequest } from "@/lib/social";

type Params = Promise<{ id: string }>;

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);
  const body = await request.json().catch(() => ({}));
  const action = body?.action === "reject" ? "reject" : "accept";

  if (Number.isNaN(requestId)) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  try {
    const result = await respondToFriendRequest(user.id, requestId, action);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);

  if (Number.isNaN(requestId)) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  try {
    const result = await cancelFriendRequest(user.id, requestId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
