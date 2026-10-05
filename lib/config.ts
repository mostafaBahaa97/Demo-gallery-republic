const appsScriptUrl =
  process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
  process.env.APPS_SCRIPT_URL ||
  "";

/**
 * 🎨 مفتاح ثيم الصفحة الرئيسية (الواجهة اللي بتشوفها العميلة بس — لوحة التحكم
 * /admin مش متأثرة خالص وبتفضل بشكلها الأصلي دايمًا).
 *
 *  "pharaonic" → الثيم الفرعوني (ذهبي + أسود دافئ، زي بوستر الحملة) لحملة التسويق الحالية.
 *  "classic"   → الثيم الأصلي الفاخر (ذهبي + عاجي).
 *
 * غيّري القيمة دي بس لما الحملة تخلص، وكل حاجة (الألوان، الخطوط، الزخارف
 * الفرعونية زي شريط شعار الجعران المجنّح وصورة تمثال الفرعون) هترجع لأصلها
 * من غير ما تحتاجي تلمسي أي كومبوننت تاني.
 */
export const THEME_MODE: "classic" | "pharaonic" = "pharaonic";

export const CONFIG = {
  APPS_SCRIPT_URL: appsScriptUrl,
  WHATSAPP_PHONE: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || process.env.WHATSAPP_PHONE || "201550111419",
  MAX_PIECES: 100,
  RATE_LIMIT: { max: 100, windowMs: 2 * 60 * 60 * 1000 }, // 100 طلبات / ساعتين لكل جهاز
  ENGRAVING_FEE_PER_PIECE: 49, // 🔥 سعر حفر الاسم/اللوجو بالليزر على القطعة الواحدة
} as const;

export const SITE = {
  name: "Gallery Republic",
  nameArabic: "معرض الجمهورية",
  phoneDisplay: "01550111419",
  facebookUrl: "https://www.facebook.com/GalleryRepublic",
  instagramUrl: "https://www.instagram.com/galleryrepublic.eg",
  mapsUrl: "https://maps.app.goo.gl/778ZmkQb6sS4E1W29",
  portfolioUrl: "https://mostafa-s-portfolio.vercel.app/",
} as const;
