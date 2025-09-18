import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { eq } from 'drizzle-orm'
import { db } from '~/db'
import { orders, orderItems, addresses, products, productVariations } from '~/schema'

export const APIRoute = createAPIFileRoute('/api/orders/$orderId')({
  GET: async ({ request, params }) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
    }

    try {
      const { orderId } = params
      const orderIdNum = parseInt(orderId)

      if (isNaN(orderIdNum)) {
        return json(
          { error: 'Invalid order ID' },
          { status: 400, headers: corsHeaders }
        )
      }

      // Fetch order with all related data
      const [orderResult, itemsResult, addressesResult] = await Promise.all([
        // Get the order
        db.select().from(orders).where(eq(orders.id, orderIdNum)).limit(1),
        
        // Get order items with product data
        db.select({
          // Order item fields
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          productVariationId: orderItems.productVariationId,
          quantity: orderItems.quantity,
          unitAmount: orderItems.unitAmount,
          discountPercentage: orderItems.discountPercentage,
          finalAmount: orderItems.finalAmount,
          attributes: orderItems.attributes,
          createdAt: orderItems.createdAt,
          
          // Product fields
          product: {
            id: products.id,
            name: products.name,
            slug: products.slug,
            images: products.images,
            description: products.description,
            price: products.price,
          }
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, orderIdNum)),
        
        // Get addresses
        db.select().from(addresses).where(eq(addresses.orderId, orderIdNum))
      ])

      if (!orderResult[0]) {
        return json(
          { error: 'Order not found' },
          { status: 404, headers: corsHeaders }
        )
      }

      const order = orderResult[0]
      const items = itemsResult.map(item => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productVariationId: item.productVariationId,
        quantity: item.quantity,
        unitAmount: item.unitAmount,
        discountPercentage: item.discountPercentage,
        finalAmount: item.finalAmount,
        attributes: item.attributes ? JSON.parse(item.attributes) : {},
        createdAt: item.createdAt,
        product: item.product
      }))
      
      const orderWithRelations = {
        ...order,
        items,
        addresses: addressesResult
      }

      return json(orderWithRelations, { headers: corsHeaders })
    } catch (error) {
      console.error('Error fetching order:', error)
      return json(
        { error: 'Failed to fetch order' },
        { status: 500, headers: corsHeaders }
      )
    }
  },
}) 