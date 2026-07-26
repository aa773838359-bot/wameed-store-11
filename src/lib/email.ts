import nodemailer from 'nodemailer';

// ─── SMTP Configuration ──────────────────────────────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const STORE_EMAIL = process.env.STORE_EMAIL || SMTP_USER;

// ─── Transporter (lazy initialization) ───────────────────────────────────────
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: SMTP_USER && SMTP_PASS ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
      } : undefined,
    });
  }
  return transporter;
}

// ─── Order Item Type ─────────────────────────────────────────────────────────
interface OrderItemData {
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderConfirmationData {
  orderId: string;
  email: string;
  firstName: string;
  lastName: string;
  items: OrderItemData[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  phone: string;
  status: string;
}

// ─── Status Arabic Translation ───────────────────────────────────────────────
const STATUS_ARABIC: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  refunded: 'مسترد',
};

function getStatusArabic(status: string): string {
  return STATUS_ARABIC[status] || status;
}

// ─── Payment Method Arabic ───────────────────────────────────────────────────
const PAYMENT_METHOD_ARABIC: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  card: 'بطاقة ائتمان',
  bank: 'تحويل بنكي',
  paypal: 'باي بال',
};

function getPaymentMethodArabic(method: string): string {
  return PAYMENT_METHOD_ARABIC[method] || method;
}

// ─── Format Price ────────────────────────────────────────────────────────────
function formatPrice(amount: number): string {
  return amount.toFixed(2);
}

