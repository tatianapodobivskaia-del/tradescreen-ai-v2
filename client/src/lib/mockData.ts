// ============================================================
// TradeScreenAI — Comprehensive Mock Data
// Intelligence Command Center Design System
// ============================================================

// ---- LANDING PAGE DATA ----
export const heroStats = {
  totalEntities: 45296,
  title: "AI-Powered Sanctions Screening",
  subtitle: "Multi-list compliance intelligence with Cyrillic transliteration and AI deep analysis",
};

export const whyItMattersStats = [
  { value: "4", label: "Sanctions Lists", sublabel: "OFAC, EU, UN & UK OFSI coverage", icon: "Shield" },
  { value: "45,296", label: "Sanctioned Entities", sublabel: "Across OFAC, EU, UN & UK lists", icon: "Users" },
  { value: "97%", label: "Detection Rate", sublabel: "Across controlled test dataset", icon: "AlertTriangle" },
  { value: "4", label: "Transliteration Systems", sublabel: "ISO 9, ICAO, BGN/PCGN, Informal", icon: "Languages" },
];

export const howItWorksSteps = [
  { step: 1, title: "Upload", description: "Submit vendor names, batch CSV files, or trade documents for screening", icon: "Upload" },
  { step: 2, title: "Screen", description: "Multi-list fuzzy matching with Cyrillic transliteration across 45,296 entities", icon: "Search" },
  { step: 3, title: "Report", description: "AI-generated risk analysis with confidence scores and recommended actions", icon: "FileText" },
];

export const coreCapabilities = [
  { title: "Multi-List Screening", description: "Simultaneous screening across OFAC SDN, EU Consolidated, UN Security Council, and UK OFSI sanctions lists", icon: "Shield" },
  { title: "Cyrillic Transliteration Engine", description: "ISO 9, ICAO, BGN/PCGN, and informal transliteration variants for Russian-language entity matching", icon: "Languages" },
  { title: "AI Document Scanner", description: "4-agent pipeline: Vision extraction, transliteration, risk scoring, and action recommendation", icon: "ScanLine" },
  { title: "AI Deep Analysis", description: "Context-aware AI analysis of flagged entities with confidence scoring and compliance recommendations", icon: "Brain" },
  { title: "Composite Risk Scoring", description: "Weighted scoring algorithm combining name similarity, list source, entity type, and geographic risk factors", icon: "BarChart3" },
  { title: "PDF Report Generation", description: "Generate comprehensive PDF compliance reports with risk scores and recommended actions", icon: "Database" },
];

export const comparisonData = [
  { feature: "Multi-list screening", traditional: false, tradescreen: true },
  { feature: "Cyrillic name variants", traditional: false, tradescreen: true },
  { feature: "AI-powered analysis", traditional: false, tradescreen: true },
  { feature: "False positive reduction", traditional: "Manual review", tradescreen: "AI-assisted" },
  { feature: "Processing speed", traditional: "Hours", tradescreen: "Seconds" },
  { feature: "PDF report generation", traditional: "Limited", tradescreen: "Automated" },
  { feature: "Document scanning", traditional: false, tradescreen: true },
  { feature: "Confidence scoring", traditional: false, tradescreen: true },
  { feature: "Audit trail", traditional: "Basic", tradescreen: "Comprehensive" },
];

export const dataSources = [
  { name: "OFAC SDN", fullName: "Office of Foreign Assets Control — Specially Designated Nationals", count: 18714, country: "US", flag: "🇺🇸", url: "https://sanctionssearch.ofac.treas.gov/" },
  { name: "EU Consolidated", fullName: "European Union Consolidated Sanctions List", count: 5819, country: "EU", flag: "🇪🇺", url: "https://www.sanctionsmap.eu/" },
  { name: "UN Security Council", fullName: "United Nations Security Council Consolidated List", count: 1002, country: "UN", flag: "🇺🇳", url: "https://www.un.org/securitycouncil/sanctions/consolidated-list" },
  { name: "UK OFSI", fullName: "Office of Financial Sanctions Implementation", count: 19761, country: "UK", flag: "🇬🇧", url: "https://www.gov.uk/government/organisations/office-of-financial-sanctions-implementation" },
];

