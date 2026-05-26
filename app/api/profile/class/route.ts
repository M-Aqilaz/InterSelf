import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CharacterClass, StatType } from "@prisma/client";
import { CLASS_DEFINITIONS } from "@/lib/classes";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const chosenClass = body?.characterClass as CharacterClass | undefined;

  if (!chosenClass || !Object.values(CharacterClass).includes(chosenClass)) {
    return NextResponse.json({ error: "Class tidak valid" }, { status: 400 });
  }

  return prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.characterClass !== null) {
      return NextResponse.json(
        { error: "Class sudah dipilih dan tidak bisa diubah" },
        { status: 409 }
      );
    }

    const classDef = CLASS_DEFINITIONS.find((c) => c.id === chosenClass);
    if (!classDef) {
      return NextResponse.json({ error: "Class definition not found" }, { status: 400 });
    }

    const updatedProfile = await tx.profile.update({
      where: { userId: user.id },
      data: {
        characterClass: chosenClass,
        classChosenAt: new Date(),
      },
    });

    const statUpdates = Object.entries(classDef.initialStats);
    await Promise.all(
      statUpdates.map(([statType, amount]) =>
        tx.stat.upsert({
          where: { userId_type: { userId: user.id, type: statType as StatType } },
          create: { userId: user.id, type: statType as StatType, value: amount },
          update: { value: { increment: amount } },
        })
      )
    );

    await tx.activityLog.create({
      data: {
        userId: user.id,
        type: "ITEM_EARNED",
        description: `Class ${classDef.name} dipilih`,
        metadata: {
          characterClass: chosenClass,
          initialStats: classDef.initialStats,
        },
      },
    });

    return NextResponse.json({
      success: true,
      characterClass: chosenClass,
      profile: updatedProfile,
      appliedStats: classDef.initialStats,
    });
  });
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { characterClass: true, classChosenAt: true },
  });

  return NextResponse.json({
    characterClass: profile?.characterClass ?? null,
    classChosenAt: profile?.classChosenAt ?? null,
    hasChosen: profile?.characterClass !== null,
  });
}
