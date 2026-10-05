/**
 * بتحوّل أي رقم مكتوب بالأرقام العربية (٠١٢٣٤٥٦٧٨٩) أو الفارسية (۰۱۲۳۴۵۶۷۸۹)
 * لنفس الرقم بالأرقام الغربية (0123456789). لوحة مفاتيح الأرقام على شاشات
 * الموبايل بتظهر أرقام عربية بشكل افتراضي في بعض إعدادات اللغة، فلو ما
 * حوّلناش هنا، رقم زي ٠١٠١٢٣٤٥٦٧٨ هيفشل في regex التحقق من غير أي سبب
 * ظاهر للعميلة (تحس إن الموقع "مش بيقبل رقمها" مع إنه مكتوب صح).
 */
export function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0);
    // ٠-٩ (Arabic-Indic): U+0660–U+0669 | ۰-۹ (Extended/Persian): U+06F0–U+06F9
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}

export function isValidEgyptianPhone(phone: string): boolean {
  return /^01[0125][0-9]{8}$/.test(normalizeDigits(phone).trim());
}

export function isValidFullName(name: string): boolean {
  const trimmed = name.trim();
  // بنستخدم \s بدل includes(" ") الحرفي عشان \s بيغطي أي نوع مسافة، بما فيها
  // المسافة الغير قابلة للكسر (NBSP) اللي بعض لوحات المفاتيح على الموبايل
  // (خصوصًا لما تختاري كلمة مقترحة من شريط الاقتراحات وانتي بتكتبي بالانجليزي)
  // بتحطها بدل المسافة العادية، فيبان للعميلة إنها كتبت اسمين بمسافة عادية
  // وبرضه ترفض ليها بلا سبب واضح.
  return trimmed.length >= 3 && /\S\s+\S/.test(trimmed);
}