export const researcherInfo = {
  name: "Tatiana Podobivskaia",
  education: [
    { degree: "BA Russian Language & Literature", institution: "Siberian Federal University", location: "Krasnoyarsk, Russia" },
    { degree: "MBA Candidate, BI & Analytics", institution: "Atlantis University", location: "Miami, FL" },
  ],
  links: {
    linkedin: "https://linkedin.com/in/tatiana-podobivskaia",
    github: "https://github.com/tatianapodobivskaia-del",
  },
};

// ---- DASHBOARD DATA ----
export const dashboardStats = [
  { label: "Total Screenings", value: 12847, change: "+12.3%", trend: "up", sparkline: [65, 72, 68, 80, 75, 90, 85, 95, 88, 102, 98, 110] },
  { label: "Entities Monitored", value: 45296, change: "+2.1%", trend: "up", sparkline: [42100, 42800, 43200, 43900, 44100, 44500, 44800, 45000, 45100, 45200, 45250, 45296] },
  { label: "High Risk Flags", value: 342, change: "-5.2%", trend: "down", sparkline: [38, 42, 35, 40, 36, 32, 34, 30, 28, 31, 29, 27] },
  { label: "Avg. Processing Time", value: "1.2s", change: "-18%", trend: "down", sparkline: [2.1, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.3, 1.2, 1.2, 1.2] },
];

export const screeningActivityData = [
  { month: "Jan", screenings: 890, flagged: 45 },
  { month: "Feb", screenings: 1020, flagged: 52 },
  { month: "Mar", screenings: 1150, flagged: 48 },
  { month: "Apr", screenings: 980, flagged: 41 },
  { month: "May", screenings: 1280, flagged: 63 },
  { month: "Jun", screenings: 1100, flagged: 55 },
  { month: "Jul", screenings: 1350, flagged: 58 },
  { month: "Aug", screenings: 1420, flagged: 67 },
  { month: "Sep", screenings: 1180, flagged: 49 },
  { month: "Oct", screenings: 1500, flagged: 72 },
  { month: "Nov", screenings: 1380, flagged: 61 },
  { month: "Dec", screenings: 1597, flagged: 68 },
];

export const listDistribution = [
  { name: "OFAC SDN", value: 18714, color: "#22d3ee" },
  { name: "UK OFSI", value: 19761, color: "#06b6d4" },
  { name: "EU Consolidated", value: 5819, color: "#0891b2" },
  { name: "UN Security Council", value: 1002, color: "#0e7490" },
];

export const recentScreenings = [
  { id: "SCR-2025-4821", entity: "Rosneft Oil Company", date: "2025-03-15T14:32:00Z", risk: "High", score: 94, list: "OFAC SDN", type: "Organization" },
  { id: "SCR-2025-4820", entity: "Viktor Petrov", date: "2025-03-15T14:28:00Z", risk: "Medium", score: 67, list: "EU Consolidated", type: "Individual" },
  { id: "SCR-2025-4819", entity: "Global Trade Partners LLC", date: "2025-03-15T14:15:00Z", risk: "Low", score: 12, list: "—", type: "Organization" },
  { id: "SCR-2025-4818", entity: "Dmitry Kozlov", date: "2025-03-15T13:55:00Z", risk: "High", score: 89, list: "UK OFSI", type: "Individual" },
  { id: "SCR-2025-4817", entity: "Meridian Shipping Co.", date: "2025-03-15T13:42:00Z", risk: "Low", score: 8, list: "—", type: "Organization" },
  { id: "SCR-2025-4816", entity: "Aleksandr Volkov", date: "2025-03-15T13:30:00Z", risk: "Medium", score: 58, list: "OFAC SDN", type: "Individual" },
  { id: "SCR-2025-4815", entity: "Novatek PJSC", date: "2025-03-15T13:18:00Z", risk: "High", score: 97, list: "EU Consolidated", type: "Organization" },
  { id: "SCR-2025-4814", entity: "Chen Wei Trading", date: "2025-03-15T13:05:00Z", risk: "Low", score: 15, list: "—", type: "Organization" },
];

