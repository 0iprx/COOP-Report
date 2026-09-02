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
        introText:
          'يمثّل التدريب التعاوني ركيزة جوهرية في تأهيل الكوادر الوطنية الشابة، حيث يسهم في سد الفجوة بين المعارف النظرية الأكاديمية والممارسات المهنية الواقعية في سوق العمل التقني.',
        entityIntroText:
          'تعد شركة هواوي السعودية (Huawei Tech Saudi) من أبرز رواد التكنولوجيا العالميين في قطاع الاتصالات والحلول السحابية وتقنيات الجيل الخامس، وتهدف إلى بناء عالم ذكي متصل بالكامل.',
        skillsText:
          'اكتساب مهارات متقدمة في إدارة وتكوين الشبكات المتقدمة، تحليل المتطلبات البرمجية، العمل ضمن فرق تقنية احترافية، والتواصل المؤسسي الفعال.',
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

  const entries: EntryDTO[] = entriesRaw.map(e => ({
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

  // Sort weeks chronologically
  const sortedWeekStarts = Array.from(weekMap.keys()).sort();
  const weeks: WeekGroup[] = sortedWeekStarts.map((ws, index) => {
    const weekEntries = weekMap.get(ws) || [];
    const totalHours = weekEntries.reduce((sum, e) => sum + calculateHoursBetween(e.timeFrom, e.timeTo), 0);
    const uniqueDays = new Set(weekEntries.map(e => e.entryDate)).size;

    return {
      weekIndex: index + 1,
      weekStart: ws,
      weekEnd: getWeekEnd(ws),
      totalHours: Number(totalHours.toFixed(1)),
      totalDays: uniqueDays,
      entries: weekEntries
    };
  });

  const totalHours = Number(weeks.reduce((sum, w) => sum + w.totalHours, 0).toFixed(1));
  const uniqueAllDays = new Set(entries.map(e => e.entryDate)).size;

  // Calculate full textual word count for report estimation
  const fullText = [
    profile.introText,
    profile.entityIntroText,
    profile.skillsText,
    profile.conclusionText,
    ...entries.map(e => `${e.title} ${e.description}`)
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
