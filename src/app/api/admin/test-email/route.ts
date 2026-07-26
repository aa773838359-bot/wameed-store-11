import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { sendTestEmail } from '@/lib/email';

// POST /api/admin/test-email - Send a test email to verify SMTP configuration
export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json(
      { error: 'غير مصرح - يجب تسجيل الدخول أولاً' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      );
    }

    const result = await sendTestEmail(email);

    if (result.success) {
      return NextResponse.json({
        data: {
          message: 'تم إرسال البريد التجريبي بنجاح',
          email,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: `فشل إرسال البريد التجريبي: ${result.error}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('POST /api/admin/test-email error:', error);
    return NextResponse.json(
      { error: 'فشل إرسال البريد التجريبي' },
      { status: 500 }
    );
  }
}
