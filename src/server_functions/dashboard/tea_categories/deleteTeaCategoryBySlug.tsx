import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { teaCategories } from '~/schema'
import { DB } from '~/db'
import { eq } from 'drizzle-orm'

export const deleteTeaCategoryBySlug = createServerFn({ method: 'POST' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = DB() as any
      const { slug } = data

      console.log('Deleting tea category with slug:', slug)

      // Check if category exists
      const existingCategory = await db
        .select()
        .from(teaCategories)
        .where(eq(teaCategories.slug, slug))
        .limit(1)

      if (existingCategory.length === 0) {
        setResponseStatus(404)
        throw new Error('Tea category not found')
      }

      // Delete the tea category (this will cascade delete related records due to foreign key constraints)
      await db
        .delete(teaCategories)
        .where(eq(teaCategories.slug, slug))

      return {
        message: 'Tea category deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting tea category:', error)
      setResponseStatus(500)
      throw new Error('Failed to delete tea category')
    }
  })
