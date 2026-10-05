/**
 * =====================================================================
 *  Gallery Republic — Backend (Google Apps Script + Google Sheets)
 * =====================================================================
 *  ده الكود اللي بيشغل الموقع كله كـ API مجاني فوق Google Sheets.
 *
 *  خطوات التشغيل (اقرأ README.md للتفاصيل الكاملة):
 *   1) افتحي Google Sheet جديد فاضي.
 *   2) من القائمة: Extensions > Apps Script.
 *   3) امسحي أي كود موجود، والصقي هذا الملف كامل.
 *   4) غيّري ADMIN_USERNAME و ADMIN_PASSWORD و TOKEN_SECRET تحت.
 *   5) من القائمة العلوية لمحرر Apps Script اختاري الفنكشن "setupSheets"
 *      واضغطي Run مرة واحدة فقط (هتطلب صلاحيات، وافقي عليها).
 *      هي هتنشئ الشيتات والأعمدة والصيغ والمنتجات الافتراضية تلقائيًا.
 *   6) Deploy > New deployment > Web app.
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   7) انسخي الـ Web app URL والصقيه في index.html و admin.html
 *      داخل CONFIG.APPS_SCRIPT_URL
 * =====================================================================
 */

// ------------------------- إعدادات لازم تتغيّر -------------------------
var ADMIN_USERNAME = 'admin';                  // 
var ADMIN_PASSWORD = 'galleryrepublic2026';    // 
var TOKEN_SECRET    = 'GalleryRepublic2026'; //
// -------------------------------------------------------------------

var TOKEN_TTL_MS = 12 * 60 * 60 * 1000;   // مدة صلاحية جلسة الأدمن: 12 ساعة
var TIMEZONE = 'Africa/Cairo';

var SHEET_ORDERS    = 'Orders';
var SHEET_ITEMS     = 'OrderItems';
var SHEET_INVENTORY = 'Inventory';
var SHEET_BUNDLE_DISCOUNTS  = 'BundleDiscounts';
var SHEET_PRODUCT_DISCOUNTS = 'ProductDiscounts';
var SHEET_SETTINGS = 'Settings';

var ORDER_STATUSES = ['تحت التصنيع', 'تم التسليم', 'مرتجع','خرج للتسليم'];
var DEFAULT_STATUS  = 'تحت التصنيع';
var MAX_PIECES_PER_ORDER = 100; // ⚠️ لازم يفضل مطابق لـ CONFIG.MAX_PIECES في lib/config.ts
var ENGRAVING_FEE_PER_PIECE = 49; // 🔥 لازم يفضل مطابق لـ CONFIG.ENGRAVING_FEE_PER_PIECE في lib/config.ts
var ENGRAVING_LOGOS_FOLDER_NAME = 'Gallery Republic - نقوش العملاء';

// نفس أسماء المنتجات المستخدمة بالظبط في lib/products.ts (PRODUCTS array)
// لو غيّرتِ اسم منتج في الموقع، غيّريه هنا كمان عشان صيغة "Sold" تفضل صح.
// كل قطعة ليها صفين: نحاس بيور / نحاس مطلي فضة.
var DEFAULT_PRODUCTS = [
  { name: 'قناع توت عنخ آمون (نحاس بيور)',      stock: 50 },
  { name: 'قناع توت عنخ آمون (نحاس مطلي فضة)',  stock: 50 },
  { name: 'نفرتيتي (نحاس بيور)',                stock: 50 },
  { name: 'نفرتيتي (نحاس مطلي فضة)',            stock: 50 },
  { name: 'الملك رمسيس (نحاس بيور)',            stock: 50 },
  { name: 'الملك رمسيس (نحاس مطلي فضة)',        stock: 50 },
  { name: 'أنوبيس (نحاس بيور)',                 stock: 50 },
  { name: 'أنوبيس (نحاس مطلي فضة)',             stock: 50 },
  { name: 'عين حورس (نحاس بيور)',               stock: 50 },
  { name: 'عين حورس (نحاس مطلي فضة)',           stock: 50 },
  { name: 'مفتاح الحياة (نحاس بيور)',           stock: 50 },
  { name: 'مفتاح الحياة (نحاس مطلي فضة)',       stock: 50 },
  { name: 'الأهرامات (نحاس بيور)',              stock: 50 },
  { name: 'الأهرامات (نحاس مطلي فضة)',          stock: 50 },
  { name: 'جعران الحماية (نحاس بيور)',          stock: 50 },
  { name: 'جعران الحماية (نحاس مطلي فضة)',      stock: 50 },
  { name: 'أبو الهول (نحاس بيور)',              stock: 50 },
  { name: 'أبو الهول (نحاس مطلي فضة)',          stock: 50 },
  { name: 'كليوباترا (نحاس بيور)',              stock: 50 },
  { name: 'كليوباترا (نحاس مطلي فضة)',          stock: 50 },
  { name: 'زهرة اللوتس (نحاس بيور)',            stock: 50 },
  { name: 'زهرة اللوتس (نحاس مطلي فضة)',        stock: 50 }
];

// ============================== ROUTES ==============================

