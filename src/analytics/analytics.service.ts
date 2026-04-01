import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Report 1: Research Domain Profiling ──────────────

  async getResearchDomains() {
    const faculty = await this.prisma.faculty.findMany({
      where: { user: { status: 'APPROVED', deletedAt: null } },
      select: {
        id: true,
        name: true,
        specialization: true,
        department: { select: { name: true } },
        theses: { select: { researchArea: true } },
        publications: { select: { venue: true } },
      },
    });

    const domainMap: Record<string, { count: number; faculty: string[] }> = {};

    faculty.forEach((f) => {
      const domains = new Set<string>();

      // from specialization
      f.specialization?.forEach((s) => s && domains.add(s.trim()));

      // from thesis research areas
      f.theses?.forEach(
        (t) => t.researchArea && domains.add(t.researchArea.trim()),
      );

      domains.forEach((domain) => {
        if (!domainMap[domain]) domainMap[domain] = { count: 0, faculty: [] };
        domainMap[domain].count++;
        domainMap[domain].faculty.push(`${f.name} (${f.department.name})`);
      });
    });

    const sorted = Object.entries(domainMap)
      .map(([domain, data]) => ({ domain, ...data }))
      .sort((a, b) => b.count - a.count);

    return sorted;
  }

  // ── Report 2: Publication Trends ─────────────────────

  async getPublicationTrends() {
    const publications = await this.prisma.publication.findMany({
      select: {
        year: true,
        category: true,
        indexing: true,
      },
      orderBy: { year: 'asc' },
    });

    // group by year
    const yearMap: Record<
      number,
      {
        year: number;
        total: number;
        JOURNAL: number;
        CONFERENCE: number;
        BOOK: number;
        BOOK_CHAPTER: number;
        SCI: number;
        SCOPUS: number;
        NONE: number;
      }
    > = {};

    publications.forEach((p) => {
      if (!yearMap[p.year]) {
        yearMap[p.year] = {
          year: p.year,
          total: 0,
          JOURNAL: 0,
          CONFERENCE: 0,
          BOOK: 0,
          BOOK_CHAPTER: 0,
          SCI: 0,
          SCOPUS: 0,
          NONE: 0,
        };
      }
      yearMap[p.year].total++;
      yearMap[p.year][p.category]++;
      yearMap[p.year][p.indexing]++;
    });

    const trends = Object.values(yearMap).sort((a, b) => a.year - b.year);

    const summary = {
      total: publications.length,
      SCI: publications.filter((p) => p.indexing === 'SCI').length,
      SCOPUS: publications.filter((p) => p.indexing === 'SCOPUS').length,
      NONE: publications.filter((p) => p.indexing === 'NONE').length,
    };

    return { trends, summary };
  }

  // ── Report 3: Department Health Score ────────────────

  async getDepartmentHealth() {
    const departments = await this.prisma.department.findMany({
      include: {
        faculty: {
          where: { user: { status: 'APPROVED', deletedAt: null } },
          include: {
            publications: true,
            degrees: true,
            experiences: true,
            theses: true,
          },
        },
      },
    });

    const results = departments.map((dept) => {
      const facultyList = dept.faculty;
      const totalFaculty = facultyList.length;

      if (totalFaculty === 0) {
        return {
          department: dept.name,
          totalFaculty: 0,
          totalPublications: 0,
          sciScopusCount: 0,
          sciScopusRatio: 0,
          phdCount: 0,
          phdPercent: 0,
          avgExperienceYears: 0,
          activeTheses: 0,
          score: 0,
        };
      }

      const totalPublications = facultyList.reduce(
        (sum, f) => sum + f.publications.length,
        0,
      );

      const sciScopusCount = facultyList.reduce(
        (sum, f) =>
          sum +
          f.publications.filter(
            (p) => p.indexing === 'SCI' || p.indexing === 'SCOPUS',
          ).length,
        0,
      );

      const sciScopusRatio =
        totalPublications > 0 ? (sciScopusCount / totalPublications) * 100 : 0;

      const phdCount = facultyList.filter(
        (f) =>
          f.degrees.some((d) => d.level === 'DOCTORATE') ||
          f.highestQualification?.toLowerCase().includes('phd'),
      ).length;

      const phdPercent = (phdCount / totalFaculty) * 100;

      const avgExperienceYears =
        facultyList.reduce((sum, f) => sum + (f.experienceYears ?? 0), 0) /
        totalFaculty;

      const activeTheses = facultyList.reduce(
        (sum, f) => sum + f.theses.filter((t) => t.status === 'Ongoing').length,
        0,
      );

      // weighted score normalized to 100
      const pubScore = Math.min((totalPublications / totalFaculty) * 10, 30);
      const indexScore = (sciScopusRatio / 100) * 25;
      const phdScore = (phdPercent / 100) * 20;
      const expScore = Math.min((avgExperienceYears / 20) * 15, 15);
      const thesisScore = Math.min(activeTheses * 2, 10);
      const score = Math.round(
        pubScore + indexScore + phdScore + expScore + thesisScore,
      );

      return {
        department: dept.name,
        totalFaculty,
        totalPublications,
        sciScopusCount,
        sciScopusRatio: Math.round(sciScopusRatio),
        phdCount,
        phdPercent: Math.round(phdPercent),
        avgExperienceYears: Math.round(avgExperienceYears * 10) / 10,
        activeTheses,
        score,
      };
    });

    return results.sort((a, b) => b.score - a.score);
  }

  // ── Report 4: Faculty Research Momentum ──────────────

  async getResearchMomentum(departmentId?: number) {
    const currentYear = new Date().getFullYear();

    const faculty = await this.prisma.faculty.findMany({
      where: {
        user: { status: 'APPROVED', deletedAt: null },
        ...(departmentId && { departmentId }),
      },
      select: {
        id: true,
        name: true,
        designation: true,
        department: { select: { name: true } },
        publications: {
          select: { year: true, indexing: true },
        },
      },
    });

    const INDEXING_WEIGHT: Record<string, number> = {
      SCI: 3,
      SCOPUS: 2,
      NONE: 1,
    };

    const results = faculty.map((f) => {
      let score = 0;
      let recentCount = 0;

      f.publications.forEach((p) => {
        const age = currentYear - p.year;
        const recencyWeight =
          age === 0
            ? 1.0
            : age === 1
              ? 0.8
              : age === 2
                ? 0.6
                : age === 3
                  ? 0.4
                  : 0.2;

        const indexWeight = INDEXING_WEIGHT[p.indexing] ?? 1;
        score += indexWeight * recencyWeight;

        if (age <= 3) recentCount++;
      });

      return {
        facultyId: f.id,
        name: f.name,
        designation: f.designation ?? '—',
        department: f.department.name,
        totalPublications: f.publications.length,
        recentPublications: recentCount,
        momentumScore: Math.round(score * 10) / 10,
      };
    });

    return results.sort((a, b) => b.momentumScore - a.momentumScore);
  }

  // ── Report 5: Qualification Distribution ─────────────

  async getQualificationDistribution() {
    const departments = await this.prisma.department.findMany({
      include: {
        faculty: {
          where: { user: { status: 'APPROVED', deletedAt: null } },
          include: {
            degrees: { select: { level: true } },
          },
        },
      },
    });

    // institution-wide counts
    const institutionWide = {
      DOCTORATE: 0,
      POST_GRADUATION: 0,
      GRADUATION: 0,
      OTHER: 0,
    };

    const deptBreakdown = departments.map((dept) => {
      const total = dept.faculty.length;
      let phdCount = 0;
      let pgCount = 0;
      let ugCount = 0;
      let otherCount = 0;

      dept.faculty.forEach((f) => {
        const levels = f.degrees.map((d) => d.level);
        if (levels.includes('DOCTORATE')) {
          phdCount++;
          institutionWide.DOCTORATE++;
        } else if (levels.includes('POST_GRADUATION')) {
          pgCount++;
          institutionWide.POST_GRADUATION++;
        } else if (levels.includes('GRADUATION')) {
          ugCount++;
          institutionWide.GRADUATION++;
        } else {
          otherCount++;
          institutionWide.OTHER++;
        }
      });

      const phdPercent = total > 0 ? Math.round((phdCount / total) * 100) : 0;

      return {
        department: dept.name,
        total,
        phdCount,
        pgCount,
        ugCount,
        otherCount,
        phdPercent,
        compliant: phdPercent >= 50, // NAAC requires 50% PhD
      };
    });

    return {
      institutionWide,
      deptBreakdown: deptBreakdown.sort((a, b) => b.phdPercent - a.phdPercent),
    };
  }

  // ── Report 6: Experience Profile ─────────────────────

  async getExperienceProfile() {
    const departments = await this.prisma.department.findMany({
      include: {
        faculty: {
          where: { user: { status: 'APPROVED', deletedAt: null } },
          include: {
            experiences: { select: { type: true } },
          },
        },
      },
    });

    const deptData = departments.map((dept) => {
      const counts = {
        TEACHING: 0,
        INDUSTRIAL: 0,
        RESEARCH: 0,
        ADMINISTRATIVE: 0,
      };
      let multiDomain = 0;
      let teachingOnly = 0;

      dept.faculty.forEach((f) => {
        const types = new Set(f.experiences.map((e) => e.type));
        types.forEach((t) => {
          if (counts[t] !== undefined) counts[t]++;
        });
        if (types.size > 1) multiDomain++;
        if (types.size === 1 && types.has('TEACHING')) teachingOnly++;
      });

      return {
        department: dept.name,
        totalFaculty: dept.faculty.length,
        ...counts,
        multiDomain,
        teachingOnly,
      };
    });

    // institution-wide summary
    const summary = deptData.reduce(
      (acc, d) => ({
        TEACHING: acc.TEACHING + d.TEACHING,
        INDUSTRIAL: acc.INDUSTRIAL + d.INDUSTRIAL,
        RESEARCH: acc.RESEARCH + d.RESEARCH,
        ADMINISTRATIVE: acc.ADMINISTRATIVE + d.ADMINISTRATIVE,
        multiDomain: acc.multiDomain + d.multiDomain,
        teachingOnly: acc.teachingOnly + d.teachingOnly,
      }),
      {
        TEACHING: 0,
        INDUSTRIAL: 0,
        RESEARCH: 0,
        ADMINISTRATIVE: 0,
        multiDomain: 0,
        teachingOnly: 0,
      },
    );

    return { deptData, summary };
  }

  // ── Report 7: Course Load Analysis ───────────────────

  async getCourseLoad(academicYear?: string) {
    const courses = await this.prisma.courses.findMany({
      where: {
        ...(academicYear && { academicYear }),
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            department: { select: { name: true } },
          },
        },
        catalogCourse: { select: { name: true, code: true } },
      },
    });

    // faculty load map
    const facultyLoad: Record<
      number,
      {
        name: string;
        department: string;
        totalCourses: number;
        totalHours: number;
      }
    > = {};

    // course faculty count
    const courseFacultyCount: Record<
      string,
      {
        name: string;
        code: string;
        facultyCount: number;
      }
    > = {};

    courses.forEach((c) => {
      const fid = c.facultyId;
      if (!facultyLoad[fid]) {
        facultyLoad[fid] = {
          name: c.faculty.name,
          department: c.faculty.department.name,
          totalCourses: 0,
          totalHours: 0,
        };
      }
      facultyLoad[fid].totalCourses++;
      facultyLoad[fid].totalHours += c.hoursPerWeek ?? 0;

      const cid = c.catalogCourseId.toString();
      if (!courseFacultyCount[cid]) {
        courseFacultyCount[cid] = {
          name: c.catalogCourse.name,
          code: c.catalogCourse.code,
          facultyCount: 0,
        };
      }
      courseFacultyCount[cid].facultyCount++;
    });

    const facultyRanking = Object.values(facultyLoad)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 15);

    const courseRisks = Object.values(courseFacultyCount)
      .filter((c) => c.facultyCount <= 1)
      .sort((a, b) => a.facultyCount - b.facultyCount);

    return { facultyRanking, courseRisks };
  }

  // ── Report 8: Supervision Pipeline ───────────────────

  async getSupervisionPipeline() {
    const departments = await this.prisma.department.findMany({
      include: {
        faculty: {
          where: { user: { status: 'APPROVED', deletedAt: null } },
          include: {
            theses: true,
            dissertations: true,
          },
        },
      },
    });

    const deptData = departments.map((dept) => {
      const thesisStats = {
        Ongoing: 0,
        Completed: 0,
        Submitted: 0,
        Awarded: 0,
      };
      let totalDissertations = 0;

      dept.faculty.forEach((f) => {
        f.theses.forEach((t) => {
          if (thesisStats[t.status as keyof typeof thesisStats] !== undefined) {
            thesisStats[t.status as keyof typeof thesisStats]++;
          }
        });
        totalDissertations += f.dissertations.length;
      });

      return {
        department: dept.name,
        totalFaculty: dept.faculty.length,
        ...thesisStats,
        totalTheses: Object.values(thesisStats).reduce((a, b) => a + b, 0),
        totalDissertations,
      };
    });

    // top supervisors
    const allFaculty = await this.prisma.faculty.findMany({
      where: { user: { status: 'APPROVED', deletedAt: null } },
      select: {
        name: true,
        department: { select: { name: true } },
        _count: { select: { theses: true, dissertations: true } },
        theses: { select: { status: true } },
      },
    });

    const topSupervisors = allFaculty
      .map((f) => ({
        name: f.name,
        department: f.department.name,
        theses: f._count.theses,
        dissertations: f._count.dissertations,
        activeTheses: f.theses.filter((t) => t.status === 'Ongoing').length,
        total: f._count.theses + f._count.dissertations,
      }))
      .filter((f) => f.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return { deptData, topSupervisors };
  }
}
