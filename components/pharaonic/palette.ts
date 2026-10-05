// باليتة ألوان الثيم الفرعوني — نفس القيم المستخدمة في app/globals.css
// (قسم [data-theme="pharaonic"])، متاحة هنا كـ constants عشان تُستخدم مباشرة
// جوه خصائص SVG (fill / stroke) في المكونات الزخرفية اللي بتتفعّل بس وقت
// ما THEME_MODE = "pharaonic".
export const PHARAONIC = {
  ivory: "#f2e2c2",
  ivorysoft: "#faf2de",
  ink: "#1c140d",
  umber: "#55402a",
  gold: "#c9962f",
  golddeep: "#93690f",
  goldsoft: "#e8ce86",
} as const;