export const systemStatus = [
  { service: "Screening Engine", status: "operational", uptime: "99.97%" },
  { service: "Sanctions Database", status: "operational", uptime: "99.99%" },
  { service: "Cyrillic Engine", status: "operational", uptime: "99.95%" },
  { service: "AI Analysis (GPT-4o)", status: "operational", uptime: "99.91%" },
  { service: "Document Scanner", status: "operational", uptime: "99.88%" },
];

// ---- SCREENING DATA ----
export const demoScenarios = [
  {
    id: "demo-1",
    title: "High Risk — Sanctioned Exporter",
    entity: "Rosoboronexport",
    description: "Major Russian state arms exporter, designated on multiple sanctions lists",
    risk: "High" as const,
    score: 98,
    matches: [
      { list: "OFAC SDN", matchScore: 98, entityName: "ROSOBORONEXPORT", entityType: "Organization", country: "Russia" },
      { list: "EU Consolidated", matchScore: 96, entityName: "Rosoboronexport OAO", entityType: "Organization", country: "Russia" },
      { list: "UK OFSI", matchScore: 97, entityName: "ROSOBORONEXPORT", entityType: "Organization", country: "Russia" },
    ],
    aiAnalysis: {
      summary: "Rosoboronexport is Russia's sole state intermediary agency for defense-related exports/imports. Designated under multiple sanctions programs targeting Russian defense sector.",
      confidence: 0.98,
      recommendation: "BLOCK",
      reasoning: [
        "Exact match on OFAC SDN list (SDN ID: 18106)",
        "Cross-listed on EU and UK sanctions lists",
        "Entity is a primary target of defense-sector sanctions",
        "No legitimate trade purpose identified for civilian commerce",
      ],
    },
  },
  {
    id: "demo-2",
    title: "Medium Risk — Partial Name Match",
    entity: "Gazprom International Services",
    description: "Partial match with sanctioned Gazprom entities, requires further review",
    risk: "Medium" as const,
    score: 64,
    matches: [
      { list: "OFAC SDN", matchScore: 72, entityName: "GAZPROM NEFT", entityType: "Organization", country: "Russia" },
      { list: "EU Consolidated", matchScore: 64, entityName: "GAZPROM OAO", entityType: "Organization", country: "Russia" },
    ],
    aiAnalysis: {
      summary: "The queried entity 'Gazprom International Services' partially matches sanctioned Gazprom entities. While the parent company Gazprom is sanctioned, subsidiary relationships require verification.",
      confidence: 0.72,
      recommendation: "REVIEW",
      reasoning: [
        "Partial name match with 'GAZPROM NEFT' (72% similarity)",
        "Parent entity Gazprom OAO is designated",
        "Subsidiary status unclear — may be a legitimate non-sanctioned entity",
        "Recommend enhanced due diligence on ownership structure",
      ],
    },
  },
  {
    id: "demo-3",
    title: "Low Risk — Clean Vendor",
    entity: "Siemens Healthineers AG",
    description: "Well-known multinational with no sanctions matches",
    risk: "Low" as const,
    score: 3,
    matches: [],
    aiAnalysis: {
      summary: "Siemens Healthineers AG is a publicly traded German multinational medical technology company. No matches found across any monitored sanctions lists.",
      confidence: 0.99,
      recommendation: "CLEAR",
      reasoning: [
        "No matches found on OFAC SDN, EU, UN, or UK OFSI lists",
        "Entity is a well-known publicly traded company (FWB: SHL)",
        "Headquartered in Erlangen, Germany — low-risk jurisdiction",
        "No adverse media or regulatory actions identified",
      ],
    },
  },
];

