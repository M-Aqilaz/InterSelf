import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { completeTaskForUser, TaskProgressionError } from "@/lib/progression";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const taskId = Number(id);

  if (Number.isNaN(taskId)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    const result = await completeTaskForUser({ userId: user.id, taskId });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof TaskProgressionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(`POST /api/tasks/${taskId}/complete failed`, error);
    return NextResponse.json({ error: "Unable to complete task" }, { status: 500 });
  }
}
