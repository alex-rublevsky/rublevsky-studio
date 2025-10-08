import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { brands } from '~/schema'
import { DB } from '~/db'

export const getAllBrands = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const db = DB() as any
      const brandsResult = await db.select().from(brands).all()

      if (!brandsResult || brandsResult.length === 0) {
        setResponseStatus(404)
        throw new Error('No brands found')
      }

      return brandsResult
    } catch (error) {
      console.error('Error fetching dashboard brands data:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch dashboard brands data')
    }
  })
