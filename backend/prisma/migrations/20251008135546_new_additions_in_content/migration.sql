/*
  Warnings:

  - Added the required column `description` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Content" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
