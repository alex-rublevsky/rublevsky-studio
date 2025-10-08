
import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { teaCategories } from '~/schema'
import { DB } from '~/db'
import { eq } from 'drizzle-orm'
import { TeaCategoryFormData } from '~/types'

export const createTeaCategory = createServerFn({ method: 'POST' })
  .inputValidator((data: TeaCategoryFormData) => data)
  .handler(async ({ data }) => {
    try {
      const db = DB() as any
      const teaCategoryData = data

      if (!teaCategoryData.name || !teaCategoryData.slug) {
        setResponseStatus(400)
        throw new Error('Missing required fields: name and slug are required')
      }

      const existingCategory = await db
        .select({ slug: teaCategories.slug })
        .from(teaCategories)
        .where(eq(teaCategories.slug, teaCategoryData.slug))
        .limit(1)

      if (existingCategory.length > 0) {
        setResponseStatus(409)
        throw new Error('A tea category with this slug already exists')
      }

      const insertResult = await db
        .insert(teaCategories)
        .values({
          name: teaCategoryData.name,
          slug: teaCategoryData.slug,
          isActive: teaCategoryData.isActive ?? true,
        })
        .returning()

      return {
        message: 'Tea category created successfully',
        teaCategory: insertResult[0],
      }
    } catch (error) {
      console.error('Error creating tea category:', error)
      setResponseStatus(500)
      throw new Error('Failed to create tea category')
    }
  })