// ─── Order Confirmation Email HTML ───────────────────────────────────────────
function generateOrderConfirmationHTML(data: OrderConfirmationData): string {
  const itemsRows = data.items.map(item => `
    <tr style="border-bottom: 1px solid #f0f0f0;">
      <td style="padding: 12px 16px; text-align: right; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 14px; color: #333;">
        ${item.name}
      </td>
      <td style="padding: 12px 16px; text-align: center; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 14px; color: #555;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 16px; text-align: left; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 14px; color: #555;">
        ${formatPrice(item.price)}
      </td>
      <td style="padding: 12px 16px; text-align: left; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 14px; color: #333; font-weight: 600;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  const shippingCost = data.shipping === 0 ? 'مجاني' : formatPrice(data.shipping);

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تأكيد الطلب - وميض ستور</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0;" align="center">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700; letter-spacing: 1px;">
                ✨ وميض ستور
              </h1>
              <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255,255,255,0.9);">
                تأكيد طلبك
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <h2 style="margin: 0; font-size: 20px; color: #333; font-weight: 600;">
                مرحباً ${data.firstName} ${data.lastName}،
              </h2>
              <p style="margin: 12px 0 0; font-size: 15px; color: #666; line-height: 1.7;">
                شكراً لطلبك! تم استلام طلبك بنجاح. إليك تفاصيل طلبك:
              </p>
            </td>
          </tr>

          <!-- Order Info Card -->
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa;">
                <tr>
                  <td style="padding: 16px 20px; text-align: right; width: 50%;">
                    <p style="margin: 0; font-size: 12px; color: #9a3412; font-weight: 500;">رقم الطلب</p>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #c2410c; font-weight: 700; font-family: monospace;">#${data.orderId.slice(-8).toUpperCase()}</p>
                  </td>
                  <td style="padding: 16px 20px; text-align: left; width: 50%;">
                    <p style="margin: 0; font-size: 12px; color: #9a3412; font-weight: 500;">حالة الطلب</p>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #c2410c; font-weight: 700;">
                      ${getStatusArabic(data.status)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items Table -->
          <tr>
            <td style="padding: 0 40px;">
              <h3 style="margin: 0 0 16px; font-size: 18px; color: #333; font-weight: 600;">تفاصيل المنتجات</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <!-- Table Header -->
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px 16px; text-align: right; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">المنتج</th>
                  <th style="padding: 12px 16px; text-align: center; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">الكمية</th>
                  <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">السعر</th>
                  <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">المجموع</th>
                </tr>
                ${itemsRows}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 320px; margin-right: auto;">
                <tr>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #666;">المجموع الفرعي</td>
                  <td style="padding: 8px 0; text-align: left; font-size: 14px; color: #333; font-weight: 500;">${formatPrice(data.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #666;">الضريبة</td>
                  <td style="padding: 8px 0; text-align: left; font-size: 14px; color: #333; font-weight: 500;">${formatPrice(data.tax)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #666;">الشحن</td>
                  <td style="padding: 8px 0; text-align: left; font-size: 14px; color: #333; font-weight: 500;">${shippingCost}</td>
                </tr>
                <tr style="border-top: 2px solid #f97316;">
                  <td style="padding: 12px 0 8px; text-align: right; font-size: 18px; color: #333; font-weight: 700;">الإجمالي</td>
                  <td style="padding: 12px 0 8px; text-align: left; font-size: 18px; color: #f97316; font-weight: 700;">${formatPrice(data.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
            </td>
          </tr>

          <!-- Shipping & Payment Info -->
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-left: 16px;">
                    <h4 style="margin: 0 0 12px; font-size: 15px; color: #333; font-weight: 600;">📍 عنوان الشحن</h4>
                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.8;">
                      ${data.address}<br>
                      ${data.city}${data.state ? `, ${data.state}` : ''} ${data.zipCode || ''}<br>
                      📞 ${data.phone}
                    </p>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-right: 16px;">
                    <h4 style="margin: 0 0 12px; font-size: 15px; color: #333; font-weight: 600;">💳 طريقة الدفع</h4>
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      ${getPaymentMethodArabic(data.paymentMethod)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Track Order Button -->
          <tr>
            <td style="padding: 8px 40px 32px;" align="center">
              <a href="${process.env.NEXT_PUBLIC_STORE_URL || '/'}/track?email=${encodeURIComponent(data.email)}"
                 style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">
                تتبع طلبك ←
              </a>
            </td>
          </tr>

          <!-- Thank You -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <p style="margin: 0; font-size: 15px; color: #666; line-height: 1.7;">
                شكراً لتسوقك معنا! 🎉<br>
                <span style="font-size: 13px; color: #999;">إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                © ${new Date().getFullYear()} وميض ستور - جميع الحقوق محفوظة
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #d1d5db;">
                تم إرسال هذا البريد تلقائياً، لا ترد عليه
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Status Update Email HTML ────────────────────────────────────────────────
function generateStatusUpdateHTML(data: {
  orderId: string;
  email: string;
  firstName: string;
  lastName: string;
  oldStatus: string;
  newStatus: string;
}): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تحديث حالة الطلب - وميض ستور</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0;" align="center">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700; letter-spacing: 1px;">
                ✨ وميض ستور
              </h1>
              <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255,255,255,0.9);">
                تحديث حالة طلبك
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <h2 style="margin: 0; font-size: 20px; color: #333; font-weight: 600;">
                مرحباً ${data.firstName} ${data.lastName}،
              </h2>
              <p style="margin: 12px 0 0; font-size: 15px; color: #666; line-height: 1.7;">
                تم تحديث حالة طلبك. إليك التفاصيل:
              </p>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa;">
                <tr>
                  <td style="padding: 16px 20px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #9a3412; font-weight: 500;">رقم الطلب</p>
                    <p style="margin: 4px 0 0; font-size: 18px; color: #c2410c; font-weight: 700; font-family: monospace;">#${data.orderId.slice(-8).toUpperCase()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Change -->
          <tr>
            <td style="padding: 0 40px 32px;" align="center">
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px 24px; background-color: #fef3c7; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 500;">الحالة السابقة</p>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #b45309; font-weight: 600;">${getStatusArabic(data.oldStatus)}</p>
                  </td>
                  <td style="padding: 0 20px; font-size: 24px; color: #f97316;">←</td>
                  <td style="padding: 16px 24px; background-color: #dcfce7; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #166534; font-weight: 500;">الحالة الجديدة</p>
                    <p style="margin: 4px 0 0; font-size: 16px; color: #15803d; font-weight: 600;">${getStatusArabic(data.newStatus)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Track Order Button -->
          <tr>
            <td style="padding: 8px 40px 32px;" align="center">
              <a href="${process.env.NEXT_PUBLIC_STORE_URL || '/'}/track?email=${encodeURIComponent(data.email)}"
                 style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">
                تتبع طلبك ←
              </a>
            </td>
          </tr>

          <!-- Thank You -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <p style="margin: 0; font-size: 15px; color: #666; line-height: 1.7;">
                شكراً لتسوقك معنا! 🎉<br>
                <span style="font-size: 13px; color: #999;">إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                © ${new Date().getFullYear()} وميض ستور - جميع الحقوق محفوظة
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #d1d5db;">
                تم إرسال هذا البريد تلقائياً، لا ترد عليه
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send Order Confirmation Email ───────────────────────────────────────────
export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('[Email] SMTP credentials not configured. Skipping order confirmation email.');
      return { success: false, error: 'SMTP not configured' };
    }

    const transport = getTransporter();

    const mailOptions = {
      from: `"وميض ستور" <${STORE_EMAIL}>`,
      to: data.email,
      subject: `تأكيد الطلب #${data.orderId.slice(-8).toUpperCase()} - وميض ستور`,
      html: generateOrderConfirmationHTML(data),
    };

    const result = await transport.sendMail(mailOptions);
    console.log(`[Email] Order confirmation sent to ${data.email}. MessageId: ${result.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('[Email] Failed to send order confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ─── Send Order Status Update Email ──────────────────────────────────────────
export async function sendOrderStatusUpdate(data: {
  orderId: string;
  email: string;
  firstName: string;
  lastName: string;
  oldStatus: string;
  newStatus: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('[Email] SMTP credentials not configured. Skipping status update email.');
      return { success: false, error: 'SMTP not configured' };
    }

    const transport = getTransporter();

    const mailOptions = {
      from: `"وميض ستور" <${STORE_EMAIL}>`,
      to: data.email,
      subject: `تحديث حالة الطلب #${data.orderId.slice(-8).toUpperCase()} - وميض ستور`,
      html: generateStatusUpdateHTML(data),
    };

    const result = await transport.sendMail(mailOptions);
    console.log(`[Email] Status update sent to ${data.email}. MessageId: ${result.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('[Email] Failed to send status update email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ─── Send Test Email ─────────────────────────────────────────────────────────
export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      return { success: false, error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.' };
    }

    const transport = getTransporter();

    const mailOptions = {
      from: `"وميض ستور" <${STORE_EMAIL}>`,
      to: toEmail,
      subject: 'بريد اختبار - وميض ستور ✅',
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0;" align="center">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">✨ وميض ستور</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; color: #333; font-weight: 600;">🎉 البريد الإلكتروني يعمل!</h2>
              <p style="margin: 16px 0 0; font-size: 15px; color: #666; line-height: 1.7;">
                تم إرسال هذا البريد بنجاح. إعدادات SMTP تعمل بشكل صحيح.
              </p>
              <table role="presentation" style="margin: 24px auto; border-collapse: collapse; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                <tr>
                  <td style="padding: 16px 24px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #166534;">
                      <strong>خادم SMTP:</strong> ${SMTP_HOST}:${SMTP_PORT}<br>
                      <strong>البريد المرسل:</strong> ${STORE_EMAIL}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                © ${new Date().getFullYear()} وميض ستور - جميع الحقوق محفوظة
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    };

    const result = await transport.sendMail(mailOptions);
    console.log(`[Email] Test email sent to ${toEmail}. MessageId: ${result.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('[Email] Failed to send test email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