function doGet(e) {
  return jsonResponse({ ok: true, message: 'Gallery Republic API is running ✅' });
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (parseErr) {
    return jsonResponse({ ok: false, error: 'صيغة الطلب غير صحيحة (bad request body)' });
  }

  try {
    switch (body.action) {
      case 'createOrder':
        return jsonResponse(handleCreateOrder(body));
      case 'login':
        return jsonResponse(handleLogin(body));
      case 'verifyPassword':
        return jsonResponse(handleVerifyPassword(body));
      case 'getOrders':
        return jsonResponse(handleGetOrders(body));
      case 'updateStatus':
        return jsonResponse(handleUpdateStatus(body));
      case 'updateOrderNote':
        return jsonResponse(handleUpdateOrderNote(body));
      case 'getInventory':
        return jsonResponse(handleGetInventory(body));
      case 'addStock':
        return jsonResponse(handleAddStock(body));
      case 'getDiscountRules':
        return jsonResponse(handleGetDiscountRules(body));
      case 'saveDiscountRules':
        return jsonResponse(handleSaveDiscountRules(body));
      case 'getPromoConfig':
        return jsonResponse(handleGetPromoConfig(body));
      case 'savePromoConfig':
        return jsonResponse(handleSavePromoConfig(body));
      case 'ping':
        return jsonResponse({ ok: true, pong: Date.now() });
      default:
        return jsonResponse({ ok: false, error: 'إجراء غير معروف (unknown action)' });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: 'خطأ في الخادم: ' + err.message });
  }
}

// ============================ ORDER CREATE ===========================

/**
 * بتحوّل أي رقم مكتوب بالأرقام العربية (٠١٢...) أو الفارسية (۰۱۲...) لنفس
 * الرقم بالأرقام الغربية. دفاع إضافي في السيرفر حتى لو التطبيع اللي بيحصل
 * في المتصفح اتخطّى لأي سبب (كاش قديم، إلخ) — بيمنع رفض رقم هاتف صحيح
 * شكليًا بس مكتوب بترقيم عربي.
 */
