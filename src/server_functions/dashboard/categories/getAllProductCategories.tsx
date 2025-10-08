import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { categories } from '~/schema'
import { DB } from '~/db'

export const getAllProductCategories = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const db = DB() as any
      const categoriesResult = await db.select().from(categories).all()

      if (!categoriesResult || categoriesResult.length === 0) {
        setResponseStatus(404)
        throw new Error('No categories found')
      }

      return categoriesResult
    } catch (error) {
      console.error('Error fetching dashboard categories data:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch dashboard categories data')
    }
  })