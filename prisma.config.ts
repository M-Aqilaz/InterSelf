import 'dotenv/config'
const requiredKeys = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "DB_PORT",
] as const;

type RequiredKey = (typeof requiredKeys)[number];

type EnvMap = Record<RequiredKey, string>;

const getEnv = (): EnvMap => {
  const entries = requiredKeys.map((key) => {
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return [key, value] as const;
  });

  return Object.fromEntries(entries) as EnvMap;
};

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = getEnv();

const encodedUser = encodeURIComponent(DB_USER);
const encodedPassword = encodeURIComponent(DB_PASSWORD);
const normalizedPort = DB_PORT || "5432";

const connectionString = `postgresql://${encodedUser}:${encodedPassword}@${DB_HOST}:${normalizedPort}/${DB_NAME}?schema=public`;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = connectionString;
}

const prismaConfig = {
  schema: "./prisma/schema.prisma",
  env: {
    DATABASE_URL: connectionString,
  },
};

export default prismaConfig;