function normalizeDigits_(str) {
  return String(str || '').replace(/[٠-٩۰-۹]/g, function (d) {
    var code = d.charCodeAt(0);
    var base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}

/**
 * بتنشئ (أو تلاقي) فولدر مخصص في Google Drive بتاع صاحب الحساب لحفظ لوجوهات
 * النقش المرفوعة من العملاء، منظّمة بره الشيت نفسه.
 */
function getOrCreateEngravingFolder_() {
  var folders = DriveApp.getFoldersByName(ENGRAVING_LOGOS_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(ENGRAVING_LOGOS_FOLDER_NAME);
}

/**
 * بتحفظ لوجو النقش (base64 جاي من المتصفح، مُصغّر ومضغوط مسبقًا) كملف في
 * Google Drive وبترجع لينك المشاهدة. لو فشل الحفظ لأي سبب (مساحة، صلاحيات)،
 * بترجع نص فاضي من غير ما توقف تسجيل الطلب نفسه — فقدان اللوجو أهون بكتير
 * من فقدان الطلب كله.
 */
function saveEngravingLogo_(orderId, base64Data, mimeType) {
  if (!base64Data) return '';
  try {
    var folder = getOrCreateEngravingFolder_();
    var ext = mimeType === 'image/png' ? 'png' : 'jpg';
    var bytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, 'logo-' + orderId + '.' + ext);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    return '';
  }
}

function handleCreateOrder(body) {
  var data = body.order || {};

  // Honeypot: لو الحقل ده اتملى، ده بوت — نرجّع "نجاح" وهمي من غير ما نكتب حاجة
  if (data.website) {
    return { ok: true, orderId: 'IGNORED', honeypot: true };
  }

  var name = String(data.customerName || '').trim();
  var phone = normalizeDigits_(data.phone).trim();
  var governorate = String(data.governorate || '').trim();
  var area = String(data.area || '').trim();
  var address = String(data.address || '').trim();
  var gpsLink = String(data.gpsLink || '').trim();
  var rawItems = Array.isArray(data.items) ? data.items : [];
  var bundleLabel = String(data.bundleLabel || '').trim();
  // الإجمالي بيتحسب في السيرفر دايمًا من إجمالي القطع + مصاريف الشحن + رسوم
  // النقش، وميتاخدش زي ما هو من العميل مباشرة، عشان نضمن إن الرقم المسجّل
  // في الشيت صحيح دايمًا.
  var itemsSubtotal = Number(data.itemsSubtotal || 0);
  var shippingFee = Number(data.shippingFee || 0);

  if (name.length < 3 || !/\S\s+\S/.test(name)) {
    return { ok: false, error: 'من فضلك أدخلي الاسم بالكامل (الأول والأخير).' };
  }
  if (!/^01[0125][0-9]{8}$/.test(phone)) {
    return { ok: false, error: 'رقم الهاتف غير صحيح. يجب أن يكون 11 رقم ويبدأ بـ 010 / 011 / 012 / 015.' };
  }
  if (!governorate) {
    return { ok: false, error: 'من فضلك اختاري المحافظة.' };
  }
  if (!address) {
    return { ok: false, error: 'من فضلك أدخلي العنوان بالتفصيل.' };
  }
  if (rawItems.length === 0) {
    return { ok: false, error: 'لم يتم اختيار أي منتج.' };
  }
  var totalQty = rawItems.reduce(function (sum, it) { return sum + Math.max(1, Number(it.qty || 1)); }, 0);
  if (totalQty > MAX_PIECES_PER_ORDER) {
    return { ok: false, error: 'الحد الأقصى ' + MAX_PIECES_PER_ORDER + ' قطع في الطلب الواحد.' };
  }

  // النقش دلوقتي على مستوى كل قطعة لوحدها (مش على مستوى الطلب كله) — بنتحقق
  // ونطبّع بيانات كل سطر، وبنحسب رسوم النقش الإجمالية من مجموعها.
  var items = [];
  var engravingFeeTotal = 0;
  for (var idx = 0; idx < rawItems.length; idx++) {
    var raw = rawItems[idx];
    var qty = Math.max(1, Number(raw.qty || 1));
    var unitPrice = Number(raw.price || 0);
    var productName = String(raw.name || '');

    var engravingRequested = !!raw.engravingRequested;
    var engravingType = String(raw.engravingType || '');
    var engravingMode = String(raw.engravingMode || '');
    var engravingTexts = Array.isArray(raw.engravingTexts) ? raw.engravingTexts.map(String) : [];
    var engravingLogoBase64 = String(raw.engravingLogoBase64 || '');
    var engravingLogoMimeType = String(raw.engravingLogoMimeType || 'image/jpeg');
    var engravingFee = 0;

    if (engravingRequested) {
      if (engravingType !== 'text' && engravingType !== 'logo') {
        return { ok: false, error: 'من فضلك اختاري نوع النقش (نص أو لوجو) لـ"' + productName + '".' };
      }
      if (engravingType === 'text') {
        if (engravingMode === 'perPiece') {
          if (engravingTexts.length !== qty || engravingTexts.some(function (t) { return !t.trim(); })) {
            return { ok: false, error: 'من فضلك اكتبي اسم لكل قطعة من "' + productName + '".' };
          }
        } else {
          if (!engravingTexts.length || !engravingTexts[0].trim()) {
            return { ok: false, error: 'من فضلك اكتبي نص النقش لـ"' + productName + '".' };
          }
        }
      } else if (engravingType === 'logo' && !engravingLogoBase64) {
        return { ok: false, error: 'من فضلك ارفعي صورة اللوجو لـ"' + productName + '".' };
      }
      // رسوم النقش بتتحسب للقطعة الفعلية بغض النظر عن نفس النص أو أسامي مختلفة
      engravingFee = ENGRAVING_FEE_PER_PIECE * qty;
      engravingFeeTotal += engravingFee;
    }

    items.push({
      name: productName,
      qty: qty,
      unitPrice: unitPrice,
      lineTotal: qty * unitPrice,
      engravingRequested: engravingRequested,
      engravingType: engravingRequested ? engravingType : '',
      engravingMode: engravingRequested && engravingType === 'text' ? (engravingMode || 'single') : '',
      engravingTexts: engravingRequested && engravingType === 'text' ? engravingTexts.map(function (t) { return t.trim().slice(0, 24); }) : [],
      engravingLogoBase64: engravingRequested && engravingType === 'logo' ? engravingLogoBase64 : '',
      engravingLogoMimeType: engravingLogoMimeType,
      engravingFee: engravingFee
    });
  }

  var total = itemsSubtotal + shippingFee + engravingFeeTotal;

  var lock = LockService.getScriptLock();
  var gotLock = false;
  try {
    gotLock = lock.tryLock(10000);
  } catch (e) {
    gotLock = false;
  }
  if (!gotLock) {
    return { ok: false, retry: true, error: 'الخادم مشغول لحظيًا، جاري إعادة المحاولة تلقائيًا…' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordersSheet = ss.getSheetByName(SHEET_ORDERS);
    var itemsSheet = ss.getSheetByName(SHEET_ITEMS);
    if (!ordersSheet || !itemsSheet) {
      throw new Error('الشيتات غير موجودة. شغّلي setupSheets أولاً من محرر Apps Script.');
    }

    var orderId = generateOrderId(ordersSheet);
    var now = new Date();

    ordersSheet.appendRow([
      orderId,
      now,
      name,
      phone,
      governorate,
      area,
      address,
      gpsLink,
      bundleLabel,
      itemsSubtotal,
      shippingFee,
      total,
      'الدفع عند الاستلام',
      DEFAULT_STATUS,
      now,
      engravingFeeTotal
    ]);

    items.forEach(function (item, i) {
      var engravingLogoLink = '';
      if (item.engravingRequested && item.engravingType === 'logo') {
        engravingLogoLink = saveEngravingLogo_(orderId + '-' + (i + 1), item.engravingLogoBase64, item.engravingLogoMimeType);
      }
      itemsSheet.appendRow([
        orderId,
        item.name,
        item.qty,
        item.unitPrice,
        item.lineTotal,
        DEFAULT_STATUS,
        item.engravingRequested,
        item.engravingType,
        item.engravingMode,
        JSON.stringify(item.engravingTexts),
        engravingLogoLink,
        item.engravingFee
      ]);
    });

    return { ok: true, orderId: orderId };
  } finally {
    lock.releaseLock();
  }
}

function generateOrderId(ordersSheet) {
  var lastRow = ordersSheet.getLastRow(); // 1 = header فقط لسه
  var seq = lastRow; // أول أوردر seq = 1
  var datePart = Utilities.formatDate(new Date(), TIMEZONE, 'yyyyMMdd');
  var seqStr = ('0000' + seq).slice(-4);
  return 'GR-' + datePart + '-' + seqStr;
}

// =============================== AUTH ================================

function handleLogin(body) {
  var username = String(body.username || '').trim();
  var password = String(body.password || '');
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return { ok: true, token: makeToken(username) };
  }
  return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' };
}

/**
 * بتتأكد من كلمة مرور الأدمن من غير ما تصدر توكن جديد — مستخدمة كحاجز إضافي
 * قبل عمليات حرجة (زي رجوع حالة الطلب للخلف) عشان محدش يعمل كدا بالخطأ
 * بمجرد ضغطة واحدة. لازم يكون معاها توكن الجلسة الحالي سليم كمان.
 */
function handleVerifyPassword(body) {
  var authErr = requireAuth(body);
  if (authErr) return authErr;

  var password = String(body.password || '');
  if (password === ADMIN_PASSWORD) {
    return { ok: true };
  }
  return { ok: false, error: 'كلمة المرور غير صحيحة.' };
}

function makeToken(username) {
  var expiry = Date.now() + TOKEN_TTL_MS;
  var payload = username + '|' + expiry;
  var payloadB64 = Utilities.base64EncodeWebSafe(Utilities.newBlob(payload).getBytes());
  var sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(payload, TOKEN_SECRET)
  );
  return payloadB64 + '.' + sig;
}

function verifyToken(token) {
  try {
    var parts = String(token || '').split('.');
    if (parts.length !== 2) return false;
    var payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString();
    var expectedSig = Utilities.base64EncodeWebSafe(
      Utilities.computeHmacSha256Signature(payload, TOKEN_SECRET)
    );
    if (expectedSig !== parts[1]) return false;
    var expiry = Number(payload.split('|')[1]);
    return Date.now() < expiry;
  } catch (e) {
    return false;
  }
}

function requireAuth(body) {
  if (!verifyToken(body.token)) {
    return { ok: false, error: 'يجب تسجيل الدخول من جديد (unauthorized).', authError: true };
  }
  return null;
}

// ============================ ADMIN: ORDERS ===========================

function handleGetOrders(body) {
  var authErr = requireAuth(body);
  if (authErr) return authErr;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = ss.getSheetByName(SHEET_ORDERS);
var itemsSheet = ss.getSheetByName(SHEET_ITEMS);
if (!ordersSheet || !itemsSheet) {
  return { ok: false, error: 'الشيتات غير موجودة. شغّلي setupSheets أولاً من محرر Apps Script.' };
}

  var ordersData = ordersSheet.getDataRange().getValues();
  var itemsData = itemsSheet.getDataRange().getValues();

  var itemsByOrder = {};
  for (var i = 1; i < itemsData.length; i++) {
    var row = itemsData[i];
    var oid = row[0];
    if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
    var engravingTexts = [];
    try {
      engravingTexts = row[9] ? JSON.parse(row[9]) : [];
    } catch (e) {
      engravingTexts = [];
    }
    itemsByOrder[oid].push({
      productName: row[1],
      qty: row[2],
      unitPrice: row[3],
      lineTotal: row[4],
      engravingRequested: !!row[6],
      engravingType: row[7] || '',
      engravingMode: row[8] || '',
      engravingTexts: engravingTexts,
      engravingLogoLink: row[10] || '',
      engravingFee: row[11] || 0
    });
  }

  var orders = [];
  for (var r = 1; r < ordersData.length; r++) {
    var o = ordersData[r];
    if (!o[0]) continue;
    orders.push({
      orderId: String(o[0]),
      timestamp: o[1],
      customerName: String(o[2]),
      phone: String(o[3]),
      governorate: String(o[4]),
      area: String(o[5]),
      address: String(o[6]),
      gpsLink: o[7],
      bundleLabel: o[8],
      itemsSubtotal: o[9],
      shippingFee: o[10],
      totalPrice: o[11],
      paymentMethod: o[12],
      status: o[13],
      lastUpdated: o[14],
      engravingFeeTotal: o[15] || 0,
      note: o[16] || '',
      items: itemsByOrder[o[0]] || []
    });
  }

  orders.reverse(); // الأحدث أولاً

  return { ok: true, orders: orders };
}

function handleUpdateStatus(body) {
  var authErr = requireAuth(body);
  if (authErr) return authErr;

  var orderId = String(body.orderId || '');
  var status = String(body.status || '');
  if (ORDER_STATUSES.indexOf(status) === -1) {
    return { ok: false, error: 'حالة غير صحيحة.' };
  }

  var lock = LockService.getScriptLock();
  var gotLock = false;
  try {
    gotLock = lock.tryLock(10000);
  } catch (e) {
    gotLock = false;
  }
  if (!gotLock) {
    return { ok: false, retry: true, error: 'الخادم مشغول، حاول مرة أخرى.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordersSheet = ss.getSheetByName(SHEET_ORDERS);
    var itemsSheet = ss.getSheetByName(SHEET_ITEMS);

    var ordersData = ordersSheet.getDataRange().getValues();
    var found = false;
    for (var r = 1; r < ordersData.length; r++) {
      if (ordersData[r][0] === orderId) {
        ordersSheet.getRange(r + 1, 14).setValue(status);        // Status column (N)
        ordersSheet.getRange(r + 1, 15).setValue(new Date());    // LastUpdated column (O)
        found = true;
        break;
      }
    }
    if (!found) return { ok: false, error: 'الطلب غير موجود.' };

    // Sync status to line items (for Inventory SUMIFS)
    var itemsData = itemsSheet.getDataRange().getValues();
    for (var i = 1; i < itemsData.length; i++) {
      if (itemsData[i][0] === orderId) {
        itemsSheet.getRange(i + 1, 6).setValue(status); // Status column (F)
      }
    }

    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/**
 * حفظ/تعديل ملاحظة اختيارية على الطلب — مفيدة خصوصًا للطلبات المرتجعة
 * (تسجيل سبب الإرجاع)، لكن متاحة لأي طلب بغض النظر عن حالته.
 */
function handleUpdateOrderNote(body) {
  var authErr = requireAuth(body);
  if (authErr) return authErr;

  var orderId = String(body.orderId || '');
  var note = String(body.note || '').trim().slice(0, 500);
  if (!orderId) return { ok: false, error: 'رقم الطلب مطلوب.' };

  var lock = LockService.getScriptLock();
  var gotLock = false;
  try {
    gotLock = lock.tryLock(10000);
  } catch (e) {
    gotLock = false;
  }
  if (!gotLock) {
    return { ok: false, retry: true, error: 'الخادم مشغول، حاول مرة أخرى.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordersSheet = ss.getSheetByName(SHEET_ORDERS);
    var data = ordersSheet.getDataRange().getValues();
    for (var r = 1; r < data.length; r++) {
      if (data[r][0] === orderId) {
        ordersSheet.getRange(r + 1, 17).setValue(note); // ReturnNote column (Q)
        return { ok: true };
      }
    }
    return { ok: false, error: 'الطلب غير موجود.' };
  } finally {
    lock.releaseLock();
  }
}

function handleGetInventory(body) {
  var authErr = requireAuth(body);
  if (authErr) return authErr;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_INVENTORY);
  if (!sheet) return { ok: false, error: 'شيت المخزون غير موجود.' };

  var data = sheet.getDataRange().getValues();
  var rows = [];
  for (var r = 1; r < data.length; r++) {
    if (!data[r][0]) continue;
    rows.push({
      productName: data[r][0],
      initialStock: data[r][1],
      sold: data[r][2],
      currentStock: data[r][3],
      requiredToManufacture: data[r][4]
    });
  }
  return { ok: true, inventory: rows };
}

function handleAddStock(body) {
  var authErr = requireAuth(body);
  if (authErr) return authErr;

  var productName = String(body.productName || '').trim();
  var qty = Number(body.qty || 0);
  if (!productName) return { ok: false, error: 'اسم المنتج مطلوب.' };
  if (!qty || qty <= 0 || !isFinite(qty)) return { ok: false, error: 'الكمية غير صحيحة.' };

  var lock = LockService.getScriptLock();
  var gotLock = false;
  try {
    gotLock = lock.tryLock(10000);
  } catch (e) {
    gotLock = false;
  }
  if (!gotLock) {
    return { ok: false, retry: true, error: 'الخادم مشغول، حاول مرة أخرى.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INVENTORY);
    if (!sheet) return { ok: false, error: 'شيت المخزون غير موجود.' };

    var data = sheet.getDataRange().getValues();
    for (var r = 1; r < data.length; r++) {
      if (data[r][0] === productName) {
        var currentInitial = Number(data[r][1] || 0);
        var newInitial = currentInitial + qty;
        sheet.getRange(r + 1, 2).setValue(newInitial); // InitialStock column (B)
        return { ok: true, productName: productName, newInitialStock: newInitial };
      }
    }
    return { ok: false, error: 'المنتج غير موجود في شيت المخزون.' };
  } finally {
    lock.releaseLock();
  }
}

// ============================== DISCOUNTS ==============================

// عامة (بدون تسجيل دخول) — المتجر محتاج يقرأها عشان يحسب الأسعار للعميلة
function handleGetDiscountRules(body) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var bundleSheet = ss.getSheetByName(SHEET_BUNDLE_DISCOUNTS);
  var bundle = [];
  if (bundleSheet) {
    var bundleData = bundleSheet.getDataRange().getValues();
    for (var i = 1; i < bundleData.length; i++) {
      if (bundleData[i][0] === '' || bundleData[i][0] === null) continue;
      bundle.push({ pieces: Number(bundleData[i][0]), amount: Number(bundleData[i][1]) });
    }
  }

  var productSheet = ss.getSheetByName(SHEET_PRODUCT_DISCOUNTS);
  var product = [];
  if (productSheet) {
    var productData = productSheet.getDataRange().getValues();
    for (var j = 1; j < productData.length; j++) {
      if (!productData[j][0]) continue;
      product.push({
        productName: String(productData[j][0]),
        minQty: Number(productData[j][1]),
        percent: Number(productData[j][2])
      });
    }
  }

  return { ok: true, bundle: bundle, product: product };
}

// إدارية (لازم تسجيل دخول) — بتمسح وتعيد كتابة الجدولين بالكامل بالقيم الجديدة
function handleSaveDiscountRules(body) {
  var authErr = requireAuth(body);
  if (authErr) return authErr;

  var bundle = Array.isArray(body.bundle) ? body.bundle : [];
  var product = Array.isArray(body.product) ? body.product : [];

  // تحقق بسيط من صحة البيانات قبل الحفظ
  for (var i = 0; i < bundle.length; i++) {
    var b = bundle[i];
    if (!isFinite(Number(b.pieces)) || Number(b.pieces) < 1) {
      return { ok: false, error: 'عدد القطع في صف خصم الكمية لازم يكون رقم صحيح 1 أو أكتر.' };
    }
    if (!isFinite(Number(b.amount)) || Number(b.amount) < 0) {
      return { ok: false, error: 'قيمة خصم الكمية لازم تكون رقم صفر أو أكتر.' };
    }
  }
  for (var j = 0; j < product.length; j++) {
    var p = product[j];
    if (!String(p.productName || '').trim()) {
      return { ok: false, error: 'لازم تختاري منتج لكل صف خصم منتج.' };
    }
    if (!isFinite(Number(p.minQty)) || Number(p.minQty) < 1) {
      return { ok: false, error: 'الكمية المطلوبة لخصم المنتج لازم تكون رقم صحيح 1 أو أكتر.' };
    }
    if (!isFinite(Number(p.percent)) || Number(p.percent) < 0 || Number(p.percent) > 100) {
      return { ok: false, error: 'نسبة خصم المنتج لازم تكون بين 0 و100.' };
    }
  }

  var lock = LockService.getScriptLock();
  var gotLock = false;
  try {
    gotLock = lock.tryLock(10000);
  } catch (e) {
    gotLock = false;
  }
  if (!gotLock) {
    return { ok: false, retry: true, error: 'الخادم مشغول، حاول مرة أخرى.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var bundleSheet = ss.getSheetByName(SHEET_BUNDLE_DISCOUNTS) || ss.insertSheet(SHEET_BUNDLE_DISCOUNTS);
    bundleSheet.clear();
    bundleSheet.getRange(1, 1, 1, 2).setValues([['Pieces', 'DiscountAmount']]);
    bundleSheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#241a12').setFontColor('#f7f1e4');
    if (bundle.length) {
      var bundleRows = bundle.map(function (b) { return [Number(b.pieces), Number(b.amount)]; });
      bundleSheet.getRange(2, 1, bundleRows.length, 2).setValues(bundleRows);
    }

    var productSheet = ss.getSheetByName(SHEET_PRODUCT_DISCOUNTS) || ss.insertSheet(SHEET_PRODUCT_DISCOUNTS);
    productSheet.clear();
    productSheet.getRange(1, 1, 1, 3).setValues([['ProductName', 'MinQty', 'DiscountPercent']]);
    productSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#241a12').setFontColor('#f7f1e4');
    if (product.length) {
      var productRows = product.map(function (p) {
        return [String(p.productName), Number(p.minQty), Number(p.percent)];
      });
      productSheet.getRange(2, 1, productRows.length, 3).setValues(productRows);
    }

    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

// ======================== PROMO BAR / COUNTDOWN ========================

function seedPromoSettings_(ss) {
  var settings = ss.getSheetByName(SHEET_SETTINGS) || ss.insertSheet(SHEET_SETTINGS);
  settings.clear();
  settings.getRange(1, 1, 1, 2).setValues([['Key', 'Value']]);
  settings.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#241a12').setFontColor('#f7f1e4');
  settings.setColumnWidths(1, 2, 260);
  // مفعّل TRUE من أول تشغيل بعرض افتراضي جاهز — الأدمن يقدر يغيّر الرسالة
  // أو المدة أو يوقفه تمامًا من تبويب "العرض الترويجي" في لوحة التحكم وقت ما يحب.
  settings.getRange(2, 1, 4, 2).setValues([
    ['PromoEnabled', 'TRUE'],
    ['PromoMessage', '🔥 149 ج.م للقطعة الواحدة من أول القطعة الثانية'],
    ['PromoDurationHours', 7],
    ['PromoVersion', String(Date.now())]
  ]);
}

/** بتنشئ (أو تصلّح) شيت الإعدادات بس، من غير أي تأثير خالص على الطلبات أو
 * المخزون أو الخصومات. آمنة تمامًا تشغّليها في أي وقت، حتى لو عندك طلبات
 * حقيقية مسجّلة بالفعل. */
function setupPromoSettingsOnly() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  seedPromoSettings_(ss);
  SpreadsheetApp.getUi().alert(
    'تم بنجاح ✅\nتم إنشاء شيت الإعدادات (Settings) وتفعيل عرض افتراضي، من غير أي تأثير على بيانات الطلبات أو المخزون.\n' +
    'تقدري تغيّري الرسالة أو توقفيه من تبويب "العرض الترويجي" في لوحة التحكم.'
  );
}

/** بتلاقي (أو تنشئ) شيت الإعدادات العام (key/value)، مستخدم للعرض الترويجي
 * وأي إعدادات عامة تانية تتضاف مستقبلًا. */
function getSettingsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_SETTINGS);
    sheet.getRange(1, 1, 1, 2).setValues([['Key', 'Value']]);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#241a12').setFontColor('#f7f1e4');
    sheet.setColumnWidths(1, 2, 260);
  }
  return sheet;
}

function getSetting_(key, defaultValue) {
  var sheet = getSettingsSheet_();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === key) return data[i][1];
  }
  return defaultValue;
}

function setSetting_(key, value) {
  var sheet = getSettingsSheet_();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

/** بتحوّل أي قيمة جاية من خلية الشيت (نص "TRUE"، نص "true"، أو Boolean حقيقي
 * لو جوجل شيت أوتوماتيك حوّل الخلية) لـ Boolean صح دايمًا. */
function toBool_(value) {
  if (typeof value === 'boolean') return value;
  return String(value).trim().toUpperCase() === 'TRUE';
}

/** إعدادات العرض الترويجي (شريط الرسالة + العد التنازلي) — بيانات عامة
 * مفيش أي حساسية فيها، فمتاحة من غير تسجيل دخول عشان تظهر لكل زوار الموقع. */
function handleGetPromoConfig(body) {
  return {
    ok: true,
    promo: {
      enabled: toBool_(getSetting_('PromoEnabled', 'FALSE')),
      message: String(getSetting_('PromoMessage', '')),
      durationHours: Number(getSetting_('PromoDurationHours', 7)) || 7,
      version: String(getSetting_('PromoVersion', '0'))
    }
  };
}

/**
 * حفظ إعدادات العرض من لوحة التحكم. كل حفظ بيولّد "نسخة" جديدة (Version =
 * الوقت الحالي)، وده اللي بيخلي العد التنازلي يبدأ من الأول لكل زوار
 * الموقع (حتى اللي كان عندهم عداد شغال بالفعل من عرض سابق) — مش بس الزوار
 * الجداد.
 */
function handleSavePromoConfig(body) {
  var authErr = requireAuth(body);
  if (authErr) return authErr;

  var promo = body.promo || {};
  var enabled = !!promo.enabled;
  var message = String(promo.message || '').trim();
  var durationHours = Number(promo.durationHours);

  if (enabled && !message) {
    return { ok: false, error: 'من فضلك اكتبي نص الرسالة.' };
  }
  if (!isFinite(durationHours) || durationHours <= 0 || durationHours > 999) {
    return { ok: false, error: 'مدة العرض لازم تكون رقم بين 0 و999 ساعة.' };
  }

  setSetting_('PromoEnabled', enabled ? 'TRUE' : 'FALSE');
  setSetting_('PromoMessage', message);
  setSetting_('PromoDurationHours', durationHours);
  setSetting_('PromoVersion', String(Date.now()));

  return { ok: true };
}

// ============================== HELPERS ===============================

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================== ONE-TIME SETUP — شغّليها مرة واحدة ==================

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ---------- Orders ----------
  var orders = ss.getSheetByName(SHEET_ORDERS) || ss.insertSheet(SHEET_ORDERS);
  orders.clear();
  orders.getRange(1, 1, 1, 17).setValues([[
    'OrderID', 'Timestamp', 'CustomerName', 'Phone', 'Governorate', 'Area',
    'DetailedAddress', 'GPSLink', 'BundleLabel', 'ItemsSubtotal', 'ShippingFee',
    'TotalPrice', 'PaymentMethod', 'Status', 'LastUpdated', 'EngravingFeeTotal',
    'ReturnNote'
  ]]);
  orders.setFrozenRows(1);
  orders.getRange(1, 1, 1, 17).setFontWeight('bold').setBackground('#241a12').setFontColor('#f7f1e4');
  orders.setColumnWidths(1, 17, 140);
  orders.setColumnWidth(7, 220);
  orders.setColumnWidth(17, 260);
  // تنسيق عمود الهاتف كنص عادي عشان جوجل شيت متحولوش لرقم ويشيل الصفر الأول
  orders.getRange(2, 4, orders.getMaxRows() - 1, 1).setNumberFormat('@');

  // ---------- OrderItems ----------
  // النقش دلوقتي مسجّل هنا لكل قطعة على حدة (مش في شيت Orders) — كل قطعة/تصميم
  // في الطلب ممكن يكون ليها نقش مختلف تمامًا عن باقي القطع.
  var items = ss.getSheetByName(SHEET_ITEMS) || ss.insertSheet(SHEET_ITEMS);
  items.clear();
  items.getRange(1, 1, 1, 12).setValues([[
    'OrderID', 'ProductName', 'Qty', 'UnitPrice', 'LineTotal', 'Status',
    'EngravingRequested', 'EngravingType', 'EngravingMode', 'EngravingTexts',
    'EngravingLogoLink', 'EngravingFee'
  ]]);
  items.setFrozenRows(1);
  items.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#241a12').setFontColor('#f7f1e4');
  items.setColumnWidths(1, 12, 160);

  // ---------- Inventory ----------
  var inv = ss.getSheetByName(SHEET_INVENTORY) || ss.insertSheet(SHEET_INVENTORY);
  inv.clear();
  inv.getRange(1, 1, 1, 5).setValues([[
    'ProductName', 'InitialStock', 'Sold', 'CurrentStock', 'RequiredToManufacture'
  ]]);
  inv.setFrozenRows(1);
  inv.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#241a12').setFontColor('#f7f1e4');
  inv.setColumnWidths(1, 5, 190);

  var startRow = 2;
  DEFAULT_PRODUCTS.forEach(function (p, idx) {
    var row = startRow + idx;
    inv.getRange(row, 1).setValue(p.name);
    inv.getRange(row, 2).setValue(p.stock);
    // Sold = مجموع الكميات لنفس المنتج في OrderItems ما عدا حالة "مرتجع"
    inv.getRange(row, 3).setFormula(
      '=SUMIFS(' + SHEET_ITEMS + '!C:C,' + SHEET_ITEMS + '!B:B,A' + row + ',' +
      SHEET_ITEMS + '!F:F,"<>مرتجع")'
    );
    // Current Stock = Initial - Sold
    inv.getRange(row, 4).setFormula('=B' + row + '-C' + row);
    // Required to Manufacture = ABS(CurrentStock) إذا كان سالب، غير كده صفر
    inv.getRange(row, 5).setFormula('=IF(D' + row + '<0,ABS(D' + row + '),0)');
  });

  // تمييز أحمر لو المخزون الحالي بالسالب
  var lastInvRow = startRow + DEFAULT_PRODUCTS.length - 1;
  var stockRange = inv.getRange(startRow, 4, DEFAULT_PRODUCTS.length, 1);
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setBackground('#f8d7da')
    .setFontColor('#842029')
    .setRanges([stockRange])
    .build();
  var rules = inv.getConditionalFormatRules();
  rules.push(rule);
  inv.setConditionalFormatRules(rules);

  ss.setSpreadsheetTimeZone(TIMEZONE);

  seedDiscountSheets_(ss);
  seedPromoSettings_(ss);

 try {
  var ui = SpreadsheetApp.getUi();
  ui.alert('تم إنشاء الشيتات بنجاح!');
} catch (e) {
  // إذا تم استدعاؤه من الـ Web App / API تجاهل الـ UI واستخدم Logger بدلاً منه
  Logger.log('إشعار: تم التشغيل بدون UI');
}
}

// ⚠️ آمنة الاستخدام في أي وقت — بتنشئ شيتات الخصومات بس، ومبتلمسش
// Orders / OrderItems / Inventory خالص. شغّلي الفنكشن ده لو عندك متجر شغال
// بالفعل وعايزة تضيفي ميزة الخصومات المرنة من غير ما تخسري أي بيانات موجودة.
function setupDiscountSheetsOnly() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  seedDiscountSheets_(ss);
  SpreadsheetApp.getUi().alert(
    'تم بنجاح ✅\nتم إنشاء شيتات الخصومات (BundleDiscounts / ProductDiscounts) بالقيم الافتراضية، من غير أي تأثير على بيانات الطلبات أو المخزون.'
  );
}

