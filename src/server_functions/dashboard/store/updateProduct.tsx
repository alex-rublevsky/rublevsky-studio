import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { DB } from '~/db'
import {
  products,
  productVariations,
  variationAttributes,
  productTeaCategories,
} from '~/schema'
import { ProductFormData } from '~/types'

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; data: ProductFormData }) => data)
  .handler(async ({ data }) => {
    try {
      const db = DB() as any
      const { id: productId, data: productData } = data

      if (isNaN(productId)) {
        setResponseStatus(400)
        throw new Error('Invalid product ID')
      }

      if (!productData.name || !productData.slug || !productData.price) {
        setResponseStatus(400)
        throw new Error('Missing required fields: name, slug, and price are required')
      }

      // Fetch existing product and check for duplicate slug
      const [existingProduct, duplicateSlug] = await Promise.all([
        db.select().from(products).where(eq(products.id, productId)).limit(1),
        db
          .select()
          .from(products)
          .where(eq(products.slug, productData.slug))
          .limit(1),
      ])

      if (!existingProduct[0]) {
        setResponseStatus(404)
        throw new Error('Product not found')
      }

      if (duplicateSlug[0] && duplicateSlug[0].id !== productId) {
        setResponseStatus(400)
        throw new Error('A product with this slug already exists')
      }

      // Process images
      const imageString =
        productData.images?.trim() || existingProduct[0].images || ''

      // Update product and related data
      await Promise.all([
        // Update main product
        db
          .update(products)
          .set({
            name: productData.name,
            slug: productData.slug,
            description: productData.description || null,
            price: parseFloat(productData.price),
            categorySlug: productData.categorySlug || null,
            brandSlug: productData.brandSlug || null,
            stock: parseInt(productData.stock),
            isActive: productData.isActive,
            isFeatured: productData.isFeatured,
            discount: productData.discount || null,
            hasVariations: productData.hasVariations,
            weight: productData.weight || null,
            images: imageString,
            shippingFrom: productData.shippingFrom || null,
          })
          .where(eq(products.id, productId)),

        // Handle tea categories
        (async () => {
          await db
            .delete(productTeaCategories)
            .where(eq(productTeaCategories.productId, productId))

          if (productData.teaCategories?.length) {
            await db.insert(productTeaCategories).values(
              productData.teaCategories.map((slug) => ({
                productId: productId,
                teaCategorySlug: slug,
              }))
            )
          }
        })(),

        // Handle variations
        (async () => {
          if (productData.hasVariations && productData.variations?.length) {
            // Get all existing variations for this product
            const existingVariations = await db
              .select()
              .from(productVariations)
              .where(eq(productVariations.productId, productId))

            // Delete old variations and their attributes
            if (existingVariations.length > 0) {
              // Delete variation attributes for all variations
              for (const variation of existingVariations) {
                await db
                  .delete(variationAttributes)
                  .where(
                    eq(variationAttributes.productVariationId, variation.id)
                  )
              }

              // Delete variations
              await db
                .delete(productVariations)
                .where(eq(productVariations.productId, productId))
            }

            // Insert new variations and get their IDs
            const insertedVariations = await db
              .insert(productVariations)
              .values(
                productData.variations.map((v) => ({
                  productId: productId,
                  sku: v.sku,
                  price: parseFloat(v.price.toString()),
                  stock: parseInt(v.stock.toString()),
                  sort: v.sort || 0,
                  discount: v.discount ? parseInt(v.discount.toString()) : null,
                  shippingFrom: v.shippingFrom || null,
                  createdAt: new Date(),
                }))
              )
              .returning()

            // Insert variation attributes if they exist
            const attributesToInsert = productData.variations.flatMap(
              (variation, index) => {
                const insertedVariation = insertedVariations[index]
                return (
                  variation.attributes?.map((attr) => ({
                    productVariationId: insertedVariation.id,
                    attributeId: attr.attributeId,
                    value: attr.value,
                    createdAt: new Date(),
                  })) || []
                )
              }
            )

            if (attributesToInsert.length > 0) {
              await db.insert(variationAttributes).values(attributesToInsert)
            }
          } else {
            // If no variations, clean up any existing ones
            const existingVariations = await db
              .select()
              .from(productVariations)
              .where(eq(productVariations.productId, productId))

            if (existingVariations.length > 0) {
              // Delete variation attributes for all variations
              for (const variation of existingVariations) {
                await db
                  .delete(variationAttributes)
                  .where(
                    eq(variationAttributes.productVariationId, variation.id)
                  )
              }

              await db
                .delete(productVariations)
                .where(eq(productVariations.productId, productId))
            }
          }
        })(),
      ])

      // Fetch and return updated product
      const updatedProduct = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1)

      return {
        message: 'Product updated successfully',
        product: updatedProduct[0],
      }
    } catch (error) {
      console.error('Error updating product:', error)
      setResponseStatus(500)
      throw new Error('Failed to update product')
    }
  })