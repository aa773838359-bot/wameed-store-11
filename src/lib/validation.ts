import { z, type ZodSchema } from 'zod';

// ─── Allowed settings keys ───────────────────────────────────────────────────
const ALLOWED_SETTINGS_KEYS = [
  'whatsappNumber',
  'displayCurrencyId',
  'manualRateEnabled',
  'manualExchangeRate',
  'adminPassword',
  'stripePublicKey',
  'stripeSecretKey',
  'smtpHost',
  'smtpPort',
  'smtpUser',
  'storeEmail',
] as const;

// ─── 1. Login Schema ─────────────────────────────────────────────────────────
export const loginSchema = z.object({
  password: z.string().trim().min(1, 'كلمة المرور مطلوبة'),
});

// ─── 2. Product Schema ───────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().trim().min(1, 'اسم المنتج بالإنجليزية مطلوب').max(200, 'اسم المنتج يجب أن لا يتجاوز 200 حرف'),
  nameAr: z.string().trim().min(1, 'اسم المنتج بالعربية مطلوب').max(200, 'اسم المنتج يجب أن لا يتجاوز 200 حرف'),
  description: z.string().trim().min(1, 'وصف المنتج بالإنجليزية مطلوب').max(5000, 'الوصف يجب أن لا يتجاوز 5000 حرف'),
  descriptionAr: z.string().trim().min(1, 'وصف المنتج بالعربية مطلوب').max(5000, 'الوصف يجب أن لا يتجاوز 5000 حرف'),
  price: z.number('السعر يجب أن يكون رقماً').positive('السعر يجب أن يكون رقماً موجباً').finite().max(999999.99, 'السعر يجب أن لا يتجاوز 999999.99'),
  originalPrice: z.number('السعر الأصلي يجب أن يكون رقماً').positive('السعر الأصلي يجب أن يكون رقماً موجباً').finite().max(999999.99, 'السعر الأصلي يجب أن لا يتجاوز 999999.99').optional(),
  image: z.string().trim().min(1, 'صورة المنتج مطلوبة'),
  images: z.array(z.string().trim().min(1, 'رابط الصورة مطلوب')).optional(),
  brand: z.string().trim().max(100, 'اسم العلامة التجارية يجب أن لا يتجاوز 100 حرف'),
  brandAr: z.string().trim().max(100, 'اسم العلامة التجارية بالعربية يجب أن لا يتجاوز 100 حرف'),
  tags: z.array(z.string().trim().min(1)).optional(),
  tagsAr: z.array(z.string().trim().min(1)).optional(),
  rating: z.number('التقييم يجب أن يكون رقماً').min(0, 'التقييم لا يمكن أن يكون أقل من 0').max(5, 'التقييم لا يمكن أن يكون أكثر من 5').optional(),
  stock: z.number('المخزون يجب أن يكون رقماً').int('المخزون يجب أن يكون رقماً صحيحاً').min(0, 'المخزون لا يمكن أن يكون أقل من 0'),
  reviewCount: z.number('عدد التقييمات يجب أن يكون رقماً').int('عدد التقييمات يجب أن يكون رقماً صحيحاً').min(0, 'عدد التقييمات لا يمكن أن يكون أقل من 0').optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().trim().min(1, 'التصنيف مطلوب'),
});

// ─── 3. Category Schema ──────────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().trim().min(1, 'اسم التصنيف بالإنجليزية مطلوب'),
  nameAr: z.string().trim().min(1, 'اسم التصنيف بالعربية مطلوب'),
  slug: z.string().trim().min(1, 'الرابط المختصر مطلوب'),
  icon: z.string().trim().min(1, 'الأيقونة مطلوبة'),
  image: z.string().trim().min(1, 'الصورة مطلوبة').optional(),
  description: z.string().trim().optional(),
  order: z.number().int('الترتيب يجب أن يكون رقماً صحيحاً').min(0, 'الترتيب لا يمكن أن يكون أقل من 0').optional(),
});

