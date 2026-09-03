import { prisma } from '../db.js';
import {
  FinalReportData,
  WeekGroup,
  EntryDTO,
  ReportProfileDTO,
  calculateHoursBetween,
  getWeekStart,
  getWeekEnd,
  countWords,
  estimatePageCount
} from '@coop/shared';

export async function buildFinalReportData(userId: number): Promise<FinalReportData> {
  // Fetch profile or default
  let profileRecord = await prisma.reportProfile.findUnique({
    where: { userId }
  });

  if (!profileRecord) {
    profileRecord = await prisma.reportProfile.create({
      data: {
        userId,
        entityAddress: '',
        employeesCount: '',
        trainingWeeks: 14,
        courseHours: 280,
        startDate: '',
        introText:
          'يمثّل التدريب التعاوني ركيزة جوهرية في تأهيل الكوادر الوطنية الشابة، حيث يسهم في سد الفجوة بين المعارف النظرية الأكاديمية والممارسات المهنية الواقعية في سوق العمل التقني.',
        entityIntroText: '',
        skillsText:
          'اكتساب مهارات متقدمة في إدارة وتكوين النظم والشبكات، تحليل المتطلبات البرمجية، العمل ضمن فرق تقنية احترافية، والتواصل المؤسسي الفعال.',
        conclusionText:
          'في ختام فترة التدريب التعاوني، نؤكد على الأثر البالغ لهذه التجربة العملية في تطوير المهارات والجاهزية لسوق العمل، مع خالص الامتنان لإدارة التدريب والمشرفين.'
      }
    });
  }

  const profile: ReportProfileDTO = {
    userId: profileRecord.userId,
    studentName: profileRecord.studentName,
    trainingNumber: profileRecord.trainingNumber,
    department: profileRecord.department,
    trainingUnit: profileRecord.trainingUnit,
    supervisorName: profileRecord.supervisorName,
    responsibleName: profileRecord.responsibleName,
    entityAddress: profileRecord.entityAddress,
    employeesCount: profileRecord.employeesCount,
    trainingWeeks: profileRecord.trainingWeeks || 14,
    courseHours: (profileRecord as any).courseHours || 280,
    startDate: profileRecord.startDate || '',
    introText: profileRecord.introText,
    entityIntroText: profileRecord.entityIntroText,
    skillsText: profileRecord.skillsText,
    conclusionText: profileRecord.conclusionText
  };

  // Fetch entries
  const entriesRaw = await prisma.entry.findMany({
    where: { userId },
    orderBy: { entryDate: 'asc' }
  });

  const entries: EntryDTO[] = entriesRaw.map((e: {
    id: number;
    userId: number;
    entryDate: string;
    timeFrom: string;
    timeTo: string;
    title: string;
    category: string;
    description: string;
    deletedAt: Date | null;
    createdAt: Date;
  }) => ({
    id: e.id,
    userId: e.userId,
    entryDate: e.entryDate,
    timeFrom: e.timeFrom,
    timeTo: e.timeTo,
    title: e.title,
    category: e.category as EntryDTO['category'],
    description: e.description,
    createdAt: e.createdAt.toISOString()
  }));

  // Group entries by week
  const weekMap = new Map<string, EntryDTO[]>();
  for (const e of entries) {
    const ws = getWeekStart(e.entryDate);
    if (!weekMap.has(ws)) {
      weekMap.set(ws, []);
    }
    weekMap.get(ws)!.push(e);
  }

  const totalConfiguredWeeks = profile.trainingWeeks || 14;

  // Determine starting point
  let baseWeekStart = profile.startDate
    ? getWeekStart(profile.startDate)
    : entries.length > 0
      ? getWeekStart(entries[0].entryDate)
      : getWeekStart(new Date().toISOString().split('T')[0]);

  // Construct all training weeks (e.g. 1 to 14)
  const weeks: WeekGroup[] = [];
  const baseDate = new Date(`${baseWeekStart}T00:00:00Z`);

  for (let i = 0; i < totalConfiguredWeeks; i++) {
    const wDate = new Date(baseDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const ws = wDate.toISOString().split('T')[0];
    const weekEntries = weekMap.get(ws) || [];
    const totalHours = weekEntries.reduce((sum: number, e: EntryDTO) => sum + calculateHoursBetween(e.timeFrom, e.timeTo), 0);
    const uniqueDays = new Set(weekEntries.map((e: EntryDTO) => e.entryDate)).size;

    let status: 'completed' | 'in_progress' | 'pending' | 'postponed' = 'pending';
    if (weekEntries.length > 0) {
      status = totalHours >= 25 ? 'completed' : 'in_progress';
    }

    weeks.push({
      weekIndex: i + 1,
      weekStart: ws,
      weekEnd: getWeekEnd(ws),
      totalHours: Number(totalHours.toFixed(1)),
      totalDays: uniqueDays,
      entries: weekEntries,
      status
    });
  }

  const totalHours = Number(weeks.reduce((sum: number, w: WeekGroup) => sum + w.totalHours, 0).toFixed(1));
  const uniqueAllDays = new Set(entries.map((e: EntryDTO) => e.entryDate)).size;

  // Calculate full textual word count for report estimation
  const fullText = [
    profile.introText,
    profile.entityIntroText,
    profile.skillsText,
    profile.conclusionText,
    ...entries.map((e: EntryDTO) => `${e.title} ${e.description}`)
  ].join(' ');

  const wordCount = countWords(fullText);
  const estimatedPages = estimatePageCount(wordCount);

  return {
    profile,
    weeks,
    totalHours,
    totalEntries: entries.length,
    totalDays: uniqueAllDays,
    estimatedPages,
    wordCount
  };
}
