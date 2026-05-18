-- Google OAuth users authenticate through the provider and do not have a local password.
ALTER TABLE "User" ALTER COLUMN "hashedPassword" DROP NOT NULL;
