import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../logger.js';

const router = Router();
router.use(authenticate);

// Sample SVG Image Generator (Crisp, zero-dependency, high-res simulated field photos)
function generateSampleSvgDataUri(title: string, subtitle: string, bgColor1: string, bgColor2: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${bgColor2};stop-opacity:1" />
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#1e293b;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#0f172a;stop-opacity:0.9" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)"/>
    <g opacity="0.15">
      <circle cx="200" cy="150" r="180" fill="#ffffff"/>
      <circle cx="1100" cy="600" r="250" fill="#ffffff"/>
      <line x1="100" y1="200" x2="1180" y2="200" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="10,10"/>
      <line x1="100" y1="400" x2="1180" y2="400" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="10,10"/>
    </g>
    <!-- Server Rack Illustration Elements -->
    <rect x="140" y="160" width="220" height="400" rx="12" fill="url(#cardGrad)" stroke="#38bdf8" stroke-width="2"/>
    <rect x="160" y="190" width="180" height="24" rx="4" fill="#334155"/>
    <circle cx="175" cy="202" r="4" fill="#22c55e"/>
    <circle cx="190" cy="202" r="4" fill="#38bdf8"/>
    <rect x="160" y="225" width="180" height="24" rx="4" fill="#334155"/>
    <circle cx="175" cy="237" r="4" fill="#22c55e"/>
    <circle cx="190" cy="237" r="4" fill="#eab308"/>
    <rect x="160" y="260" width="180" height="24" rx="4" fill="#334155"/>
    <circle cx="175" cy="272" r="4" fill="#22c55e"/>
    <rect x="160" y="295" width="180" height="24" rx="4" fill="#334155"/>
    <circle cx="175" cy="307" r="4" fill="#22c55e"/>
    <rect x="160" y="330" width="180" height="24" rx="4" fill="#334155"/>
    <circle cx="175" cy="342" r="4" fill="#22c55e"/>
    <!-- Central Text Banner -->
    <rect x="400" y="230" width="760" height="260" rx="16" fill="url(#cardGrad)" stroke="#475569" stroke-width="2"/>
    <text x="780" y="320" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="#f8fafc" text-anchor="middle" direction="rtl">${title}</text>
    <text x="780" y="380" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" direction="rtl">${subtitle}</text>
    <rect x="680" y="420" width="200" height="36" rx="18" fill="#0284c7"/>
    <text x="780" y="444" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">توثيق ميداني معتمد</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// POST /api/testdev/seed
router.post('/seed', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // 1. Seed Academic Profile (280 hours, 14 weeks)
    await prisma.reportProfile.upsert({
      where: { userId },
      create: {
        userId,
        studentName: 'عبد الله بن محمد القحطاني',
        trainingNumber: '442109876',
        department: 'هندسة البرمجيات وتطوير النظم',
        trainingUnit: 'الكلية التقنية الرقمية للاتصالات وتقنية المعلومات',
        supervisorName: 'د. خالد بن إبراهيم المنصور',
        responsibleName: 'م. عبد العزيز بن سعد الغامدي',
        entityAddress: 'شركة تقنية الحوسبة المتقدمة والحلول السحابية (CloudTech Solutions)',
        employeesCount: '250 موظفاً',
        trainingWeeks: 14,
        courseHours: 280,
        startDate: '2026-01-04',
        introText:
          'يمثّل التدريب التعاوني ركيزة أساسية في الخطة الأكاديمية ويهدف إلى إكساب المتدرب المهارات التطبيقية المباشرة في بيئة العمل المؤسسية ودمج العلوم النظرية بالخبرة الميدانية العملية لتأهيل الكوادر الوطنية وفق أعلى المعايير المهنية.',
        entityIntroText:
          'تعتبر شركة تقنية الحوسبة المتقدمة (CloudTech Solutions) من الجهات الرائدة في إدارة مراكز البيانات، تقديم حلول البنية التحتية السحابية الموزعة، أتمتة عمليات DevOps، وحماية الشبكات المؤسسية وقواعد البيانات الضخمة.',
        skillsText:
          '1. إدارة وتكوين خوادم لينكس والخدمات السحابية الهجينة.\n2. فحص وتوصيل كوابل شبكات الألياف الضوئية وموزعات البيانات المركزية.\n3. أتمتة مهام قواعد البيانات وإجراء النسخ الاحتياطي الدوري وضمان سلامة البيانات.\n4. مهارات التواصل المؤسسي وإعداد التقارير الفنية الدقيقة والعمل الجماعي الرصين.',
        conclusionText:
          'حققت فترة التدريب التعاوني كامل الأهداف الأكاديمية والمهنية المرسومة، وأسهمت في صقل المهارات الميدانية واكتساب خبرات تقنية متقدمة تلبي متطلبات سوق العمل. أتقدم بخالص الشكر والتقدير للمشرف الميداني ولإدارة الكلية على الدعم المستمر.',
        supervisorNotes:
          'أظهر المتدرب انضباطاً عالياً وسرعة فائقة في استيعاب الأنظمة وتطبيق المهام الموكلة إليه بكفاءة واحترافية متناهية.',
        supervisorRating: 'ممتاز (معتمد رسمياً)',
        supervisorApproved: true,
        supervisorApprovedAt: new Date()
      },
      update: {
        studentName: 'عبد الله بن محمد القحطاني',
        trainingNumber: '442109876',
        department: 'هندسة البرمجيات وتطوير النظم',
        trainingUnit: 'الكلية التقنية الرقمية للاتصالات وتقنية المعلومات',
        supervisorName: 'د. خالد بن إبراهيم المنصور',
        responsibleName: 'م. عبد العزيز بن سعد الغامدي',
        entityAddress: 'شركة تقنية الحوسبة المتقدمة والحلول السحابية (CloudTech Solutions)',
        employeesCount: '250 موظفاً',
        trainingWeeks: 14,
        courseHours: 280,
        startDate: '2026-01-04',
        introText:
          'يمثّل التدريب التعاوني ركيزة أساسية في الخطة الأكاديمية ويهدف إلى إكساب المتدرب المهارات التطبيقية المباشرة في بيئة العمل المؤسسية ودمج العلوم النظرية بالخبرة الميدانية العملية لتأهيل الكوادر الوطنية وفق أعلى المعايير المهنية.',
        entityIntroText:
          'تعتبر شركة تقنية الحوسبة المتقدمة (CloudTech Solutions) من الجهات الرائدة في إدارة مراكز البيانات، تقديم حلول البنية التحتية السحابية الموزعة، أتمتة عمليات DevOps، وحماية الشبكات المؤسسية وقواعد البيانات الضخمة.',
        skillsText:
          '1. إدارة وتكوين خوادم لينكس والخدمات السحابية الهجينة.\n2. فحص وتوصيل كوابل شبكات الألياف الضوئية وموزعات البيانات المركزية.\n3. أتمتة مهام قواعد البيانات وإجراء النسخ الاحتياطي الدوري وضمان سلامة البيانات.\n4. مهارات التواصل المؤسسي وإعداد التقارير الفنية الدقيقة والعمل الجماعي الرصين.',
        conclusionText:
          'حققت فترة التدريب التعاوني كامل الأهداف الأكاديمية والمهنية المرسومة، وأسهمت في صقل المهارات الميدانية واكتساب خبرات تقنية متقدمة تلبي متطلبات سوق العمل. أتقدم بخالص الشكر والتقدير للمشرف الميداني ولإدارة الكلية على الدعم المستمر.',
        supervisorNotes:
          'أظهر المتدرب انضباطاً عالياً وسرعة فائقة في استيعاب الأنظمة وتطبيق المهام الموكلة إليه بكفاءة واحترافية متناهية.',
        supervisorRating: 'ممتاز (معتمد رسمياً)',
        supervisorApproved: true,
        supervisorApprovedAt: new Date()
      }
    });

    // 2. Soft-delete old test entries to start clean
    await prisma.entry.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() }
    });

    await prisma.weeklyEvidence.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() }
    });

    // 3. Seed 14 Weeks of Daily Tasks (Sunday to Thursday, 20 hours per week = 280 hours)
    const baseDate = new Date('2026-01-04T00:00:00Z');
    const weekTopics = [
      { t: 'التهيئة العامة والتعريف بسياسات أمن المعلومات', c: 'تدريب وتعلّم' },
      { t: 'استكشاف بنية الخوادم وتثبيت بيئة أنظمة لينكس', c: 'تطوير / برمجة' },
      { t: 'فحص كوابل الألياف الضوئية وموزعات مركز البيانات', c: 'دعم فني' },
      { t: 'تكوين خوادم قواعد البيانات MySQL والنسخ الاحتياطي', c: 'تطوير / برمجة' },
      { t: 'مراقبة أداء الشبكات وإعداد جدران الحماية Firewall', c: 'دعم فني' },
      { t: 'اجتماع منتصف التدريب ومراجعة مؤشرات الأداء مع المشرف', c: 'اجتماعات' },
      { t: 'أتمتة مهام المراقبة والتحقق من سلامة الخدمات السحابية', c: 'تطوير / برمجة' },
      { t: 'صيانة وحدات تزويد الطاقة غير المنقطعة UPS بالسيرفرات', c: 'دعم فني' },
      { t: 'تحليل سجلات الأمان ومواجهة التهديدات السيبرانية', c: 'توثيق' },
      { t: 'تحديث الحزم الأمنية للخوادم واختبار التعافي من الكوارث', c: 'تطوير / برمجة' },
      { t: 'ورشة عمل هندسية حول البنية التحتية للحوسبة الموزعة', c: 'تدريب وتعلّم' },
      { t: 'توثيق إجراءات التشغيل القياسية SOP للإدارة التقنية', c: 'توثيق' },
      { t: 'اختبار تكامل الخدمات النهائية وإعداد بيئة الاختبار التجريبي', c: 'تطوير / برمجة' },
      { t: 'جلسة مناقشة التقرير الختامي واعتماد ساعات التدريب', c: 'اجتماعات' }
    ];

    const entriesToCreate: any[] = [];

    for (let w = 0; w < 14; w++) {
      const topic = weekTopics[w] || { t: `أعمال ومهام الأسبوع ${w + 1}`, c: 'تطوير / برمجة' };
      // 5 working days per week (Sun=0, Mon=1, Tue=2, Wed=3, Thu=4)
      for (let day = 0; day < 5; day++) {
        const currentDate = new Date(baseDate.getTime() + (w * 7 + day) * 24 * 60 * 60 * 1000);
        const dateStr = currentDate.toISOString().split('T')[0];

        entriesToCreate.push({
          userId,
          entryDate: dateStr,
          timeFrom: '08:00',
          timeTo: '12:00',
          title: `${topic.t} — اليوم ${day + 1}`,
          category: topic.c,
          description: `تنفيذ كافة المهام الميدانية الخاصة بـ (${topic.t}) ومتابعة النتائج التشغيلية مع فريق العمل والتحقق من استقرار الأنظمة وسير العمل وفق توجيهات المشرف المسؤول.`
        });
      }
    }

    for (const entry of entriesToCreate) {
      await prisma.entry.create({ data: entry });
    }

    // 4. Seed 4 Realistic Field Evidence Photos
    const evidenceItems = [
      {
        weekIndex: 2,
        caption: 'تفقد كبائن الخوادم المركزية (Server Racks) في مركز البيانات ومراقبة أنظمة التبريد',
        imageData: generateSampleSvgDataUri('خوادم مركز البيانات الرئيسي', 'Data Center Core Server Racks', '#0f172a', '#1e3a8a')
      },
      {
        weekIndex: 4,
        caption: 'فحص وتوصيل كوابل الألياف الضوئية (Fiber Optic Patch Panel) في غرفة الاتصالات',
        imageData: generateSampleSvgDataUri('كبائن توصيل الألياف الضوئية', 'Fiber Optic Distribution Hub', '#064e3b', '#0f172a')
      },
      {
        weekIndex: 7,
        caption: 'جلسة محاكاة واختبار اختراق وتأمين جدار الحماية (Firewall Configuration Lab)',
        imageData: generateSampleSvgDataUri('معمل محاكاة أمن الشبكات', 'Network Security Simulation Lab', '#4c1d95', '#0f172a')
      },
      {
        weekIndex: 11,
        caption: 'ورشة عمل تقنية مع فريق هندسة السحابة لمراجعة مؤشرات أداء قواعد البيانات',
        imageData: generateSampleSvgDataUri('قاعة الورش والتدريب التقني', 'Cloud Infrastructure Workshop Room', '#7c2d12', '#0f172a')
      }
    ];

    for (const ev of evidenceItems) {
      await prisma.weeklyEvidence.create({
        data: {
          userId,
          weekIndex: ev.weekIndex,
          caption: ev.caption,
          imageData: ev.imageData
        }
      });
    }

    logger.info({ userId }, 'TestDev: 14-week simulation seeded successfully');

    res.json({
      success: true,
      message: 'تم تفعيل وتوليد بيانات المحاكاة الأكاديمية لـ 14 أسبوعاً بنجاح!'
    });
  } catch (err: any) {
    logger.error({ err }, 'TestDev seed error');
    res.status(500).json({ error: err.message || 'تعذر توليد بيانات المحاكاة' });
  }
});

// POST /api/testdev/clear
router.post('/clear', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    await prisma.entry.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() }
    });

    await prisma.weeklyEvidence.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() }
    });

    logger.info({ userId }, 'TestDev: simulation data cleared');

    res.json({
      success: true,
      message: 'تم تفريغ البيانات التجريبية بنجاح، يمكنك البدء بسجل نظيف.'
    });
  } catch (err: any) {
    logger.error({ err }, 'TestDev clear error');
    res.status(500).json({ error: err.message || 'تعذر تفريغ البيانات' });
  }
});

export default router;
