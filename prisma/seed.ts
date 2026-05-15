import {
  AchievementRarity,
  BossStatus,
  ChallengeStatus,
  ItemRarity,
  Prisma,
  PrismaClient,
  StatType,
  TaskCategory,
  TaskDifficulty,
} from "@prisma/client";

const prisma = new PrismaClient();

type SystemTaskSeed = {
  title: string;
  description: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  expReward: number;
  coinReward: number;
  streakImpact: number;
  statRewards: { stat: StatType; amount: number }[];
};

const systemTasks: SystemTaskSeed[] = [
  {
    title: "Solar Rise Protocol",
    description: "Complete breathwork, hydration, and journaling within 20 minutes of waking.",
    category: TaskCategory.WAKE_UP,
    difficulty: TaskDifficulty.MEDIUM,
    expReward: 120,
    coinReward: 45,
    streakImpact: 2,
    statRewards: [
      { stat: StatType.DISCIPLINE, amount: 8 },
      { stat: StatType.CONSISTENCY, amount: 5 },
    ],
  },
  {
    title: "Deep Work Sprint",
    description: "Ship 90 minutes of focused work with all notifications silenced.",
    category: TaskCategory.FOCUS,
    difficulty: TaskDifficulty.HARD,
    expReward: 210,
    coinReward: 80,
    streakImpact: 3,
    statRewards: [
      { stat: StatType.FOCUS, amount: 10 },
      { stat: StatType.INTELLIGENCE, amount: 6 },
    ],
  },
  {
    title: "Micro-Compound Workout",
    description: "Perform a 25-minute strength circuit or complete 10 micro-sets through the day.",
    category: TaskCategory.WORKOUT,
    difficulty: TaskDifficulty.MEDIUM,
    expReward: 160,
    coinReward: 60,
    streakImpact: 2,
    statRewards: [
      { stat: StatType.FITNESS, amount: 9 },
    ],
  },
  {
    title: "Wealth Sync Review",
    description: "Audit expenses, update your runway, and queue a high-leverage financial move.",
    category: TaskCategory.SAVE_MONEY,
    difficulty: TaskDifficulty.MEDIUM,
    expReward: 150,
    coinReward: 90,
    streakImpact: 2,
    statRewards: [
      { stat: StatType.FINANCE, amount: 10 },
      { stat: StatType.INTELLIGENCE, amount: 4 },
    ],
  },
  {
    title: "Nightly Systems Check",
    description: "Shut down all inputs, plan tomorrow, and log the day in under 15 minutes.",
    category: TaskCategory.FOCUS,
    difficulty: TaskDifficulty.EASY,
    expReward: 90,
    coinReward: 30,
    streakImpact: 1,
    statRewards: [
      { stat: StatType.CONSISTENCY, amount: 6 },
      { stat: StatType.DISCIPLINE, amount: 4 },
    ],
  },
];

type AchievementSeed = {
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlockCondition: string;
  rewardExp: number;
  rewardCoins: number;
};

const achievements: AchievementSeed[] = [
  {
    name: "Awakened Initiate",
    description: "Complete your first system task.",
    icon: "spark",
    rarity: AchievementRarity.COMMON,
    unlockCondition: "Finish any INTERSELF system task.",
    rewardExp: 100,
    rewardCoins: 50,
  },
  {
    name: "Momentum Architect",
    description: "Maintain a 7-day streak across any stat.",
    icon: "streak",
    rarity: AchievementRarity.RARE,
    unlockCondition: "Streak of 7 days on any tracked stat.",
    rewardExp: 250,
    rewardCoins: 120,
  },
  {
    name: "Void Runner",
    description: "Complete three Deep Work Sprints in a single week.",
    icon: "void",
    rarity: AchievementRarity.EPIC,
    unlockCondition: "Log 3 Deep Work Sprints within 7 days.",
    rewardExp: 400,
    rewardCoins: 180,
  },
  {
    name: "Prime Vanguard",
    description: "Defeat any system boss.",
    icon: "crown",
    rarity: AchievementRarity.LEGENDARY,
    unlockCondition: "Reduce a boss HP bar to zero.",
    rewardExp: 700,
    rewardCoins: 320,
  },
];

type InventorySeed = {
  name: string;
  rarity: ItemRarity;
  description: string;
  effect: string;
};

const inventoryItems: InventorySeed[] = [
  {
    name: "Chrono Lens",
    rarity: ItemRarity.RARE,
    description: "Reveal the highest leverage task in your queue.",
    effect: "+10% exp on FOCUS tasks for 24h",
  },
  {
    name: "Aurora Gauntlets",
    rarity: ItemRarity.EPIC,
    description: "Amplify workout payouts.",
    effect: "+15% coins + exp on WORKOUT tasks",
  },
  {
    name: "Vault Prism",
    rarity: ItemRarity.LEGENDARY,
    description: "Auto-invest a portion of earned coins.",
    effect: "Convert 20% coins into passive exp nightly",
  },
];

type BossSeed = {
  name: string;
  description: string;
  maxHp: number;
  rewardExp: number;
  rewardCoins: number;
  weakness: TaskCategory | null;
  status: BossStatus;
  rewardItemName?: string;
};