function seedDiscountSheets_(ss) {
  // ---------- BundleDiscounts ----------
  var bundleDiscounts = ss.getSheetByName(SHEET_BUNDLE_DISCOUNTS) || ss.insertSheet(SHEET_BUNDLE_DISCOUNTS);
  bundleDiscounts.clear();
  bundleDiscounts.getRange(1, 1, 1, 2).setValues([['Pieces', 'DiscountAmount']]);
  bundleDiscounts.setFrozenRows(1);
  bundleDiscounts.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#241a12').setFontColor('#f7f1e4');
  bundleDiscounts.setColumnWidths(1, 2, 160);
  // القيم دي "من كذا قطعة فأكثر" — قيمة الخصم بالجنيه للقطعة الواحدة (نفس القيمة
  // بتتطبق على كل الخامات بغض النظر عن سعرها) — قابلة للتعديل من تبويب الخصومات باللوحة
  var defaultBundleRules = [[1, 0], [2, 50]];
  bundleDiscounts.getRange(2, 1, defaultBundleRules.length, 2).setValues(defaultBundleRules);

  // ---------- ProductDiscounts ----------
  var productDiscounts = ss.getSheetByName(SHEET_PRODUCT_DISCOUNTS) || ss.insertSheet(SHEET_PRODUCT_DISCOUNTS);
  productDiscounts.clear();
  productDiscounts.getRange(1, 1, 1, 3).setValues([['ProductName', 'MinQty', 'DiscountPercent']]);
  productDiscounts.setFrozenRows(1);
  productDiscounts.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#241a12').setFontColor('#f7f1e4');
  productDiscounts.setColumnWidths(1, 3, 200);
  // فاضية افتراضيًا — ضيفي عروض على منتجات معينة من تبويب الخصومات باللوحة لو حبيتِ
}