// ─── 4. Offer Schema ─────────────────────────────────────────────────────────
export const offerSchema = z.object({
  title: z.string().trim().min(1, 'عنوان العرض بالإنجليزية مطلوب'),
  titleAr: z.string().trim().min(1, 'عنوان العرض بالعربية مطلوب'),
  description: z.string().trim().min(1, 'وصف العرض بالإنجليزية مطلوب'),
  descriptionAr: z.string().trim().min(1, 'وصف العرض بالعربية مطلوب'),
  image: z.string().trim().optional(),
  discountPercent: z.number('نسبة الخصم يجب أن تكون رقماً').min(0, 'نسبة الخصم لا يمكن أن تكون أقل من 0').max(100, 'نسبة الخصم لا يمكن أن تتجاوز 100'),
  badge: z.string().trim().optional(),
  badgeAr: z.string().trim().optional(),
  gradient: z.string().trim().optional(),
  ctaText: z.string().trim().optional(),
  ctaTextAr: z.string().trim().optional(),
  link: z.string().trim().optional(),
  productId: z.string().trim().optional(),
  active: z.boolean().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  order: z.number().int('الترتيب يجب أن يكون رقماً صحيحاً').min(0, 'الترتيب لا يمكن أن يكون أقل من 0').optional(),
});

// ─── 5. Order Schema ─────────────────────────────────────────────────────────
const orderItemSchema = z.object({
  productId: z.string().trim().min(1, 'معرّف المنتج مطلوب'),
  quantity: z.number('الكمية يجب أن تكون رقماً').int('الكمية يجب أن تكون رقماً صحيحاً').min(1, 'الكمية يجب أن تكون 1 على الأقل'),
});

export const orderSchema = z.object({
  email: z.string().trim().min(1, 'البريد الإلكتروني مطلوب').email('البريد الإلكتروني غير صالح'),
  firstName: z.string().trim().min(1, 'الاسم الأول مطلوب'),
  lastName: z.string().trim().min(1, 'الاسم الأخير مطلوب'),
  address: z.string().trim().min(1, 'العنوان مطلوب'),
  city: z.string().trim().min(1, 'المدينة مطلوبة'),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  phone: z.string().trim().min(1, 'رقم الهاتف مطلوب'),
  items: z.array(orderItemSchema).min(1, 'يجب إضافة منتج واحد على الأقل'),
  paymentMethod: z.string().trim().optional(),
});

// ─── 6. Settings Schema ──────────────────────────────────────────────────────
const settingEntrySchema = z.object({
  key: z.enum(ALLOWED_SETTINGS_KEYS, { message: 'مفتاح الإعداد غير صالح' }),
  value: z.string().trim().min(1, 'قيمة الإعداد مطلوبة'),
});

export const settingsSchema = z.array(settingEntrySchema).min(1, 'يجب إضافة إعداد واحد على الأقل');

// ─── 7. Currency Schema ──────────────────────────────────────────────────────
export const currencySchema = z.object({
  code: z.string().trim().min(1, 'رمز العملة مطلوب').max(10, 'رمز العملة يجب أن لا يتجاوز 10 أحرف'),
  name: z.string().trim().min(1, 'اسم العملة بالإنجليزية مطلوب'),
  nameAr: z.string().trim().min(1, 'اسم العملة بالعربية مطلوب'),
  symbol: z.string().trim().min(1, 'رمز العملة مطلوب'),
  exchangeRate: z.number('سعر الصرف يجب أن يكون رقماً').positive('سعر الصرف يجب أن يكون رقماً موجباً').finite(),
  isDefault: z.boolean().optional(),
  active: z.boolean().optional(),
  order: z.number().int('الترتيب يجب أن يكون رقماً صحيحاً').min(0, 'الترتيب لا يمكن أن يكون أقل من 0').optional(),
});