export const batchResults = [
  { vendor: "Rosneft Oil Company", risk: "High" as const, score: 94, matchedList: "OFAC SDN", matchedEntity: "ROSNEFT OIL COMPANY", country: "Russia" },
  { vendor: "Viktor Petrov Trading", risk: "Medium" as const, score: 67, matchedList: "EU Consolidated", matchedEntity: "PETROV, Viktor Ivanovich", country: "Russia" },
  { vendor: "Global Trade Partners LLC", risk: "Low" as const, score: 12, matchedList: "—", matchedEntity: "—", country: "USA" },
  { vendor: "Dmitry Kozlov Enterprises", risk: "High" as const, score: 89, matchedList: "UK OFSI", matchedEntity: "KOZLOV, Dmitry Anatolyevich", country: "Russia" },
  { vendor: "Meridian Shipping Co.", risk: "Low" as const, score: 8, matchedList: "—", matchedEntity: "—", country: "Singapore" },
  { vendor: "Novatek PJSC", risk: "High" as const, score: 97, matchedList: "EU Consolidated", matchedEntity: "NOVATEK OAO", country: "Russia" },
  { vendor: "Chen Wei International", risk: "Low" as const, score: 15, matchedList: "—", matchedEntity: "—", country: "China" },
  { vendor: "Sovcomflot PAO", risk: "High" as const, score: 96, matchedList: "OFAC SDN", matchedEntity: "SOVCOMFLOT OAO", country: "Russia" },
  { vendor: "Aleksandr Volkov GmbH", risk: "Medium" as const, score: 58, matchedList: "OFAC SDN", matchedEntity: "VOLKOV, Aleksandr Petrovich", country: "Germany" },
  { vendor: "Samsung Electronics", risk: "Low" as const, score: 4, matchedList: "—", matchedEntity: "—", country: "South Korea" },
];

