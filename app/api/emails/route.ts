import ClientOrderConfirmation from '@/emails/clientOrderConfirmation';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      orderItems,
      subtotal,
      totalDiscount,
      orderTotal,
    } = await request.json();

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Order Confirmed',
      react: ClientOrderConfirmation({
        Name: firstName,
        LastName: lastName,
        email: email,
        orderItems: orderItems,
        subtotal: subtotal,
        totalDiscount: totalDiscount,
        orderTotal: orderTotal,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}