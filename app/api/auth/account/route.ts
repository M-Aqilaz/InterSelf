import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      // Profile has no cascade from User, so it goes first.
      await tx.profile.deleteMany({ where: { userId: user.id } });
      // Personal tasks go with the account (their completions cascade); system tasks are shared.
      await tx.task.deleteMany({ where: { createdById: user.id, isSystem: false } });
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