// ---- WATCHLIST EXPLORER DATA ----
export const watchlistEntities = [
  { id: "SDN-18106", name: "ROSOBORONEXPORT", type: "Organization", list: "OFAC SDN", country: "Russia", dateAdded: "2014-07-16", program: "UKRAINE-EO13662", aliases: ["Rosoboroneksport", "РОЭ"] },
  { id: "SDN-12847", name: "GAZPROM NEFT", type: "Organization", list: "OFAC SDN", country: "Russia", dateAdded: "2014-09-12", program: "UKRAINE-EO13662", aliases: ["Gazpromneft", "Газпром нефть"] },
  { id: "EU-2891", name: "SECHIN, Igor Ivanovich", type: "Individual", list: "EU Consolidated", country: "Russia", dateAdded: "2014-07-25", program: "EU Regulation 269/2014", aliases: ["Сечин, Игорь Иванович"] },
  { id: "SDN-15203", name: "NOVATEK OAO", type: "Organization", list: "OFAC SDN", country: "Russia", dateAdded: "2014-07-16", program: "UKRAINE-EO13662", aliases: ["Новатэк", "NOVATEK PJSC"] },
  { id: "UK-4521", name: "ABRAMOVICH, Roman Arkadyevich", type: "Individual", list: "UK OFSI", country: "Russia", dateAdded: "2022-03-10", program: "Russia Regulations 2019", aliases: ["Абрамович, Роман Аркадьевич"] },
  { id: "UN-QDe.121", name: "AL-QAIDA IN IRAQ", type: "Organization", list: "UN Security Council", country: "Iraq", dateAdded: "2004-10-18", program: "ISIL/Da'esh/AQI", aliases: ["AQI", "Tanzim Qa'idat al-Jihad fi Bilad al-Rafidayn"] },
  { id: "SDN-22104", name: "SOVCOMFLOT OAO", type: "Organization", list: "OFAC SDN", country: "Russia", dateAdded: "2022-02-28", program: "RUSSIA-EO14024", aliases: ["SCF Group", "Совкомфлот"] },
  { id: "EU-3102", name: "PATRUSHEV, Nikolai Platonovich", type: "Individual", list: "EU Consolidated", country: "Russia", dateAdded: "2014-03-21", program: "EU Regulation 269/2014", aliases: ["Патрушев, Николай Платонович"] },
  { id: "UK-5892", name: "DERIPASKA, Oleg Vladimirovich", type: "Individual", list: "UK OFSI", country: "Russia", dateAdded: "2022-03-10", program: "Russia Regulations 2019", aliases: ["Дерипаска, Олег Владимирович"] },
  { id: "SDN-19823", name: "SBERBANK OF RUSSIA", type: "Organization", list: "OFAC SDN", country: "Russia", dateAdded: "2022-02-24", program: "RUSSIA-EO14024", aliases: ["Сбербанк", "Sberbank PAO"] },
  { id: "EU-4201", name: "ALROSA PJSC", type: "Organization", list: "EU Consolidated", country: "Russia", dateAdded: "2022-04-08", program: "EU Regulation 833/2014", aliases: ["АЛРОСА", "Almazy Rossii-Sakha"] },
  { id: "UN-QDi.010", name: "BIN LADEN, Hamza Usama Muhammad", type: "Individual", list: "UN Security Council", country: "Saudi Arabia", dateAdded: "2017-01-05", program: "Al-Qaida", aliases: [] },
  { id: "SDN-24501", name: "WAGNER GROUP", type: "Organization", list: "OFAC SDN", country: "Russia", dateAdded: "2023-01-26", program: "RUSSIA-EO14024", aliases: ["PMC Wagner", "ЧВК Вагнер", "Vagner"] },
  { id: "UK-6103", name: "USMANOV, Alisher Burkhanovich", type: "Individual", list: "UK OFSI", country: "Russia", dateAdded: "2022-03-03", program: "Russia Regulations 2019", aliases: ["Усманов, Алишер Бурханович"] },
  { id: "SDN-20192", name: "VTB BANK PAO", type: "Organization", list: "OFAC SDN", country: "Russia", dateAdded: "2022-02-24", program: "RUSSIA-EO14024", aliases: ["ВТБ Банк", "Vneshtorgbank"] },
  { id: "EU-5012", name: "KADYROV, Ramzan Akhmadovich", type: "Individual", list: "EU Consolidated", country: "Russia", dateAdded: "2022-02-28", program: "EU Regulation 269/2014", aliases: ["Кадыров, Рамзан Ахматович"] },
  { id: "SDN-25102", name: "VESSEL: FORTUNA", type: "Vessel", list: "OFAC SDN", country: "Russia", dateAdded: "2021-01-19", program: "PEESA", aliases: ["IMO 9187524"] },
  { id: "SDN-25201", name: "VESSEL: AKADEMIK CHERSKIY", type: "Vessel", list: "OFAC SDN", country: "Russia", dateAdded: "2021-01-19", program: "PEESA", aliases: ["IMO 8606061"] },
  { id: "UK-7201", name: "VESSEL: NS CHAMPION", type: "Vessel", list: "UK OFSI", country: "Russia", dateAdded: "2022-06-15", program: "Russia Regulations 2019", aliases: ["IMO 9750089"] },
  { id: "EU-6001", name: "RUSSIAN DIRECT INVESTMENT FUND", type: "Organization", list: "EU Consolidated", country: "Russia", dateAdded: "2022-02-28", program: "EU Regulation 269/2014", aliases: ["RDIF", "РФПИ"] },
];

// ---- CYRILLIC ENGINE DATA ----
export const cyrillicTransliterations = [
  { cyrillic: "Щербаков", iso9: "Ŝerbakov", icao: "Shcherbakov", bgn: "Shcherbakov", informal: "Scherbakov" },
  { cyrillic: "Жуков", iso9: "Žukov", icao: "Zhukov", bgn: "Zhukov", informal: "Zhukov" },
  { cyrillic: "Цветков", iso9: "Cvetkov", icao: "Tsvetkov", bgn: "Tsvetkov", informal: "Tsvetkov" },
  { cyrillic: "Юрьев", iso9: "Ûr'ev", icao: "Iurev", bgn: "Yur'yev", informal: "Yuriev" },
  { cyrillic: "Яковлев", iso9: "Âkovlev", icao: "Iakovlev", bgn: "Yakovlev", informal: "Yakovlev" },
  { cyrillic: "Хрущёв", iso9: "Hruŝëv", icao: "Khrushchev", bgn: "Khrushchëv", informal: "Khrushchev" },
  { cyrillic: "Горбачёв", iso9: "Gorbačëv", icao: "Gorbachev", bgn: "Gorbachëv", informal: "Gorbachev" },
  { cyrillic: "Чернышевский", iso9: "Černyševskij", icao: "Chernyshevskii", bgn: "Chernyshevskiy", informal: "Chernyshevsky" },
];

