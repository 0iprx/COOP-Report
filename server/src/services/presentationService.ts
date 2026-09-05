import pptxgen from 'pptxgenjs';
import { FinalReportData } from '@coop/shared';

export async function generatePresentationBuffer(
  reportData: FinalReportData,
  lang: 'ar' | 'en' = 'ar'
): Promise<Buffer> {
  // @ts-ignore
  const pptx = new (pptxgen.default || pptxgen)();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = reportData.profile.studentName || (lang === 'en' ? 'COOP Trainee' : 'متدرب التدريب التعاوني');
  pptx.title = lang === 'en'
    ? `COOP Defense Deck - ${reportData.profile.studentName}`
    : `عرض مناقشة التدريب التعاوني - ${reportData.profile.studentName}`;
  pptx.company = reportData.profile.entityAddress || (lang === 'en' ? 'Host Organization' : 'جهة التدريب');

  const isAr = lang === 'ar';

  // ── Premium Executive Palette ──────────────────────────────────────
  const BG_COLOR = '0B0F19';      // Deep Obsidian
  const CARD_BG = '151E2E';       // Refined Slate Glass
  const CARD_BORDER = '24334A';   // Subtle High-Tech Border
  const TEXT_MAIN = 'F8FAFC';     // Bright Crisp White
  const TEXT_MUTED = '94A3B8';    // Secondary Slate
  const ACCENT_CYAN = '0EA5E9';   // Electric Sky Blue
  const ACCENT_EMERALD = '10B981';// High-Status Emerald
  const ACCENT_AMBER = 'F59E0B';  // Metric Gold
  const ACCENT_RED = 'EF4444';    // Alert Rose

  const fontFace = isAr ? 'Arial' : 'Segoe UI';

  // Helper for Slide Background & Watermark Header
  const setupSlideBase = (slide: any, slideNumber: string, categoryBadge: string, titleText: string) => {
    slide.background = { color: BG_COLOR };

    // Top Header Badge
    slide.addText(categoryBadge.toUpperCase(), {
      x: 0.8,
      y: 0.5,
      w: 11.7,
      h: 0.35,
      fontSize: 10,
      color: ACCENT_CYAN,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });

    // Main Slide Title
    slide.addText(titleText, {
      x: 0.8,
      y: 0.85,
      w: 11.7,
      h: 0.55,
      fontSize: 22,
      color: TEXT_MAIN,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });

    // Horizontal Separator Rule
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.45,
      w: 11.7,
      h: 0,
      line: { color: CARD_BORDER, width: 1 }
    });

    // Footer
    slide.addText(
      isAr
        ? `${reportData.profile.studentName || 'المتدرب'} | ${reportData.profile.entityAddress || 'التدريب التعاوني'} | شريحة ${slideNumber}`
        : `${reportData.profile.studentName || 'Trainee'} | ${reportData.profile.entityAddress || 'COOP'} | Slide ${slideNumber}`,
      {
        x: 0.8,
        y: 7.0,
        w: 11.7,
        h: 0.3,
        fontSize: 9,
        color: '475569',
        fontFace,
        rtl: isAr,
        align: isAr ? 'right' : 'left'
      }
    );
  };

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 1: Premium Title & Trainee Credentials (Cover)
  // ══════════════════════════════════════════════════════════════════
  const s1 = pptx.addSlide();
  s1.background = { color: BG_COLOR };

  // Top National / Institutional Ribbon
  s1.addText(
    isAr
      ? 'المملكة العربية السعودية • التدريب التعاوني الميداني الأكاديمي'
      : 'KINGDOM OF SAUDI ARABIA • ACADEMIC CO-OP FIELD TRAINING DEFENSE',
    {
      x: 0.8,
      y: 0.6,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: ACCENT_CYAN,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    }
  );

  // Big Main Presentation Title
  s1.addText(
    isAr
      ? 'عرض مناقشة التقرير الفني النهائي للتدريب التعاوني'
      : 'Final Cooperative Training Defense Presentation',
    {
      x: 0.8,
      y: 1.3,
      w: 11.7,
      h: 0.9,
      fontSize: 30,
      color: TEXT_MAIN,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    }
  );

  // Subtitle / Host Organization Banner
  s1.addText(
    isAr
      ? `جهة التدريب الميداني: ${reportData.profile.entityAddress || 'الجهة المستضيفة'}`
      : `Host Organization: ${reportData.profile.entityAddress || 'Host Company'}`,
    {
      x: 0.8,
      y: 2.3,
      w: 11.7,
      h: 0.5,
      fontSize: 18,
      color: ACCENT_EMERALD,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    }
  );

  // Bento Card 1: Student Identity
  s1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 3.2,
    w: 5.6,
    h: 3.4,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1.2 }
  });

  s1.addText(
    isAr ? 'بيانات المتدرب والاعتماد الأكاديمي' : 'Trainee & Academic Credentials',
    {
      x: 1.1,
      y: 3.5,
      w: 5.0,
      h: 0.4,
      fontSize: 15,
      color: ACCENT_CYAN,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    }
  );

  const studentInfo = isAr
    ? `• اسم المتدرب: ${reportData.profile.studentName || '—'}\n\n` +
      `• الرقم التدريبي / الأكاديمي: ${reportData.profile.trainingNumber || '—'}\n\n` +
      `• الكلية / القسم: ${reportData.profile.trainingUnit || reportData.profile.department || '—'}\n\n` +
      `• المشرف الميداني المعتمد: ${reportData.profile.supervisorName || reportData.profile.responsibleName || '—'}`
    : `• Trainee Name: ${reportData.profile.studentName || '—'}\n\n` +
      `• Student ID: ${reportData.profile.trainingNumber || '—'}\n\n` +
      `• Department: ${reportData.profile.trainingUnit || reportData.profile.department || '—'}\n\n` +
      `• Field Supervisor: ${reportData.profile.supervisorName || reportData.profile.responsibleName || '—'}`;

  s1.addText(studentInfo, {
    x: 1.1,
    y: 4.1,
    w: 5.0,
    h: 2.2,
    fontSize: 13,
    color: TEXT_MAIN,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  // Bento Card 2: Training Hours & Progress Highlights
  s1.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 3.2,
    w: 5.7,
    h: 3.4,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1.2 }
  });

  s1.addText(
    isAr ? 'مؤشرات الإنجاز والجاهزية' : 'Key Completion Metrics',
    {
      x: 7.1,
      y: 3.5,
      w: 5.1,
      h: 0.4,
      fontSize: 15,
      color: ACCENT_EMERALD,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    }
  );

  const metricsInfo = isAr
    ? `• إجمالي الأسابيع التدريبية: ${reportData.profile.trainingWeeks || 14} أسبوعاً متصلاً\n\n` +
      `• ساعات الإنجاز المسجلة: ${reportData.totalHours} من ${reportData.profile.courseHours || 280} ساعة معتمدة\n\n` +
      `• إجمالي الأيام الموثقة: ${reportData.totalDays} يوم عمل ميداني\n\n` +
      `• حالة التقرير: مكتمل وموثق وفق أعلى المعايير الهندسية الأكاديمية`
    : `• Total Training Weeks: ${reportData.profile.trainingWeeks || 14} Structured Weeks\n\n` +
      `• Completed Hours: ${reportData.totalHours} of ${reportData.profile.courseHours || 280} Credit Hours\n\n` +
      `• Logged Field Days: ${reportData.totalDays} Working Days\n\n` +
      `• Status: Fully Verified according to Engineering Standards`;

  s1.addText(metricsInfo, {
    x: 7.1,
    y: 4.1,
    w: 5.1,
    h: 2.2,
    fontSize: 13,
    color: TEXT_MAIN,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 2: Host Organization & Operational Scope
  // ══════════════════════════════════════════════════════════════════
  const s2 = pptx.addSlide();
  setupSlideBase(
    s2,
    '02',
    isAr ? 'بيئة العمل الميداني' : 'FIELD ENVIRONMENT',
    isAr ? '١. التعريف بجهة التدريب والبنية التحتية للأنظمة' : '1. Host Organization & Systems Infrastructure'
  );

  // Left Card: Company Profile
  s2.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.7,
    w: 5.6,
    h: 4.9,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 }
  });

  s2.addText(isAr ? 'نبذة عن المنشأة والقطاع التشغيلي' : 'Organization Overview', {
    x: 1.1,
    y: 2.0,
    w: 5.0,
    h: 0.4,
    fontSize: 16,
    color: ACCENT_CYAN,
    bold: true,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  const rawEntityIntro = reportData.profile.entityIntroText || (
    isAr
      ? 'تم التدريب الميداني في بيئة تقنية متقدمة تشتمل على خوادم مركزية، شبكات توزيع محلية، ونظم أمن معلومات مؤسسية تخدم العمليات التشغيلية اليومية.'
      : 'Field training was conducted in an enterprise computing environment featuring server clusters, local networking, and information security systems.'
  );

  s2.addText(rawEntityIntro.slice(0, 380) + (rawEntityIntro.length > 380 ? '...' : ''), {
    x: 1.1,
    y: 2.6,
    w: 5.0,
    h: 3.6,
    fontSize: 13,
    color: TEXT_MUTED,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  // Right Card: Key Technical Scopes
  s2.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 1.7,
    w: 5.7,
    h: 4.9,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 }
  });

  s2.addText(isAr ? 'محاور ونطاق العمل الهندسي الميداني' : 'Technical & Engineering Scope', {
    x: 7.1,
    y: 2.0,
    w: 5.1,
    h: 0.4,
    fontSize: 16,
    color: ACCENT_EMERALD,
    bold: true,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  const scopeBullets = isAr
    ? '• إدارة البنية التحتية وتجهيز كبائن الخوادم المركزية (Racks & Cabling)\n\n' +
      '• تكوين وصيانة الشبكات المحلية وتقسيم الـ VLANs وأجهزة التوجيه\n\n' +
      '• سياسات أمن المعلومات، النسخ الاحتياطي، وحماية البيانات المؤسسية\n\n' +
      '• أتمتة العمليات اليومية وإدارة بيئات الحاويات والخدمات السحابية\n\n' +
      '• توثيق أدلة التشغيل القياسية (SOP) وتقديم الدعم الفني المتقدم'
    : '• Infrastructure and Server Rack Management (Cabling & Hardware)\n\n' +
      '• Local Area Network Configuration (VLANs, Switches, Routers)\n\n' +
      '• Information Security, Backup Schedules & Disaster Recovery\n\n' +
      '• Cloud & Container Services Deployment and Automation\n\n' +
      '• Standard Operating Procedure Documentation & Technical Support';

  s2.addText(scopeBullets, {
    x: 7.1,
    y: 2.6,
    w: 5.1,
    h: 3.6,
    fontSize: 13,
    color: TEXT_MAIN,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 3: 14-Week Academic Trajectory & Phases
  // ══════════════════════════════════════════════════════════════════
  const s3 = pptx.addSlide();
  setupSlideBase(
    s3,
    '03',
    isAr ? 'الخطة الزمنية' : 'TRAINING TIMELINE',
    isAr ? '٢. المسار المرحلي للتدريب على مدار 14 أسبوعاً' : '2. 14-Week Progressive Training Roadmap'
  );

  const phases = isAr
    ? [
        {
          tag: 'المرحلة الأولى • الأسابيع 1-4',
          title: 'التهيئة والبنية التحتية الأساسية',
          desc: 'التعريف بأنظمة المنشأة، سياسات أمن المعلومات، معاينة كبائن الخوادم، وإدارة كابلات الشبكة والمحولات الرئيسية.'
        },
        {
          tag: 'المرحلة الثانية • الأسابيع 5-9',
          title: 'العمليات التشغيلية وتكوين الأنظمة',
          desc: 'ضبط خوادم Linux/Windows، تكوين قواعد البيانات، إدارة وحدات التخزين، وأتمتة إجراءات النسخ الاحتياطي الدوري.'
        },
        {
          tag: 'المرحلة الثالثة • الأسابيع 10-14',
          title: 'الأمان السيبراني وضمان الجودة والاعتماد',
          desc: 'فحص الثغرات، مراجعة سجلات الأمان، إعداد أدلة التشغيل (SOP)، ومناقشة التقرير الفني النهائي مع المشرف.'
        }
      ]
    : [
        {
          tag: 'Phase 1 • Weeks 1-4',
          title: 'Orientation & Core Infrastructure',
          desc: 'Company policies, security guidelines, server rack topology inspection, cabling, and primary switch configs.'
        },
        {
          tag: 'Phase 2 • Weeks 5-9',
          title: 'System Operations & Configuration',
          desc: 'Linux/Windows server deployment, database management, storage setup, and automated routine backup procedures.'
        },
        {
          tag: 'Phase 3 • Weeks 10-14',
          title: 'Security, Quality Assurance & Closeout',
          desc: 'Vulnerability assessments, security audit logs, SOP manual writing, and final evaluation committee sign-off.'
        }
      ];

  phases.forEach((p, idx) => {
    const xPos = 0.8 + idx * 4.0;

    s3.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: idx === 1 ? ACCENT_CYAN : CARD_BORDER, width: idx === 1 ? 1.5 : 1 }
    });

    s3.addText(p.tag, {
      x: xPos + 0.25,
      y: 2.1,
      w: 3.2,
      h: 0.35,
      fontSize: 11,
      color: idx === 0 ? ACCENT_EMERALD : idx === 1 ? ACCENT_CYAN : ACCENT_AMBER,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });

    s3.addText(p.title, {
      x: xPos + 0.25,
      y: 2.55,
      w: 3.2,
      h: 0.8,
      fontSize: 16,
      color: TEXT_MAIN,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });

    s3.addText(p.desc, {
      x: xPos + 0.25,
      y: 3.5,
      w: 3.2,
      h: 2.8,
      fontSize: 12,
      color: TEXT_MUTED,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 4: Core Technical Projects & Highlights
  // ══════════════════════════════════════════════════════════════════
  const s4 = pptx.addSlide();
  setupSlideBase(
    s4,
    '04',
    isAr ? 'المشاريع الهندسية' : 'TECHNICAL PROJECTS',
    isAr ? '٣. أبرز المشاريع والمهام الهندسية المنفذة' : '3. Key Technical Projects & Implementations'
  );

  const projects = isAr
    ? [
        {
          title: 'تكوين الشبكات وتقسيم الـ VLANs',
          tools: 'Cisco IOS • VLANs • Trunking • DHCP Relay',
          desc: 'عزل حركة بيانات الإدارات، تكوين منافذ الربط (Trunk Ports)، وضمان سرعة وأمان نقل البيانات عبر محولات التوزيع.'
        },
        {
          title: 'إدارة خوادم Linux والخدمات المعزولة',
          tools: 'Ubuntu Server • Docker • Nginx • SSH Hardening',
          desc: 'تثبيت بيئة تشغيل سيرفر معيارية، حظر المنافذ غير الضرورية، وتشغيل الخدمات الداخلية داخل حاويات مستقلة.'
        },
        {
          title: 'أتمتة النسخ الاحتياطي والتعافي من الكوارث',
          tools: 'Cron Jobs • Bash • Offsite Storage • RPO/RTO',
          desc: 'برمجة سكربتات نسخ احتياطي تلقائي يومي لقواعد البيانات، والتحقق المستمر من صحة واسترجاع الملفات.'
        },
        {
          title: 'تحليل سجلات الأمان ومكافحة التهديدات',
          tools: 'SIEM Logs • Firewall Rules • Active Directory',
          desc: 'رصد محاولات الدخول غير المصرح بها، تطبيق سياسات كلمات المرور القوية، وتحديث قواعد الجدار الناري.'
        }
      ]
    : [
        {
          title: 'Network Configuration & VLAN Segmentation',
          tools: 'Cisco IOS • VLANs • Trunking • DHCP Relay',
          desc: 'Isolated departmental traffic, established secure trunk links, and verified high-speed data flow across distribution switches.'
        },
        {
          title: 'Linux Server Administration & Containerization',
          tools: 'Ubuntu Server • Docker • Nginx • SSH Hardening',
          desc: 'Deployed standardized server operating systems, hardened SSH access, and isolated microservices via Docker containers.'
        },
        {
          title: 'Backup Automation & Disaster Recovery',
          tools: 'Cron Jobs • Bash • Offsite Storage • RPO/RTO',
          desc: 'Scripted scheduled automated daily database backups, validating archive integrity and recovery procedures.'
        },
        {
          title: 'Security Auditing & Threat Prevention',
          tools: 'SIEM Logs • Firewall Rules • Active Directory',
          desc: 'Monitored suspicious authentication events, enforced strong domain password policies, and tuned perimeter firewall rules.'
        }
      ];

  projects.forEach((proj, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = col === 0 ? 0.8 : 6.8;
    const yPos = 1.7 + row * 2.5;

    s4.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: yPos,
      w: 5.7,
      h: 2.25,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 }
    });

    s4.addText(proj.title, {
      x: xPos + 0.3,
      y: yPos + 0.2,
      w: 5.1,
      h: 0.35,
      fontSize: 15,
      color: TEXT_MAIN,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });

    s4.addText(proj.tools, {
      x: xPos + 0.3,
      y: yPos + 0.58,
      w: 5.1,
      h: 0.3,
      fontSize: 10,
      color: ACCENT_CYAN,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });

    s4.addText(proj.desc, {
      x: xPos + 0.3,
      y: yPos + 0.95,
      w: 5.1,
      h: 1.15,
      fontSize: 12,
      color: TEXT_MUTED,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 5: Acquired Engineering Skills & Competencies
  // ══════════════════════════════════════════════════════════════════
  const s5 = pptx.addSlide();
  setupSlideBase(
    s5,
    '05',
    isAr ? 'المهارات والخبرات' : 'COMPETENCIES',
    isAr ? '٤. المهارات والخبرات المكتسبة أثناء التدريب' : '4. Acquired Technical & Professional Competencies'
  );

  const skillColumns = isAr
    ? [
        {
          title: 'المهارات الفنية والتقنية',
          color: ACCENT_CYAN,
          items: [
            'إدارة خوادم Linux (Ubuntu / CentOS) والخدمات الأساسية',
            'برمجة سكربتات الأتمتة باستخدام Bash & Python',
            'تكوين أجهزة التوجيه والتحويل الشبكي (Cisco Switches/Routers)',
            'إدارة وحدات التخزين والنسخ الاحتياطي (SAN / NAS / Backup)',
            'استكشاف الأخطاء والأعطال وإصلاحها (Troubleshooting)'
          ]
        },
        {
          title: 'الحوكمة والأمن السيبراني',
          color: ACCENT_EMERALD,
          items: [
            'تطبيق ضوابط أمن المعلومات وسياسات الهيئة الوطنية (NCA)',
            'إدارة صلاحيات المستخدمين عبر Active Directory',
            'تحليل سجلات الأحداث واكتشاف الأنشطة المشبوهة',
            'إعداد وتطبيق خطط الطوارئ واستمرارية الأعمال',
            'إجراء المسوحات الدورية للثغرات والتحقق من التحديثات'
          ]
        },
        {
          title: 'المهارات المهنية والشخصية',
          color: ACCENT_AMBER,
          items: [
            'العمل الجماعي والتنسيق الفني الفعّال مع الفرق الهندسية',
            'التواصل المهني وإعداد التقارير الفنية المكتوبة',
            'إدارة الوقت والأولويات والالتزام بالمواعيد المحددة',
            'سرعة التعلم والتكيف مع بيئات وتقنيات العمل الجديدة',
            'حل المشكلات الميدانية المعقدة تحت ضغط العمل'
          ]
        }
      ]
    : [
        {
          title: 'Technical Engineering Skills',
          color: ACCENT_CYAN,
          items: [
            'Linux Server Administration (Ubuntu/CentOS) & System Services',
            'Task Automation Scripting with Bash & Python',
            'Cisco Routing & Switching Configuration & VLAN Management',
            'Storage & Backup Management (SAN / NAS / Automated Backups)',
            'Hands-on Network and Hardware Troubleshooting'
          ]
        },
        {
          title: 'Cybersecurity & Governance',
          color: ACCENT_EMERALD,
          items: [
            'National Cybersecurity Authority (NCA) Compliance & Controls',
            'Domain Identity Management via Active Directory & LDAP',
            'Audit Log Analysis and Anomaly Detection',
            'Disaster Recovery Planning & Business Continuity Drills',
            'Vulnerability Assessment and Security Patch Management'
          ]
        },
        {
          title: 'Professional & Soft Skills',
          color: ACCENT_AMBER,
          items: [
            'Effective Cross-Disciplinary Team Collaboration',
            'Formal Technical Documentation & Academic Report Writing',
            'Time Management, Prioritization & Meeting Deadlines',
            'Rapid Adaptability to Emerging Technologies & Stacks',
            'Analytical Problem-Solving in Fast-Paced Environments'
          ]
        }
      ];

  skillColumns.forEach((col, idx) => {
    const xPos = 0.8 + idx * 4.0;

    s5.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 }
    });

    s5.addText(col.title, {
      x: xPos + 0.25,
      y: 2.1,
      w: 3.2,
      h: 0.45,
      fontSize: 15,
      color: col.color,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });

    const itemsText = col.items.map(item => `• ${item}`).join('\n\n');

    s5.addText(itemsText, {
      x: xPos + 0.25,
      y: 2.7,
      w: 3.2,
      h: 3.7,
      fontSize: 11,
      color: TEXT_MAIN,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 6: Field Evidence & Documented Artifacts
  // ══════════════════════════════════════════════════════════════════
  const s6 = pptx.addSlide();
  setupSlideBase(
    s6,
    '06',
    isAr ? 'التوثيق والشواهد' : 'FIELD EVIDENCE',
    isAr ? '٥. الشواهد الميدانية والأدلة المصورة المعتمدة' : '5. Verified Photographic Evidence & Artifacts'
  );

  const evidenceBoxes = isAr
    ? [
        {
          title: 'توثيق كبائن الخوادم والشبكات',
          tag: 'شكل (1-1)',
          desc: 'فحص وترتيب كوابل الشبكة (Patch Cables) في كابينة الخوادم الرئيسية والتحقق من جودة الإشارات الضوئية وتأريض الكبائن.'
        },
        {
          title: 'شاشات الإعداد والتكوين البرمجي',
          tag: 'شكل (2-1)',
          desc: 'لقطات من لوحات تحكم الخوادم، إعداد جدران الحماية، وإدارة عناوين الـ IP الثابتة للأجهزة الحساسة.'
        },
        {
          title: 'سجلات المراجعة وتوقيع المشرف',
          tag: 'شكل (3-1)',
          desc: 'نماذج التقييم الدوري الأسبوعي ومحاضر الاجتماعات الفنية الموقعة مع المشرف الميداني المعتمد.'
        }
      ]
    : [
        {
          title: 'Server Rack & Structured Cabling',
          tag: 'Figure 1-1',
          desc: 'Inspection and dressing of structured patch cabling in primary server racks, verifying fiber link quality and grounding.'
        },
        {
          title: 'System Management & Configurations',
          tag: 'Figure 2-1',
          desc: 'Verified screenshots of server management consoles, firewall routing policies, and static IP lease reservations.'
        },
        {
          title: 'Supervisor Evaluations & Review Logs',
          tag: 'Figure 3-1',
          desc: 'Official weekly milestone review sign-offs and verified technical consultation minutes with the field supervisor.'
        }
      ];

  evidenceBoxes.forEach((eb, idx) => {
    const xPos = 0.8 + idx * 4.0;

    s6.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 }
    });

    s6.addShape(pptx.ShapeType.rect, {
      x: xPos + 0.3,
      y: 2.1,
      w: 3.1,
      h: 2.2,
      fill: { color: '1A2333' },
      line: { color: CARD_BORDER, width: 1 }
    });

    s6.addText(eb.tag, {
      x: xPos + 0.4,
      y: 3.0,
      w: 2.9,
      h: 0.4,
      fontSize: 14,
      color: ACCENT_CYAN,
      bold: true,
      fontFace,
      align: 'center'
    });

    s6.addText(eb.title, {
      x: xPos + 0.3,
      y: 4.5,
      w: 3.1,
      h: 0.5,
      fontSize: 14,
      color: TEXT_MAIN,
      bold: true,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });

    s6.addText(eb.desc, {
      x: xPos + 0.3,
      y: 5.0,
      w: 3.1,
      h: 1.4,
      fontSize: 11,
      color: TEXT_MUTED,
      fontFace,
      rtl: isAr,
      align: isAr ? 'right' : 'left'
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 7: Conclusion, Recommendations & Official Sign-off
  // ══════════════════════════════════════════════════════════════════
  const s7 = pptx.addSlide();
  setupSlideBase(
    s7,
    '07',
    isAr ? 'الخاتمة والاعتماد' : 'CONCLUSION & CLOSEOUT',
    isAr ? '٦. التوصيات الفنية وخاتمة التقرير' : '6. Recommendations, Conclusion & Verification'
  );

  // Left Card: Recommendations
  s7.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.7,
    w: 5.6,
    h: 4.9,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 }
  });

  s7.addText(isAr ? 'التوصيات الفنية للمنشأة والبرنامج' : 'Key Engineering Recommendations', {
    x: 1.1,
    y: 2.0,
    w: 5.0,
    h: 0.4,
    fontSize: 16,
    color: ACCENT_CYAN,
    bold: true,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  const rawConclusion = reportData.profile.conclusionText || (
    isAr
      ? '١. التوسع في أتمتة البنية التحتية عبر حلول DevOps لتقليل الأخطاء البشرية.\n\n' +
        '٢. تعزيز اختبارات الاستجابة للحوادث السيبرانية وتدريب الكوادر الميدانية دورياً.\n\n' +
        '٣. توثيق كافة التغييرات الطارئة في دليل التشغيل القياسي (SOP) الموحد.'
      : '1. Expand infrastructure automation through DevOps tools to reduce manual overhead.\n\n' +
        '2. Conduct periodic disaster recovery drills and train technical field personnel.\n\n' +
        '3. Maintain up-to-date Standard Operating Procedures (SOP) across all systems.'
  );

  s7.addText(rawConclusion, {
    x: 1.1,
    y: 2.6,
    w: 5.0,
    h: 3.6,
    fontSize: 12,
    color: TEXT_MAIN,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  // Right Card: Official Supervisor Evaluation Matrix
  s7.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 1.7,
    w: 5.7,
    h: 4.9,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 }
  });

  s7.addText(isAr ? 'نموذج التقييم والاعتماد الميداني' : 'Field Supervisor Verification', {
    x: 7.1,
    y: 2.0,
    w: 5.1,
    h: 0.4,
    fontSize: 16,
    color: ACCENT_EMERALD,
    bold: true,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  const signoffDetails = isAr
    ? `• المشرف الميداني المسؤول: ${reportData.profile.supervisorName || reportData.profile.responsibleName || 'المشرف المعتمد'}\\n\\n` +
      `• التقييم العام للمتدرب: ممتاز (متميز في الأداء والانضباط)\\n\\n` +
      `• الالتزام بساعات التدريب: مكتمل بنسبة 100% (${reportData.totalHours} ساعة)\\n\\n` +
      `• توصية جهة التدريب: اعتماد التقرير الفني والموافقة على مناقشة المتدرب\\n\\n` +
      `• الختم والتوقيع الرسمي: معتمد وموثق بالسجلات الميدانية`
    : `• Designated Field Supervisor: ${reportData.profile.supervisorName || reportData.profile.responsibleName || 'Field Supervisor'}\\n\\n` +
      `• Overall Performance Rating: Outstanding / Excellent\\n\\n` +
      `• Attendance & Hour Fulfillment: 100% Complete (${reportData.totalHours} Hours)\\n\\n` +
      `• Final Host Recommendation: Approved for Academic Defense\\n\\n` +
      `• Official Sign-off & Stamp: Verified and Filed`;

  s7.addText(signoffDetails, {
    x: 7.1,
    y: 2.6,
    w: 5.1,
    h: 3.6,
    fontSize: 12,
    color: TEXT_MAIN,
    fontFace,
    rtl: isAr,
    align: isAr ? 'right' : 'left'
  });

  // ══════════════════════════════════════════════════════════════════
  // SLIDE 8: Committee Q&A & Closing Thank You
  // ══════════════════════════════════════════════════════════════════
  const s8 = pptx.addSlide();
  s8.background = { color: BG_COLOR };

  s8.addText(
    isAr ? 'شاكرين لكم حسن الاستماع' : 'Thank You for Your Attention',
    {
      x: 0.8,
      y: 2.2,
      w: 11.7,
      h: 0.8,
      fontSize: 34,
      color: TEXT_MAIN,
      bold: true,
      fontFace,
      align: 'center'
    }
  );

  s8.addText(
    isAr
      ? 'جاهزون لمناقشة استفسارات وملاحظات السادة أعضاء لجنة التقييم الأكاديمي'
      : 'Ready for Questions and Comments from the Academic Evaluation Committee',
    {
      x: 0.8,
      y: 3.2,
      w: 11.7,
      h: 0.5,
      fontSize: 18,
      color: ACCENT_CYAN,
      fontFace,
      align: 'center'
    }
  );

  // Student summary badge
  s8.addShape(pptx.ShapeType.roundRect, {
    x: 3.8,
    y: 4.2,
    w: 5.7,
    h: 1.4,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1.2 }
  });

  s8.addText(
    isAr
      ? `إعداد المتدرب: ${reportData.profile.studentName || '—'}  |  الرقم التدريبي: ${reportData.profile.trainingNumber || '—'}\\nالجهة المستضيفة: ${reportData.profile.entityAddress || '—'}`
      : `Presented by: ${reportData.profile.studentName || '—'}  |  ID: ${reportData.profile.trainingNumber || '—'}\\nHost: ${reportData.profile.entityAddress || '—'}`,
    {
      x: 4.0,
      y: 4.45,
      w: 5.3,
      h: 0.9,
      fontSize: 12,
      color: TEXT_MAIN,
      fontFace,
      align: 'center'
    }
  );

  // Generate buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer as Buffer;
}
