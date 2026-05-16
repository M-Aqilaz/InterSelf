import { TaskCategory, TaskDifficulty } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { startOfToday } from "@/lib/time";

const isTaskCategory = (value: unknown): value is TaskCategory =>
  typeof value === "string" && Object.values(TaskCategory).includes(value as TaskCategory);

const isTaskDifficulty = (value: unknown): value is TaskDifficulty =>
  typeof value === "string" &&
  Object.values(TaskDifficulty).includes(value as TaskDifficulty);

const toIntegerOrDefault = (value: unknown, fallback: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.trunc(value);
};

// GET /api/tasks - list all tasks
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { isSystem: true },
          { createdById: user.id },
        ],
      },
      include: { statRewards: true },
      orderBy: [
        { isSystem: "desc" },
        { createdAt: "desc" },
      ],
    });

    const today = startOfToday();
    const todayCompletions = await prisma.taskCompletion.findMany({
      where: {
        userId: user.id,
        completedAt: { gte: today },
      },
      select: { taskId: true },
    });
    const completedSet = new Set(todayCompletions.map((completion) => completion.taskId));

    const enriched = tasks.map((task) => ({
      ...task,
      completedToday: completedSet.has(task.id),
    }));

    return NextResponse.json(enriched);
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      difficulty,
      expReward,
      coinReward,
      streakImpact,
    } = body ?? {};

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const resolvedCategory = isTaskCategory(category)
      ? category
      : TaskCategory.CUSTOM;
    const resolvedDifficulty = isTaskDifficulty(difficulty)
      ? difficulty
      : TaskDifficulty.EASY;
    const resolvedExp = toIntegerOrDefault(expReward, 0);
    const resolvedCoins = toIntegerOrDefault(coinReward, 0);
    const resolvedStreakImpact = toIntegerOrDefault(streakImpact, 1);

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: resolvedCategory,
        difficulty: resolvedDifficulty,
        expReward: resolvedExp,
        coinReward: resolvedCoins,
        streakImpact: resolvedStreakImpact,
        isSystem: false,
        createdBy: { connect: { id: user.id } },
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
