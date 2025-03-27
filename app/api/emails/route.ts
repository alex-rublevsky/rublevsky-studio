import ClientOrderConfirmation from '@/emails/clientOrderConfirmation';
import AdminOrderConfirmation from '@/emails/adminEmailConfirmation';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { CartItem } from '@/lib/context/CartContext';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'alexander.rublevskii@gmail.com';

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
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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
    const data: OrderEmailData = await request.json();
    
    const { firstName, lastName, email, orderItems, orderId, subtotal, totalDiscount, orderTotal, shippingAddress, billingAddress, shippingMethod, notes } = data;

    // Format order items for email template
    const formattedOrderItems = orderItems.map(item => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price.toFixed(2),
      originalPrice: item.price.toFixed(2),
      discount: item.discount ?? undefined,
      image: item.image
    }));

    // Send client confirmation email
    const clientEmailResult = await resend.emails.send({
      from: 'Rublevsky Studio <orders@rublevskystudio.com>',
      to: email,
      subject: `Order Confirmation #${orderId}`,
      react: ClientOrderConfirmation({
        Name: firstName,
        LastName: lastName,
        email,
        orderId: orderId.toString(),
        orderDate: new Date().toISOString(),
        subtotal: subtotal.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        orderTotal: orderTotal.toFixed(2),
        orderStatus: 'Confirmed',
        orderItems: formattedOrderItems
      }),
    });

    // Send admin notification email
    const adminEmailResult = await resend.emails.send({
      from: 'Rublevsky Studio <orders@rublevskystudio.com>',
      to: ADMIN_EMAIL,
      subject: `New Order #${orderId} - Rublevsky Studio`,
      react: AdminOrderConfirmation({
        Name: firstName,
        LastName: lastName,
        email,
        orderId: orderId.toString(),
        orderDate: new Date().toISOString(),
        subtotal: subtotal.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        orderTotal: orderTotal.toFixed(2),
        orderStatus: 'Pending',
        shippingMethod,
        shippingAddress,
        billingAddress,
        orderItems: formattedOrderItems
      }),
    });

    return NextResponse.json({ 
      success: true, 
      data: { 
        clientEmail: clientEmailResult,
        adminEmail: adminEmailResult 
      } 
    });
  } catch (error) {
    console.error('Error sending order emails:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send order emails' },
      { status: 500 }
    );
  }
}