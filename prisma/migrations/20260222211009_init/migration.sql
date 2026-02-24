-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('CORRESPONDENCE', 'PERMANENT');

-- CreateEnum
CREATE TYPE "ExperienceType" AS ENUM ('TEACHING', 'INDUSTRIAL', 'RESEARCH', 'ADMINISTRATIVE');

-- CreateEnum
CREATE TYPE "PublicationCategory" AS ENUM ('JOURNAL', 'CONFERENCE', 'BOOK', 'BOOK_CHAPTER');

-- CreateEnum
CREATE TYPE "PublicationIndexing" AS ENUM ('SCI', 'SCOPUS', 'NONE');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('UG', 'PG', 'PHD');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'FACULTY');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedById" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "gender" "Gender",
    "nationality" TEXT,
    "category" TEXT,
    "mobile" TEXT,
    "orcidId" TEXT,
    "userId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "type" "AddressType" NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "line3" TEXT,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employment" (
    "id" SERIAL NOT NULL,
    "organization" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "natureOfWork" TEXT NOT NULL,
    "payLevel" TEXT,
    "organizationType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "Employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Degree" (
    "id" SERIAL NOT NULL,
    "degreeName" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "yearOfPassing" INTEGER NOT NULL,
    "score" DOUBLE PRECISION,
    "scoreType" TEXT,
    "division" TEXT,
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "Degree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" SERIAL NOT NULL,
    "type" "ExperienceType" NOT NULL,
    "organization" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "natureOfWork" TEXT NOT NULL,
    "payScale" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseTaught" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "level" "CourseLevel" NOT NULL,
    "branch" TEXT NOT NULL,
    "times" INTEGER NOT NULL,
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "CourseTaught_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laboratory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" "CourseLevel" NOT NULL,
    "branch" TEXT NOT NULL,
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "Laboratory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" "PublicationCategory" NOT NULL,
    "publisher" TEXT NOT NULL,
    "isbn" TEXT,
    "year" INTEGER NOT NULL,
    "indexing" "PublicationIndexing" NOT NULL,
    "edition" TEXT,
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThesisSupervision" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "researchArea" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "ThesisSupervision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DissertationSupervision" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "facultyId" INTEGER NOT NULL,

    CONSTRAINT "DissertationSupervision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_orcidId_key" ON "Faculty"("orcidId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_userId_key" ON "Faculty"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Degree" ADD CONSTRAINT "Degree_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTaught" ADD CONSTRAINT "CourseTaught_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laboratory" ADD CONSTRAINT "Laboratory_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThesisSupervision" ADD CONSTRAINT "ThesisSupervision_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DissertationSupervision" ADD CONSTRAINT "DissertationSupervision_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