const bosses: BossSeed[] = [
  {
    name: "Echo Titan",
    description: "A towering AI that feeds on distractions and broken streaks.",
    maxHp: 1200,
    rewardExp: 800,
    rewardCoins: 400,
    weakness: TaskCategory.FOCUS,
    status: BossStatus.ACTIVE,
    rewardItemName: "Chrono Lens",
  },
  {
    name: "Gravemind Regent",
    description: "An ancient weight that manifests as procrastination and lethargy.",
    maxHp: 1500,
    rewardExp: 1100,
    rewardCoins: 520,
    weakness: TaskCategory.WORKOUT,
    status: BossStatus.ACTIVE,
    rewardItemName: "Aurora Gauntlets",
  },
];

type WeeklyChallengeSeed = {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  progressTarget: number;
  requiredTasks: Prisma.InputJsonValue;
  rewardExp: number;
  rewardCoins: number;
  status: ChallengeStatus;
  rewardItemName?: string;
};

const weeklyChallenges = (): WeeklyChallengeSeed[] => {
  const now = new Date();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  return [
    {
      title: "Streak Shield",
      description: "Complete the Solar Rise Protocol five times this week.",
      startDate: start,
      endDate: end,
      progressTarget: 5,
      requiredTasks: [{ title: "Solar Rise Protocol", count: 5 }],
      rewardExp: 500,
      rewardCoins: 220,
      status: ChallengeStatus.ACTIVE,
      rewardItemName: "Chrono Lens",
    },
    {
      title: "Vault Push",
      description: "Log three Wealth Sync Reviews and two Deep Work Sprints in 7 days.",
      startDate: start,
      endDate: end,
      progressTarget: 5,
      requiredTasks: [
        { title: "Wealth Sync Review", count: 3 },
        { title: "Deep Work Sprint", count: 2 },
      ],
      rewardExp: 650,
      rewardCoins: 300,
      status: ChallengeStatus.UPCOMING,
      rewardItemName: "Vault Prism",
    },
  ];
};

async function seedAchievements() {
  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { name: achievement.name },
    });

    if (existing) {
      await prisma.achievement.update({
        where: { id: existing.id },
        data: achievement,
      });
    } else {
      await prisma.achievement.create({ data: achievement });
    }
  }
}

async function seedInventoryItems() {
  const itemIdMap = new Map<string, number>();

  for (const item of inventoryItems) {
    const existing = await prisma.inventoryItem.findFirst({ where: { name: item.name } });

    if (existing) {
      const updated = await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: item,
      });
      itemIdMap.set(item.name, updated.id);
    } else {
      const created = await prisma.inventoryItem.create({ data: item });
      itemIdMap.set(item.name, created.id);
    }
  }

  return itemIdMap;
}

async function seedSystemTasks() {
  for (const task of systemTasks) {
    const existing = await prisma.task.findFirst({
      where: {
        title: task.title,
        isSystem: true,
      },
    });

    const sharedTaskData = {
      title: task.title,
      description: task.description,
      category: task.category,
      difficulty: task.difficulty,
      expReward: task.expReward,
      coinReward: task.coinReward,
      streakImpact: task.streakImpact,
      isSystem: true,
      createdById: null as string | null,
    };

    if (existing) {
      await prisma.taskStatReward.deleteMany({ where: { taskId: existing.id } });
      await prisma.task.update({
        where: { id: existing.id },
        data: {
          ...sharedTaskData,
          statRewards: {
            create: task.statRewards,
          },
        },
      });
    } else {
      await prisma.task.create({
        data: {
          ...sharedTaskData,
          statRewards: {
            create: task.statRewards,
          },
        },
      });
    }
  }
}

async function seedBosses(itemIdMap: Map<string, number>) {
  for (const boss of bosses) {
    const rewardItemId = boss.rewardItemName
      ? itemIdMap.get(boss.rewardItemName) ?? null
      : null;

    const bossData = {
      name: boss.name,
      description: boss.description,
      maxHp: boss.maxHp,
      rewardExp: boss.rewardExp,
      rewardCoins: boss.rewardCoins,
      weakness: boss.weakness,
      status: boss.status,
      rewardItemId,
    };

    const existing = await prisma.boss.findFirst({ where: { name: boss.name } });

    if (existing) {
      await prisma.boss.update({
        where: { id: existing.id },
        data: bossData,
      });
    } else {
      await prisma.boss.create({ data: bossData });
    }
  }
}

async function seedWeeklyChallenges(itemIdMap: Map<string, number>) {
  for (const challenge of weeklyChallenges()) {
    const rewardItemId = challenge.rewardItemName
      ? itemIdMap.get(challenge.rewardItemName) ?? null
      : null;

    const challengeData = {
      title: challenge.title,
      description: challenge.description,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      progressTarget: challenge.progressTarget,
      requiredTasks: challenge.requiredTasks,
      rewardExp: challenge.rewardExp,
      rewardCoins: challenge.rewardCoins,
      status: challenge.status,
      rewardItemId,
    };

    const existing = await prisma.weeklyChallenge.findFirst({
      where: { title: challenge.title },
    });

    if (existing) {
      await prisma.weeklyChallenge.update({
        where: { id: existing.id },
        data: challengeData,
      });
    } else {
      await prisma.weeklyChallenge.create({ data: challengeData });
    }
  }
}

async function main() {
  console.log("\n🌱 Seeding INTERSELF data...\n");
  await seedAchievements();
  const itemIdMap = await seedInventoryItems();
  await seedSystemTasks();
  await seedBosses(itemIdMap);
  await seedWeeklyChallenges(itemIdMap);
  console.log("✅ Seed complete\n");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
