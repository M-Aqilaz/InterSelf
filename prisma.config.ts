import "dotenv/config";

const requiredKeys = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "DB_PORT",
] as const;

type RequiredKey = (typeof requiredKeys)[number];

type EnvMap = Record<RequiredKey, string>;

const buildConnectionStringFromDbParts = (): string => {
  const entries = requiredKeys.map((key) => {
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Missing environment variable: DATABASE_URL or ${key}`);
    }

    return [key, value] as const;
  });

  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = Object.fromEntries(entries) as EnvMap;
  const encodedUser = encodeURIComponent(DB_USER);
  const encodedPassword = encodeURIComponent(DB_PASSWORD);
  const normalizedPort = DB_PORT || "5432";

  return `postgresql://${encodedUser}:${encodedPassword}@${DB_HOST}:${normalizedPort}/${DB_NAME}?schema=public`;
};

const connectionString = process.env.DATABASE_URL ?? buildConnectionStringFromDbParts();
process.env.DATABASE_URL = connectionString;

const prismaConfig = {
  schema: "./prisma/schema.prisma",
  env: {
    DATABASE_URL: connectionString,
  },
};

export default prismaConfig;
