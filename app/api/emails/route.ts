import ClientOrderConfirmation from '@/emails/clientOrderConfirmation';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { CartItem } from '@/lib/context/CartContext';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  firstName: string;
  lastName: string;
  email: string;
  orderItems: CartItem[];
  orderId: number;
  subtotal: number;
  totalDiscount: number;
  orderTotal: number;
  shippingAddress: {
    streetAddress: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  billingAddress?: {
    streetAddress: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  shippingMethod?: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      orderItems,
      orderId,
      subtotal,
      totalDiscount,
      orderTotal,
      shippingAddress,
      billingAddress,
      shippingMethod,
      notes
    }: OrderEmailData = await request.json();

    if (!email || !orderItems || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format order items for email template
    const formattedOrderItems = orderItems.map(item => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price.toFixed(2),
      originalPrice: item.price.toFixed(2),
      discount: item.discount || undefined,
      image: item.image
    }));

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: `Order #${orderId} Confirmed - Thank You for Your Purchase!`,
      react: ClientOrderConfirmation({
        Name: firstName,
        LastName: lastName,
        email,
        orderId: orderId.toString(),
        orderDate: new Date().toISOString(),
        subtotal: subtotal.toFixed(2),
        totalDiscount: totalDiscount ? totalDiscount.toFixed(2) : '0.00',
        orderTotal: orderTotal.toFixed(2),
        orderStatus: 'Confirmed',
        orderItems: formattedOrderItems
      }),
    });

    return NextResponse.json({ 
      success: true,
      message: 'Order confirmation email sent successfully'
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}