import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { Resend } from 'resend'
import { AdminOrderConfirmation } from '~/components/emails/adminOrderConfirmation'
import { ClientOrderConfirmation } from '~/components/emails/clientOrderConfirmation'

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY)

// TypeScript interfaces for the email data
interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  image?: string;
}

interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface EmailRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  orderItems: OrderItem[];
  orderId: number;
  subtotal: number;
  totalDiscount: number;
  orderTotal: number;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod?: string;
  notes?: string;
}

export const APIRoute = createAPIFileRoute('/api/emails')({
  POST: async ({ request }) => {

    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://rublevsky.studio',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
      // Parse the request body
      const body: EmailRequestBody = await request.json()
      
      // Validate required fields
      if (!body.email || !body.firstName || !body.lastName) {
        return json(
          { success: false, error: 'Missing required fields: email, firstName, or lastName' },
          { status: 400, headers: corsHeaders }
        )
      }

      if (!body.orderItems || body.orderItems.length === 0) {
        return json(
          { success: false, error: 'No order items provided' },
          { status: 400, headers: corsHeaders }
        )
      }

      // Format order date
      const orderDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      // Prepare email data for templates
      const emailData = {
        Name: body.firstName,
        LastName: body.lastName,
        email: body.email,
        orderId: body.orderId?.toString() || 'N/A',
        orderDate: orderDate,
        subtotal: `$${body.subtotal.toFixed(2)}`,
        totalDiscount: body.totalDiscount > 0 ? `$${body.totalDiscount.toFixed(2)}` : undefined,
        orderTotal: `$${body.orderTotal.toFixed(2)}`,
        orderStatus: 'Pending',
        shippingMethod: body.shippingMethod || 'Standard',
        shippingAddress: body.shippingAddress,
        billingAddress: body.billingAddress,
        orderItems: body.orderItems.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: `$${item.price.toFixed(2)}`,
          originalPrice: `$${item.price.toFixed(2)}`,
          discount: item.discount,
          image: item.image
        }))
      }

      // Send client confirmation email
      const clientEmailResponse = await resend.emails.send({
        from: 'store@rublevsky.studio',
        to: body.email,
        subject: `Order Confirmation #${body.orderId} - Rublevsky Studio`,
        react: ClientOrderConfirmation(emailData),
      })

      // Send admin notification email
      const adminEmailResponse = await resend.emails.send({
        from: 'store@rublevsky.studio',
        to: 'team@rublevsky.studio', // Admin email
        subject: `New Order #${body.orderId} Received - Rublevsky Studio`,
        react: AdminOrderConfirmation(emailData),
      })

      // Check if both emails were sent successfully
      if (clientEmailResponse.error) {
        console.error('Client email error:', clientEmailResponse.error)
        return json(
          { success: false, error: 'Failed to send client confirmation email' },
          { status: 500, headers: corsHeaders }
        )
      }

      if (adminEmailResponse.error) {
        console.error('Admin email error:', adminEmailResponse.error)
        return json(
          { success: false, error: 'Failed to send admin notification email' },
          { status: 500, headers: corsHeaders }
        )
      }

      return json({
        success: true,
        message: 'Email sent successfully',
        clientEmailId: clientEmailResponse.data?.id,
        adminEmailId: adminEmailResponse.data?.id
      }, { headers: corsHeaders })

    } catch (error) {
      console.error('Email API error:', error)
      return json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        },
        { status: 500, headers: corsHeaders }
      )
    }
  },

  OPTIONS: async () => {
    // Handle preflight requests
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://rublevsky.studio',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  },
})
