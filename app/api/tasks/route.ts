import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/tasks - list all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks failed", error);
    return NextResponse.json(
      { error: "Unable to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, completed = false } = body ?? {};

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        completed: Boolean(completed),
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks failed", error);
    return NextResponse.json(
      { error: "Unable to create task" },
      { status: 500 }
    );
  }
}
