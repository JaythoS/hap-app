-- AlterTable
ALTER TABLE "users" ADD COLUMN     "projectIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
