/*
  Warnings:

  - Added the required column `level` to the `Degree` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('TENTH', 'TWELFTH', 'DIPLOMA', 'GRADUATION', 'POST_GRADUATION', 'DOCTORATE', 'OTHER');

-- AlterTable
ALTER TABLE "Degree" ADD COLUMN     "level" "DegreeLevel" NOT NULL;
