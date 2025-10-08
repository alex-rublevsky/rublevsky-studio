import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { DB } from '~/db'
import {
  products,
  categories,
  teaCategories,
  productVariations,
  variationAttributes,
  productTeaCategories,
} from '~/schema'
// GET server function that mirrors the former /api/store route behavior exactly
export const getStoreData = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const db = DB() as any

    const [categoriesResult, teaCategoriesResult, productsResult] = await Promise.all([
      db.select().from(categories),
      db.select().from(teaCategories),
      db.select().from(products).where(eq((products as any).isActive, true as any)),
    ])

    if (!productsResult.length) {
      setResponseStatus(404)
      throw new Error('No products found')
    }

    const [variationsResult, teaCategoryLinksResult, attributesResult] = await Promise.all([
      db.select().from(productVariations),
      db.select().from(productTeaCategories),
      db.select().from(variationAttributes),
    ])

    const activeProductIds = new Set(productsResult.map((p: any) => p.id))
    const filteredVariations = variationsResult.filter(
      (v: any) => v.productId && activeProductIds.has(v.productId),
    )
    const filteredTeaCategoryLinks = teaCategoryLinksResult.filter((link: any) =>
      activeProductIds.has(link.productId),
    )

    const activeVariationIds = new Set(filteredVariations.map((v: any) => v.id))
    const filteredAttributes = attributesResult.filter(
      (attr: any) => attr.productVariationId && activeVariationIds.has(attr.productVariationId),
    )

    const teaCategoryMap = new Map<number, string[]>()
    filteredTeaCategoryLinks.forEach((link: any) => {
      if (!teaCategoryMap.has(link.productId)) {
        teaCategoryMap.set(link.productId, [])
      }
      teaCategoryMap.get(link.productId)!.push(link.teaCategorySlug)
    })

    const variationsByProduct = new Map<number, any[]>()
    filteredVariations.forEach((variation: any) => {
      if (variation.productId) {
        if (!variationsByProduct.has(variation.productId)) {
          variationsByProduct.set(variation.productId, [])
        }
        variationsByProduct.get(variation.productId)!.push(variation)
      }
    })

    const attributesByVariation = new Map<number, any[]>()
    filteredAttributes.forEach((attr: any) => {
      if (attr.productVariationId) {
        if (!attributesByVariation.has(attr.productVariationId)) {
          attributesByVariation.set(attr.productVariationId, [])
        }
        attributesByVariation.get(attr.productVariationId)!.push(attr)
      }
    })

    const productsArray = productsResult.map((product: any) => {
      const variations = variationsByProduct.get(product.id) || []
      const teaCategories = teaCategoryMap.get(product.id) || []

      const variationsWithAttributes = variations
        .map((variation) => ({
          ...variation,
          attributes: attributesByVariation.get(variation.id) || [],
        }))
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))

      const countryStockMap = new Map<string, number>()

      if (product.hasVariations && variationsWithAttributes.length > 0) {
        countryStockMap.clear()

        variationsWithAttributes.forEach((variation) => {
          const countryCode = variation.shippingFrom || product.shippingFrom
          if (countryCode && countryCode !== '' && countryCode !== 'NONE') {
            const variationStock = variation.stock || 0

            if (countryCode === 'CA_OR_RU') {
              const currentCAStock = countryStockMap.get('CA') || 0
              const currentRUStock = countryStockMap.get('RU') || 0
              countryStockMap.set('CA', currentCAStock + variationStock)
              countryStockMap.set('RU', currentRUStock + variationStock)
            } else {
              const currentStock = countryStockMap.get(countryCode) || 0
              countryStockMap.set(countryCode, currentStock + variationStock)
            }
          }
        })

        if (
          countryStockMap.size === 0 &&
          product.shippingFrom &&
          product.shippingFrom !== '' &&
          product.shippingFrom !== 'NONE'
        ) {
          const totalVariationStock = variationsWithAttributes.reduce(
            (sum, variation) => sum + (variation.stock || 0),
            0,
          )

          if (product.shippingFrom === 'CA_OR_RU') {
            countryStockMap.set('CA', totalVariationStock)
            countryStockMap.set('RU', totalVariationStock)
          } else {
            countryStockMap.set(product.shippingFrom, totalVariationStock)
          }
        }
      } else {
        if (product.shippingFrom && product.shippingFrom !== '' && product.shippingFrom !== 'NONE') {
          const productStock = product.stock || 0

          if (product.shippingFrom === 'CA_OR_RU') {
            countryStockMap.set('CA', productStock)
            countryStockMap.set('RU', productStock)
          } else {
            countryStockMap.set(product.shippingFrom, productStock)
          }
        }
      }

      const countryStock = Array.from(countryStockMap.entries())
        .map(([countryCode, stock]) => {
          let emoji = '🌍'
          if (countryCode === 'CA') emoji = '🇨🇦'
          else if (countryCode === 'RU') emoji = '🇷🇺'

          return { countryCode, stock, emoji }
        })
        .sort((a, b) => {
          const order = { CA: 1, RU: 2 } as const
          return (order[a.countryCode as keyof typeof order] || 99) - (order[b.countryCode as keyof typeof order] || 99)
        })

      const hasWeight = product.weight && product.weight !== '' && product.weight !== '0'
      const isSticker = product.categorySlug === 'stickers'
      const totalStock = countryStock.reduce((sum, country) => sum + country.stock, 0)

      const showInStock = hasWeight || (!product.unlimitedStock && !isSticker && totalStock > 0)

      const displayCountries = showInStock
        ? hasWeight
          ? countryStock
          : countryStock.filter((country) => country.stock > 0)
        : countryStock.length > 0
        ? countryStock
        : Array.from(countryStockMap.entries()).map(([countryCode, stock]) => {
            let emoji = '🌍'
            if (countryCode === 'CA') emoji = '🇨🇦'
            else if (countryCode === 'RU') emoji = '🇷🇺'
            return { countryCode, stock, emoji }
          })

      const stockDisplay = {
        label: showInStock ? 'In stock: ' : 'Shipping from: ',
        showValues: showInStock,
        countries: displayCountries.map((country) => ({
          ...country,
          displayValue: showInStock
            ? hasWeight
              ? `${product.weight}g`
              : country.stock > 0
              ? country.stock.toString()
              : '0'
            : null,
        })),
      }

      return {
        ...product,
        variations: variationsWithAttributes,
        teaCategories,
        stockDisplay,
      }
    })

    return {
      products: productsArray,
      categories: categoriesResult,
      teaCategories: teaCategoriesResult,
    }
  } catch (error) {
    console.error('Error fetching store data:', error)
    setResponseStatus(500)
    throw new Error('Failed to fetch store data')
  }
})