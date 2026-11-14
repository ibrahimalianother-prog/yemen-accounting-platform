# PROJECT_STRUCTURE.md

## 1. هيكل المشروع المقترح

```bash
.
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── companies/
│   ├── accounts/
│   ├── invoices/
│   ├── expenses/
│   ├── journal/
│   ├── reports/
│   ├── settings/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── AppShell.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── forms/
│   │   ├── InvoiceForm.tsx
│   │   ├── ExpenseForm.tsx
│   │   └── JournalEntryForm.tsx
│   └── charts/
│       ├── RevenueChart.tsx
│       └── ExpenseChart.tsx
├── lib/
│   ├── mockData.ts
│   ├── utils.ts
│   ├── formatters.ts
│   ├── constants.ts
│   └── validators.ts
├── services/
│   ├── authService.ts
│   ├── invoiceService.ts
│   ├── expenseService.ts
│   ├── journalService.ts
│   └── reportService.ts
├── hooks/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── useCompany.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
│   ├── SRS.md
│   ├── DATABASE.md
│   ├── ROLES.md
│   ├── ROADMAP.md
│   └── PROJECT_STRUCTURE.md
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── next.config.mjs
├── .eslintrc.json
└── next-env.d.ts
```

## 2. شرح الهيكل

### app/

تحتوي الصفحات الرئيسية للتطبيق، مثل الصفحة الرئيسية، تسجيل الدخول، لوحة التحكم، وإدارة الحسابات والفواتير.

### components/

تحتوي المكونات القابلة لإعادة الاستخدام مثل:
- شريط التنقل
- العناوين
- الجداول
- النماذج
- الرسوم البيانية

### lib/

تحتوي أدوات المساعدة والتهيئة مثل التنسيق التاريخي والتأكد من صحة البيانات.

### services/

تحتوي طبقة الاتصال مع البيانات والخدمات الخلفية.

### hooks/

تحتوي هوكات React للهيكلة البسيطة ولإدارة حالة المستخدم والصلاحيات.

### prisma/

تحتوي تعريف قاعدة البيانات ومعالجة البذور عند الحاجة.

### docs/

تتضمن وثائق المشروع مثل SRS وDATABASE وROLES وROADMAP.

### tests/

تحتوي اختبارات الوحدات والتكامل.

## 3. المبدأ المعماري

- التطبيق يعمل على Next.js
- كل شريط أو صفحة أو نموذج بناء على مكونات مستقلة
- كل خدمة مرتبطة بوحدة وظيفية مستقلة
- الأدوار والصلاحيات مستقلة عن منطق الأعمال
- قاعدة البيانات منظمة على شكل نماذج موثقة

## 4. التوسع لاحقاً

عند إضافة الرواتب أو المخزون أو الضرائب، يمكن توسيع هذا الهيكل فقط بإضافة:

- app/payroll
- app/inventory
- app/tax
- services/payrollService.ts
- services/inventoryService.ts
- services/taxService.ts

## 5. الخلاصة

هذا الهيكل يمنح المشروع قابلية توسع عالية، وسهولة في التطوير، مع الحفاظ على تنظيم واضح للملفات والوحدات.
