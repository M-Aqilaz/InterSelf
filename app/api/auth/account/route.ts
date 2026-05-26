import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.profile.deleteMany({ where: { userId: user.id } });
      await tx.task.updateMany({
        where: { createdById: user.id },
        data: { createdById: null },
      });
      await tx.user.delete({ where: { id: user.id } });
    });

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("DELETE /api/auth/account failed", error);
    return NextResponse.json({ error: "Unable to delete account" }, { status: 500 });
  }
}
