import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const isPrismaNotFoundError = (error: unknown): error is { code: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
};

type TaskUpdatePayload = {
  title?: string;
  description?: string | null;
  completed?: boolean;
};

// PUT /api/tasks/:id - update an existing task
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, description, completed } = body ?? {};
    const data: TaskUpdatePayload = {};

    if (typeof title === "string") {
      data.title = title;
    }

    if (typeof description === "string") {
      data.description = description;
    } else if (description === null) {
      data.description = null;
    }

    if (typeof completed === "boolean") {
      data.completed = completed;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Provide at least one field to update" },
        { status: 400 }
      );
    }

    const task = await prisma.task.update({
      where: { id },
      data,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error(`PUT /api/tasks/${id} failed`, error);
    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Unable to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/:id - remove a task
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/tasks/${id} failed`, error);
    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Unable to delete task" },
      { status: 500 }
    );
  }
}
