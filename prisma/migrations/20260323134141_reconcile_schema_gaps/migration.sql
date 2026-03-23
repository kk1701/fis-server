/*
  Warnings:

  - You are about to drop the column `level` on the `Courses` table. All the data in the column will be lost.
  - You are about to drop the column `times` on the `Courses` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Courses` table. All the data in the column will be lost.
  - Added the required column `academicYear` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogCourseId` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `Courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Courses" DROP COLUMN "level",
DROP COLUMN "times",
DROP COLUMN "title",
ADD COLUMN     "academicYear" TEXT NOT NULL,
ADD COLUMN     "catalogCourseId" INTEGER NOT NULL,
ADD COLUMN     "hoursPerWeek" INTEGER,
ADD COLUMN     "mode" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "semester" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Faculty" ADD COLUMN     "designation" TEXT,
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "highestQualification" TEXT,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "specialization" TEXT[];

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "authors" TEXT[],
ADD COLUMN     "citation" TEXT,
ADD COLUMN     "doi" TEXT,
ADD COLUMN     "url" TEXT;

-- CreateTable
CREATE TABLE "CourseCatalog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "level" "CourseLevel" NOT NULL,
    "credits" INTEGER,

    CONSTRAINT "CourseCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseCatalog_code_key" ON "CourseCatalog"("code");

-- AddForeignKey
ALTER TABLE "CourseCatalog" ADD CONSTRAINT "CourseCatalog_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_catalogCourseId_fkey" FOREIGN KEY ("catalogCourseId") REFERENCES "CourseCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
