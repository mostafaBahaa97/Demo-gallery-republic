export type Finish = "copper" | "silver";

export interface Product {
  id: number;
  name: string;
  designName: string;
  finish: Finish;
  finishLabel: string;
  category: string;
  price: number;
  image: string | null;
}

export type EngravingType = "text" | "logo";
export type EngravingMode = "single" | "perPiece";

/** بيانات النقش الخاصة بسطر منتج واحد في السلة (تصميم + خامة معيّنة). */
export interface EngravingInfo {
  type: EngravingType;
  mode: EngravingMode; // "single": نفس النص/اللوجو لكل القطع | "perPiece": نص مختلف لكل قطعة
  singleText: string; // مستخدم لو mode === "single" (أو qty === 1) && type === "text"
  perPieceTexts: string[]; // مستخدم لو mode === "perPiece" && type === "text" — طولها = qty
  logoBase64: string;
  logoMimeType: string;
  logoFileName: string;
  logoPreviewUrl: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  engraving?: EngravingInfo; // undefined = مفيش نقش على القطعة دي خالص
}

export interface OrderPayload {
  website: string; // honeypot
  customerName: string;
  phone: string;
  governorate: string;
  area: string;
  address: string;
  gpsLink: string;
  bundleLabel: string;
  itemsSubtotal: number;
  shippingFee: number;
  engravingFeeTotal: number;
  totalPrice: number;
  items: {
    name: string;
    qty: number;
    price: number;
    engravingRequested: boolean;
    engravingType: EngravingType | "";
    engravingMode: EngravingMode | "";
    engravingTexts: string[]; // عنصر واحد لو single، أو بطول qty لو perPiece
    engravingLogoBase64: string; // فاضية لو مفيش لوجو
    engravingLogoMimeType: string;
  }[];
}

export interface OrderLineItem {
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  engravingRequested: boolean;
  engravingType: EngravingType | "";
  engravingMode: EngravingMode | "";
  engravingTexts: string[];
  engravingLogoLink: string;
  engravingFee: number;
}

export type OrderStatus = "تحت التصنيع"| "خرج للتسليم" | "تم التسليم" | "مرتجع";

export interface Order {
  orderId: string;
  timestamp: string;
  customerName: string;
  phone: string;
  governorate: string;
  area: string;
  address: string;
  gpsLink: string;
  bundleLabel: string;
  itemsSubtotal: number; // إجمالي القطع بعد الخصومات، قبل الشحن
  shippingFee: number;
  engravingFeeTotal: number; // إجمالي رسوم النقش على كل القطع في الطلب
  totalPrice: number; // الإجمالي شامل الشحن والنقش (اللي بيتحصّل من العميل فعليًا)
  paymentMethod: string;
  status: OrderStatus;
  lastUpdated: string;
  note: string; // ملاحظة اختيارية (زي سبب الإرجاع للطلبات المرتجعة)
  items: OrderLineItem[];
}

export interface InventoryRow {
  productName: string;
  initialStock: number;
  sold: number;
  currentStock: number;
  requiredToManufacture: number;
}

export interface BundleDiscountRule {
  pieces: number; // "من كذا قطعة فأكثر"
  amount: number; // قيمة الخصم بالجنيه لكل قطعة (مش نسبة %) — نفس القيمة
  // بتتطبق على كل الخامات (نحاس بيور / مطلي فضة) بغض النظر عن سعرها الأصلي.
}

export interface ProductDiscountRule {
  productName: string;
  minQty: number; // "لو اشتريتي كذا قطعة من المنتج ده"
  percent: number; // 0-100
}

export interface DiscountRules {
  bundle: BundleDiscountRule[];
  product: ProductDiscountRule[];
}

export interface PromoConfig {
  enabled: boolean;
  message: string;
  durationHours: number;
  version: string;
}

export interface ApiResultBase {
  ok: boolean;
  error?: string;
  authError?: boolean;
  retry?: boolean;
}

export type ApiResult<T = Record<string, never>> = ApiResultBase & T;
