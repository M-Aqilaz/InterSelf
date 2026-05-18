import { Prisma } from "@prisma/client";

declare module "@prisma/client" {
  interface PrismaClient {
    user: Prisma.UserDelegate<Prisma.DefaultArgs>;
    profile: Prisma.ProfileDelegate<Prisma.DefaultArgs>;
    stat: Prisma.StatDelegate<Prisma.DefaultArgs>;
    task: Prisma.TaskDelegate<Prisma.DefaultArgs>;
    taskCompletion: Prisma.TaskCompletionDelegate<Prisma.DefaultArgs>;
    taskStatReward: Prisma.TaskStatRewardDelegate<Prisma.DefaultArgs>;
    achievement: Prisma.AchievementDelegate<Prisma.DefaultArgs>;
    userAchievement: Prisma.UserAchievementDelegate<Prisma.DefaultArgs>;
    inventoryItem: Prisma.InventoryItemDelegate<Prisma.DefaultArgs>;
    userInventory: Prisma.UserInventoryDelegate<Prisma.DefaultArgs>;
    boss: Prisma.BossDelegate<Prisma.DefaultArgs>;
    userBossProgress: Prisma.UserBossProgressDelegate<Prisma.DefaultArgs>;
    weeklyChallenge: Prisma.WeeklyChallengeDelegate<Prisma.DefaultArgs>;
    userChallengeProgress: Prisma.UserChallengeProgressDelegate<Prisma.DefaultArgs>;
    friendRequest: Prisma.FriendRequestDelegate<Prisma.DefaultArgs>;
    friendship: Prisma.FriendshipDelegate<Prisma.DefaultArgs>;
    activityLog: Prisma.ActivityLogDelegate<Prisma.DefaultArgs>;
  }
}
