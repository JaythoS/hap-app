-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('NORMAL', 'PROJE', 'SPONSOR');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "adsoyad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'NORMAL',
    "profilFoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
