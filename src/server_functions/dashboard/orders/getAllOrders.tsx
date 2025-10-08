import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { orders } from '~/schema'
import { DB } from '~/db'

export const getAllOrders = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const db = DB() as any
      const ordersResult = await db.select().from(orders).all()

      if (!ordersResult || ordersResult.length === 0) {
        setResponseStatus(404)
        throw new Error('No orders found')
      }

      return ordersResult
    } catch (error) {
      console.error('Error fetching dashboard orders data:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch dashboard orders data')
    }
  })