export const cyrillicVariantsReference = [
  { letter: "Щ", name: "Shcha", iso9: "Ŝ / ŝ", icao: "Shch", bgn: "Shch", informal: "Sch / Shch" },
  { letter: "Ж", name: "Zhe", iso9: "Ž / ž", icao: "Zh", bgn: "Zh", informal: "Zh / J" },
  { letter: "Ц", name: "Tse", iso9: "C / c", icao: "Ts", bgn: "Ts", informal: "Ts / Tz" },
  { letter: "Ю", name: "Yu", iso9: "Û / û", icao: "Iu", bgn: "Yu", informal: "Yu / Ju" },
  { letter: "Я", name: "Ya", iso9: "Â / â", icao: "Ia", bgn: "Ya", informal: "Ya / Ja" },
  { letter: "Ё", name: "Yo", iso9: "Ë / ë", icao: "E", bgn: "Ë", informal: "Yo / E" },
  { letter: "Х", name: "Kha", iso9: "H / h", icao: "Kh", bgn: "Kh", informal: "Kh / H" },
  { letter: "Ч", name: "Che", iso9: "Č / č", icao: "Ch", bgn: "Ch", informal: "Ch / Tch" },
  { letter: "Ш", name: "Sha", iso9: "Š / š", icao: "Sh", bgn: "Sh", informal: "Sh" },
  { letter: "Ы", name: "Yeru", iso9: "Y / y", icao: "Y", bgn: "Y", informal: "Y / I" },
];

export const tradeDocumentComparison = [
  { russianOriginal: "Щербаков Юрий Яковлевич", passport: "SHCHERBAKOV IURII IAKOVLEVICH", bankRecord: "Scherbakov, Yuri Y.", tradeDoc: "SHERBAKOV YURIY" },
  { russianOriginal: "Жукова Наталья Цветкова", passport: "ZHUKOVA NATALIA TSVETKOVA", bankRecord: "Zhukova, Natalia T.", tradeDoc: "JUKOVA NATALYA" },
  { russianOriginal: "Хрущёв Дмитрий Чернов", passport: "KHRUSHCHEV DMITRII CHERNOV", bankRecord: "Khrushchev, Dmitry C.", tradeDoc: "KHRUSCHEV DMITRIY" },
];

// ---- AI DOCUMENT SCANNER DATA ----
export const documentPipelineStages = [
  { id: 1, name: "Vision Agent", description: "OCR extraction and entity recognition from uploaded documents", icon: "Eye", status: "complete" },
  { id: 2, name: "Transliteration Agent", description: "Cyrillic-to-Latin conversion across all standard systems", icon: "Languages", status: "complete" },
  { id: 3, name: "Risk Agent", description: "Multi-list screening and composite risk scoring", icon: "ShieldAlert", status: "complete" },
  { id: 4, name: "Action Agent", description: "AI-generated compliance recommendation and audit entry", icon: "CheckCircle", status: "complete" },
];

export const extractedEntities = [
  { entity: "OOO Tekhnoexport", type: "Organization", source: "Invoice header", risk: "High" as const, score: 91, transliterated: "Tekhnoeksport / Technoexport / Техноэкспорт" },
  { entity: "Ivanov A.P.", type: "Individual", source: "Signatory field", risk: "Medium" as const, score: 62, transliterated: "Ivanov / Иванов А.П." },
  { entity: "Port of Novorossiysk", type: "Location", source: "Shipping details", risk: "Low" as const, score: 18, transliterated: "Novorossiysk / Новороссийск" },
  { entity: "Vessel Nadezhda", type: "Vessel", source: "Bill of lading", risk: "Medium" as const, score: 55, transliterated: "Nadezhda / Надежда" },
];