// ─── 8. Ad Schema ────────────────────────────────────────────────────────────
export const adSchema = z.object({
  title: z.string().trim().min(1, 'عنوان الإعلان بالإنجليزية مطلوب'),
  titleAr: z.string().trim().min(1, 'عنوان الإعلان بالعربية مطلوب'),
  description: z.string().trim().optional(),
  descriptionAr: z.string().trim().optional(),
  image: z.string().trim().optional(),
  link: z.string().trim().optional(),
  position: z.string().trim().optional(),
  active: z.boolean().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  order: z.number().int('الترتيب يجب أن يكون رقماً صحيحاً').min(0, 'الترتيب لا يمكن أن يكون أقل من 0').optional(),
});

// ─── 9. Text Schema ──────────────────────────────────────────────────────────
export const textSchema = z.object({
  key: z.string().trim().min(1, 'مفتاح النص مطلوب'),
  value: z.string().trim().min(1, 'النص بالإنجليزية مطلوب'),
  valueAr: z.string().trim().min(1, 'النص بالعربية مطلوب'),
  group: z.string().trim().optional(),
});

// ─── 10. Review Schema ───────────────────────────────────────────────────────
export const reviewSchema = z.object({
  productId: z.string().trim().min(1, 'معرّف المنتج مطلوب'),
  userName: z.string().trim().min(1, 'الاسم مطلوب').max(100, 'الاسم يجب أن لا يتجاوز 100 حرف'),
  rating: z.number('التقييم يجب أن يكون رقماً').int('التقييم يجب أن يكون رقماً صحيحاً').min(1, 'التقييم لا يمكن أن يكون أقل من 1').max(5, 'التقييم لا يمكن أن يكون أكثر من 5'),
  comment: z.string().trim().max(1000, 'التعليق يجب أن لا يتجاوز 1000 حرف').optional(),
});

// ─── Helper: validateData ────────────────────────────────────────────────────
export function validateData<T>(
  schema: ZodSchema,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data as T };
  }

  // Collect all error messages and return the first one as a user-friendly Arabic message
  const issues = result.error.issues;

  if (issues.length > 0) {
    // Use the custom Arabic message if provided by the schema, otherwise generate one
    const firstIssue = issues[0];
    const customMessage = firstIssue.message;

    // If the schema already provided an Arabic message, use it directly
    if (customMessage && /[\u0600-\u06FF]/.test(customMessage)) {
      return { success: false, error: customMessage };
    }

    // Fallback: generate an Arabic error message based on the issue type
    const fieldPath = firstIssue.path.join('.');
    let fallbackMessage: string;

    switch (firstIssue.code) {
      case 'invalid_type':
        fallbackMessage = `الحقل "${fieldPath || 'غير معروف'}" يجب أن يكون ${firstIssue.expected === 'number' ? 'رقماً' : firstIssue.expected === 'string' ? 'نصاً' : firstIssue.expected === 'boolean' ? 'قيمة منطقية' : 'صحيحاً'}`;
        break;
      case 'too_small':
        fallbackMessage = `الحقل "${fieldPath || 'غير معروف'}" قصير جداً`;
        break;
      case 'too_big':
        fallbackMessage = `الحقل "${fieldPath || 'غير معروف'}" طويل جداً`;
        break;
      case 'invalid_format':
        fallbackMessage = `الحقل "${fieldPath || 'غير معروف'}" غير صالح`;
        break;
      default:
        fallbackMessage = customMessage || 'البيانات المدخلة غير صالحة';
    }

    return { success: false, error: fallbackMessage };
  }

  return { success: false, error: 'البيانات المدخلة غير صالحة' };
}

// ─── Type exports ────────────────────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type CurrencyInput = z.infer<typeof currencySchema>;
export type AdInput = z.infer<typeof adSchema>;
export type TextInput = z.infer<typeof textSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
