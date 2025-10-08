import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { teaCategories } from '~/schema'
import { DB } from '~/db'

export const getAllTeaCategories = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const db = DB() as any
      const teaCategoriesResult = await db.select().from(teaCategories).all()

      if (!teaCategoriesResult || teaCategoriesResult.length === 0) {
        setResponseStatus(404)
        throw new Error('No tea categories found')
      }

      return teaCategoriesResult
    } catch (error) {
      console.error('Error fetching dashboard tea categories data:', error)
      setResponseStatus(500)
      throw new Error('Failed to fetch dashboard tea categories data')
    }
  })