// ---- REPORTS & ANALYTICS DATA ----
export const screeningTrends = [
  { week: "W1", total: 312, high: 18, medium: 45, low: 249 },
  { week: "W2", total: 287, high: 22, medium: 38, low: 227 },
  { week: "W3", total: 345, high: 15, medium: 52, low: 278 },
  { week: "W4", total: 401, high: 28, medium: 61, low: 312 },
  { week: "W5", total: 378, high: 20, medium: 48, low: 310 },
  { week: "W6", total: 425, high: 31, medium: 55, low: 339 },
  { week: "W7", total: 389, high: 19, medium: 42, low: 328 },
  { week: "W8", total: 456, high: 35, medium: 67, low: 354 },
];

export const geographicDistribution = [
  { country: "Russia", count: 24891, percentage: 55 },
  { country: "Iran", count: 4529, percentage: 10 },
  { country: "Syria", count: 2718, percentage: 6 },
  { country: "North Korea", count: 1812, percentage: 4 },
  { country: "China", count: 1359, percentage: 3 },
  { country: "Venezuela", count: 906, percentage: 2 },
  { country: "Myanmar", count: 724, percentage: 1.6 },
  { country: "Other", count: 8357, percentage: 18.4 },
];

export const performanceMetrics = [
  { metric: "Detection Rate", tradescreen: "97%", manual: "~60%", ruleBased: "~78%" },
  { metric: "Detection Rate", tradescreen: "8%", manual: "~45%", ruleBased: "~34%" },
  { metric: "Precision", tradescreen: "92%", manual: "~55%", ruleBased: "~68%" },
  { metric: "Recall", tradescreen: "97%", manual: "~60%", ruleBased: "~78%" },
  { metric: "F1 Score", tradescreen: "94.4%", manual: "~57%", ruleBased: "~73%" },
  { metric: "Avg. Processing Time", tradescreen: "1.2s", manual: "15 min", ruleBased: "8s" },
];

export const reportsArchive = [
  { id: "RPT-2025-048", title: "Weekly Screening Summary", date: "2025-03-15", type: "Weekly", records: 456, flagged: 35 },
  { id: "RPT-2025-047", title: "Monthly Compliance Report", date: "2025-03-01", type: "Monthly", records: 1597, flagged: 142 },
  { id: "RPT-2025-046", title: "Quarterly Risk Assessment", date: "2025-01-15", type: "Quarterly", records: 4821, flagged: 389 },
  { id: "RPT-2025-045", title: "Weekly Screening Summary", date: "2025-03-08", type: "Weekly", records: 389, flagged: 28 },
  { id: "RPT-2025-044", title: "Entity Watchlist Update", date: "2025-03-05", type: "Ad-hoc", records: 45296, flagged: 1204 },
];

// ---- AUDIT LOG DATA ----
export const auditLogEntries = [
  { timestamp: "2025-03-15T14:32:18.421Z", action: "SCREENING_COMPLETED", user: "system", entity: "Rosneft Oil Company", details: "Single entity screening — Risk: HIGH (94)", severity: "high" as const },
  { timestamp: "2025-03-15T14:28:05.112Z", action: "SCREENING_COMPLETED", user: "system", entity: "Viktor Petrov", details: "Single entity screening — Risk: MEDIUM (67)", severity: "medium" as const },
  { timestamp: "2025-03-15T14:15:42.891Z", action: "SCREENING_COMPLETED", user: "system", entity: "Global Trade Partners LLC", details: "Single entity screening — Risk: LOW (12)", severity: "low" as const },
  { timestamp: "2025-03-15T14:00:00.000Z", action: "BATCH_UPLOAD", user: "analyst_01", entity: "batch_vendors_march.csv", details: "Batch upload: 40 vendors processed, 3 flagged", severity: "info" as const },
  { timestamp: "2025-03-15T13:55:12.334Z", action: "AI_ANALYSIS", user: "system", entity: "Dmitry Kozlov", details: "AI deep analysis triggered — Recommendation: BLOCK", severity: "high" as const },
  { timestamp: "2025-03-15T13:42:08.776Z", action: "SCREENING_COMPLETED", user: "system", entity: "Meridian Shipping Co.", details: "Single entity screening — Risk: LOW (8)", severity: "low" as const },
  { timestamp: "2025-03-15T13:30:55.221Z", action: "SCREENING_COMPLETED", user: "system", entity: "Aleksandr Volkov", details: "Single entity screening — Risk: MEDIUM (58)", severity: "medium" as const },
  { timestamp: "2025-03-15T13:18:33.109Z", action: "AI_ANALYSIS", user: "system", entity: "Novatek PJSC", details: "AI deep analysis triggered — Recommendation: BLOCK", severity: "high" as const },
  { timestamp: "2025-03-15T12:00:00.000Z", action: "DATABASE_UPDATE", user: "system", entity: "OFAC SDN List", details: "Sanctions list updated: 18,714 entities (+23 new)", severity: "info" as const },
  { timestamp: "2025-03-15T11:45:22.887Z", action: "DOCUMENT_SCAN", user: "analyst_02", entity: "invoice_RU_2025_0312.pdf", details: "Document scanned: 4 entities extracted, 1 HIGH risk", severity: "high" as const },
  { timestamp: "2025-03-15T11:30:00.000Z", action: "SYSTEM_START", user: "system", entity: "TradeScreenAI", details: "System initialized — All services operational", severity: "info" as const },
  { timestamp: "2025-03-14T16:45:11.443Z", action: "REPORT_GENERATED", user: "analyst_01", entity: "RPT-2025-048", details: "Weekly Screening Summary generated", severity: "info" as const },
  { timestamp: "2025-03-14T15:20:33.221Z", action: "TRANSLITERATION", user: "system", entity: "Щербаков Юрий", details: "Cyrillic transliteration: 4 variants generated", severity: "info" as const },
  { timestamp: "2025-03-14T14:10:05.667Z", action: "SCREENING_COMPLETED", user: "system", entity: "Wagner Group", details: "Single entity screening — Risk: HIGH (98)", severity: "high" as const },
  { timestamp: "2025-03-14T13:00:00.000Z", action: "DATABASE_UPDATE", user: "system", entity: "UK OFSI List", details: "Sanctions list updated: 19,761 entities (+15 new)", severity: "info" as const },
];

// ---- ARCHITECTURE DATA ----
export const pipelineStages = [
  { id: 1, name: "Data Ingestion", description: "Receive entity name, batch CSV, or document upload. Normalize input encoding and format.", icon: "Download" },
  { id: 2, name: "Transliteration", description: "Generate Cyrillic variants using ISO 9, ICAO, BGN/PCGN, and informal systems.", icon: "Languages" },
  { id: 3, name: "Multi-List Matching", description: "Fuzzy matching across OFAC SDN, EU, UN, and UK OFSI lists using Levenshtein distance.", icon: "Search" },
  { id: 4, name: "Risk Scoring", description: "Composite score from name similarity, list source weight, entity type, and geographic risk.", icon: "Calculator" },
  { id: 5, name: "AI Analysis", description: "GPT-4o contextual analysis for flagged entities with confidence scoring.", icon: "Brain" },
];

export const scoringFormula = {
  weights: [
    { factor: "Name Similarity", weight: 0.75, description: "Fuzzy matching score normalized to 0-100 using n-gram, token sort ratio, and token set ratio" },
    { factor: "Jurisdiction Risk", weight: 0.10, description: "Based on FATF high-risk and monitored jurisdiction classification" },
    { factor: "Transaction Value", weight: 0.05, description: "Scaled risk weight based on transaction amount thresholds" },
    { factor: "Document Type", weight: 0.05, description: "Risk weight by document category: invoice, BL, certificate of origin" },
    { factor: "Transliteration Detection", weight: 0.05, description: "Bonus weight when Cyrillic transliteration variants are detected" },
  ],
  formula: "Score = (0.75 × NameSim) + (0.10 × JurisdictionRisk) + (0.05 × TxnValue) + (0.05 × DocType) + (0.05 × TranslitBonus)",
};
