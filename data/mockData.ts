// Mock Categories
export const mockCategories = [
  {
    name: "Apparel",
    slug: "apparel",
    isActive: true,
  },
  {
    name: "Stickers",
    slug: "stickers",
    isActive: true,
  },
  {
    name: "Tea",
    slug: "tea",
    isActive: true,
  },
  {
    name: "Produce",
    slug: "produce",
    isActive: true,
  },
  {
    name: "Posters",
    slug: "posters",
    isActive: true,
  },
];

// Mock Brands
export const mockBrands = [
  {
    name: "Rublevsky Studio",
    slug: "rublevsky-studio",
    isActive: true,
  },
  {
    name: "Yunnan Sourcing",
    slug: "yunnan-sourcing",
    isActive: true,
  },
  {
    name: "Abalych",
    slug: "abalych",
    isActive: true,
  }
];

// Mock Products
export const mockProducts = [
  {
    name: "Squirrel Sticker",
    slug: "squirrel-sticker",
    description: "Cute and awesome, I have nothing else to say...",
    images: "squirrel-sticker.jpg, squirrel-sticker-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "squirrel-sticker-6x6",
        name: "6x6",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x6"
          }
        ]
      },
      {
        sku: "squirrel-sticker-8x8",
        name: "8x8",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x8"
          }
        ]
      },
      {
        sku: "squirrel-sticker-10x10",
        name: "10x10",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x10"
          }
        ]
      },
      {
        sku: "squirrel-sticker-12x12",
        name: "12x12",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x12"
          }
        ]
      },
      {
        sku: "squirrel-sticker-14x14",
        name: "14x14",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x14"
          }
        ]
      }
    ])
  },
  {
    name: "Mushroom Girl Sticker",
    slug: "mushroom-girl-sticker",
    description: "Mycelium!",
    images: "devochka.jpg, devochka-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "mushroom-girl-sticker-6x8-4",
        name: "6x8.4",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x8.4"
          }
        ]
      },
      {
        sku: "mushroom-girl-sticker-6x11-3",
        name: "6x11.3",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x11.3"
          }
        ]
      },
      {
        sku: "mushroom-girl-sticker-10x14-1",
        name: "10x14.1",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x14.1"
          }
        ]
      },
      {
        sku: "mushroom-girl-sticker-12x16-9",
        name: "12x16.9",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x16.9"
          }
        ]
      },
      {
        sku: "mushroom-girl-sticker-14x19-7",
        name: "14x19.7",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x19.7"
          }
        ]
      }
    ])
  },
  {
    name: "Shroom Brain Sticker",
    slug: "shroom-brain-sticker",
    description: "Psychedelic experience",
    images: "shroom-brain.jpg, shroom-brain-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "shroom-brain-sticker-6x8-4",
        name: "6x8.4",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x8.4"
          }
        ]
      },
      {
        sku: "shroom-brain-sticker-8x11-2",
        name: "8x11.2",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x11.2"
          }
        ]
      },
      {
        sku: "shroom-brain-sticker-10x14-1",
        name: "10x14.1",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x14.1"
          }
        ]
      },
      {
        sku: "shroom-brain-sticker-12x16-9",
        name: "12x16.9",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x16.9"
          }
        ]
      },
      {
        sku: "shroom-brain-sticker-14x19-7",
        name: "14x19.7",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x19.7"
          }
        ]
      }
    ])
  },
  {
    name: "Swirl Sticker",
    slug: "swirl-sticker",
    description: "Interconnected interaction",
    images: "triple-person-swirl.jpg, triple-person-swirl-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "swirl-sticker-6x6-1",
        name: "6x6.1",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x6.1"
          }
        ]
      },
      {
        sku: "swirl-sticker-8x8-2",
        name: "8x8.2",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x8.2"
          }
        ]
      },
      {
        sku: "swirl-sticker-10x10-2",
        name: "10x10.2",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x10.2"
          }
        ]
      },
      {
        sku: "swirl-sticker-12x12-3",
        name: "12x12.3",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x12.3"
          }
        ]
      },
      {
        sku: "swirl-sticker-14x14-3",
        name: "14x14.3",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x14.3"
          }
        ]
      }
    ])
  },
  {
    name: "Leaf Sticker",
    slug: "leaf-sticker",
    description: "Photosynthesis :)",
    images: "leaf.jpg, leaf-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "leaf-sticker-6x6-6",
        name: "6x6.6",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x6.6"
          }
        ]
      },
      {
        sku: "leaf-sticker-8x8-7",
        name: "8x8.7",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x8.7"
          }
        ]
      },
      {
        sku: "leaf-sticker-10x11",
        name: "10x11",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x11"
          }
        ]
      },
      {
        sku: "leaf-sticker-12x13-1",
        name: "12x13.1",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x13.1"
          }
        ]
      },
      {
        sku: "leaf-sticker-14x15-3",
        name: "14x15.3",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x15.3"
          }
        ]
      }
    ])
  },
  {
    name: "Shroom Sticker",
    slug: "shroom-sticker",
    description: "The only way our is through!",
    images: "shroom.jpg, shroom-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "shroom-sticker-6x8-4",
        name: "6x8.4",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x8.4"
          }
        ]
      },
      {
        sku: "shroom-sticker-8x11-2",
        name: "8x11.2",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x11.2"
          }
        ]
      },
      {
        sku: "shroom-sticker-10x14",
        name: "10x14",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x14"
          }
        ]
      },
      {
        sku: "shroom-sticker-12x16-9",
        name: "12x16.9",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x16.9"
          }
        ]
      },
      {
        sku: "shroom-sticker-14x19-7",
        name: "14x19.7",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x19.7"
          }
        ]
      }
    ])
  },
  {
    name: "Graffiti Bark Sticker 2.0",
    slug: "graffiti-bark-sticker-2",
    description: "Fractal x Streets",
    images: "graffiti-bark-abalych-second.jpg, graffiti-bark-abalych-second-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "abalych",
    variations: JSON.stringify([
      {
        sku: "graffiti-bark-sticker-2-6x6",
        name: "6x6",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x6"
          }
        ]
      },
      {
        sku: "graffiti-bark-sticker-2-8x8",
        name: "8x8",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x8"
          }
        ]
      },
      {
        sku: "graffiti-bark-sticker-2-10x10",
        name: "10x10",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x10"
          }
        ]
      },
      {
        sku: "graffiti-bark-sticker-2-12x12",
        name: "12x12",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x12"
          }
        ]
      },
      {
        sku: "graffiti-bark-sticker-2-14x14",
        name: "14x14",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x14"
          }
        ]
      }
    ])
  },
  {
    name: "Graffiti Bark Sticker 1.0",
    slug: "graffiti-bark-sticker-1",
    description: "Fractal x Streets",
    images: "graffiti-bark-abalych-1.jpg, graffiti-bark-abalych-1-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "abalych",
    variations: JSON.stringify([
      {
        sku: "graffiti-bark-sticker-1-6x6",
        name: "6x6",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x6"
          }
        ]
      },
      {
        sku: "graffiti-bark-sticker-1-8x8",
        name: "8x8",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x8"
          }
        ]
      },
      {
        sku: "graffiti-bark-sticker-1-10x10",
        name: "10x10",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x10"
          }
        ]
      },
      {
        sku: "graffiti-bark-sticker-1-12x12",
        name: "12x12",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x12"
          }
        ]
      },
      {
        sku: "graffiti-bark-sticker-1-14x14",
        name: "14x14",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x14"
          }
        ]
      }
    ])
  },
  {
    name: "Yin Yang",
    slug: "yin-yang-sticker",
    description: "Eternally balanced, at peace",
    images: "yinyan.jpg, yinyan-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "yin-yang-sticker-6x6",
        name: "6x6",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x6"
          }
        ]
      },
      {
        sku: "yin-yang-sticker-8x8",
        name: "8x8",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x8"
          }
        ]
      },
      {
        sku: "yin-yang-sticker-10x10",
        name: "10x10",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x10"
          }
        ]
      },
      {
        sku: "yin-yang-sticker-12x12",
        name: "12x12",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x12"
          }
        ]
      },
      {
        sku: "yin-yang-sticker-14x14",
        name: "14x14",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x14"
          }
        ]
      }
    ])
  },
  {
    name: "God Nature Art Peace & Hip Hop Sticker",
    slug: "god-nature-art-peace-hip-hop-sticker",
    description: "Творчество говорит само за себя, если бы я могла это описать — я бы не сделала стикос.\n— Abalych",
    images: "hiphop1.jpg, hiphop2.jpg, hiphop-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "abalych",
    variations: JSON.stringify([
      {
        sku: "god-nature-art-peace-hip-hop-sticker-6x8-1",
        name: "6x8.1",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x8.1"
          }
        ]
      },
      {
        sku: "god-nature-art-peace-hip-hop-sticker-8x10-8",
        name: "8x10.8",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x10.8"
          }
        ]
      },
      {
        sku: "god-nature-art-peace-hip-hop-sticker-10x13-5",
        name: "10x13.5",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x13.5"
          }
        ]
      },
      {
        sku: "god-nature-art-peace-hip-hop-sticker-12x16-2",
        name: "12x16.2",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x16.2"
          }
        ]
      },
      {
        sku: "god-nature-art-peace-hip-hop-sticker-14x19",
        name: "14x19",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x19"
          }
        ]
      }
    ])
  },
  {
    name: "Yin Yang Graffiti Blue",
    slug: "yin-yang-graffiti",
    description: "Rublevsky studio x Abalych\n2024",
    images: "yin-yan-shirt-7.jpg, yin-yan-shirt-6.jpg, yin-yan-shirt-5.jpg, yin-yan-shirt-4.jpg, yin-yan-shirt-3.jpg, yin-yan-shirt-2.jpg, yin-yan-shirt-1.jpg",
    price: 49.99,
    isActive: true,
    isFeatured: true,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: false,
    categorySlug: "apparel",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "yin-yang-graffiti-blue-xl",
        name: "Blue / XL",
        price: 49.99,
        stock: 2,
        sort: 0,
        attributes: [
          {
            attributeId: "COLOR",
            value: "Blue"
          },
          {
            attributeId: "APPAREL_TYPE",
            value: "XL"
          }
        ]
      },
      {
        sku: "yin-yang-graffiti-red-xxl",
        name: "Red / XXL",
        price: 49.99,
        stock: 1,
        sort: 1,
        attributes: [
          {
            attributeId: "COLOR",
            value: "Red"
          },
          {
            attributeId: "APPAREL_TYPE",
            value: "XXL"
          }
        ]
      }
    ])
  },
  {
    name: "Ripe Pu'er Ku Zhu Shan \"Guardian 2.0\"",
    slug: "guardian-2",
    description: "Linked to blog post with the same slug",
    images: "hranitel-6.jpg, hranitel-3.jpg, hranitel-1.jpg, hranitel-2.jpg, hranitel-4.jpg",
    price: 129.99,
    isActive: true,
    isFeatured: true,
    onSale: false,
    hasVariations: true,
    hasWeight: true,
    weight: "300",
    stock: 0,
    unlimitedStock: false,
    categorySlug: "tea",
    brandSlug: "yunnan-sourcing",
    variations: JSON.stringify([
      {
        sku: "guardian-2-25g",
        name: "25g",
        price: 12.99,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "WEIGHT_G",
            value: "25"
          }
        ]
      },
      {
        sku: "guardian-2-50g",
        name: "50g",
        price: 24.99,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "WEIGHT_G",
            value: "50"
          }
        ]
      },
      {
        sku: "guardian-2-100g",
        name: "100g",
        price: 44.99,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "WEIGHT_G",
            value: "100"
          }
        ]
      },
      {
        sku: "guardian-2-150g",
        name: "150g",
        price: 64.99,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "WEIGHT_G",
            value: "150"
          }
        ]
      }
    ])
  },
  {
    name: "Skateboard Cat Sticker",
    slug: "skateboard-cat-sticker",
    description: "cool af!",
    images: "skateboard-cat-sticker-1.jpg, skateboard-cat-preview.jpg",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "skateboard-cat-sticker-6x4-3",
        name: "6x4.3",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x4.3"
          }
        ]
      },
      {
        sku: "skateboard-cat-sticker-8x5-7",
        name: "8x5.7",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x5.7"
          }
        ]
      },
      {
        sku: "skateboard-cat-sticker-10x7-1",
        name: "10x7.1",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x7.1"
          }
        ]
      },
      {
        sku: "skateboard-cat-sticker-12x8-6",
        name: "12x8.6",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x8.6"
          }
        ]
      },
      {
        sku: "skateboard-cat-sticker-14x10",
        name: "14x10",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x10"
          }
        ]
      }
    ])
  },
  {
    name: "Birch Sticker",
    slug: "birch-sticker",
    description: "Illegal eternity",
    images: "birch.jpg, birch-preview.JPG",
    price: 3.00,
    isActive: true,
    isFeatured: false,
    onSale: false,
    hasVariations: true,
    hasWeight: false,
    stock: 0,
    unlimitedStock: true,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "birch-sticker-6x8",
        name: "6x8",
        price: 3.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "6x8"
          }
        ]
      },
      {
        sku: "birch-sticker-8x10-6",
        name: "8x10.6",
        price: 4.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "8x10.6"
          }
        ]
      },
      {
        sku: "birch-sticker-10x13-3",
        name: "10x13.3",
        price: 4.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "10x13.3"
          }
        ]
      },
      {
        sku: "birch-sticker-12x16",
        name: "12x16",
        price: 5.00,
        stock: 0,
        sort: 3,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "12x16"
          }
        ]
      },
      {
        sku: "birch-sticker-14x18-6",
        name: "14x18.6",
        price: 5.00,
        stock: 0,
        sort: 4,
        attributes: [
          {
            attributeId: "SIZE_CM",
            value: "14x18.6"
          }
        ]
      }
    ])
  },
  {
    name: "Shu Pu'er \"Black Cat\", Ailao Shan, 70 year old trees, 2022",
    slug: "black-cat-puer",
    description: "Linked to blog post with the same slug",
    images: "black-cat-47-1.jpg, black-cat-26-1.jpg, black-cat-7.jpg, black-cat-18-1.jpg,black-cat-7.jpg, black-cat-6.jpg, black-cat-5.jpg",
    price: 30.00,
    isActive: true,
    isFeatured: true,
    onSale: false,
    hasVariations: true,
    hasWeight: true,
    weight: "100",
    stock: 0,
    unlimitedStock: false,
    categorySlug: "tea",
    brandSlug: "yunnan-sourcing",
    variations: JSON.stringify([
      {
        sku: "black-cat-puer-50g",
        name: "50g",
        price: 17.00,
        stock: 0,
        sort: 0,
        attributes: [
          {
            attributeId: "WEIGHT_G",
            value: "50"
          }
        ]
      },
      {
        sku: "black-cat-puer-75g",
        name: "75g",
        price: 23.00,
        stock: 0,
        sort: 1,
        attributes: [
          {
            attributeId: "WEIGHT_G",
            value: "75"
          }
        ]
      },
      {
        sku: "black-cat-puer-100g",
        name: "100g",
        price: 30.00,
        stock: 0,
        sort: 2,
        attributes: [
          {
            attributeId: "WEIGHT_G",
            value: "100"
          }
        ]
      }
    ])
  },
];

// Mock Blog Posts
export const mockBlogPosts = [
  {
    title: "Zheng Shan Xiao Zhong",
    slug: "zheng-shan-xiao-zhong",
    body: `Yesterday, we tried a couple of interesting teas with the guys 🌟 One of them was Zheng Shan Xiao Zhong (正山小种) 'sweet potato'. It is classified as a red tea (which we call black tea in the West).

It's a late-April harvest from the Wu Yi Mountains area (elevation 500–550 meters) in the northern part of Fujian Province.

History

The name of the tea translates to 'tea from the right mountains,' which relates to the period after the Opium Wars in the early 20th century. External capital flowed into China, intensifying competition, including in the tea industry. Many new types of tea appeared, including red teas that were not authentic Xiao Zhong. To protect the trademark and quality, the real Xiao Zhong was called Zheng Shan, meaning 'true', while teas similar to it, harvested from surrounding mountains, were called Wai Shan Cha (外山茶), meaning 'tea from the outer mountains.'

It's worth noting that in today's Chinese tea market, the issue of substituting real Xiao Zhong with a similar tea from 'outer mountains' remains unchanged. This can be said about almost any quality material.

This tea is the #1 red tea in China and the oldest variety of Chinese tea overall!

Methodology

When preparing Xiao Zhong, the tea leaves are smoked over pine needles or wood, which is the main reason for the rich and distinctive aroma of this tea. The pine trees grow alongside the tea in Wu Yi Shan, Fujian Province.

Organoleptics 🐽

The dry leaves mesmerize with a bright aroma of coffee beans and the pastry "sweet potato." When warmed, it releases a dark hot chocolate, rye bread, and a wealth of sweet raisin notes like those found in Easter cake. In the wet leaves, the rye aroma intensifies, and the raisins take on a slightly fermented quality, like in kvass. After steaming, delicate baked notes and an oyster shell mineral quality emerge.

The taste carries all the above descriptors, with rye bread and a generous amount of raisins standing out the most.`,
    images: "blog-images/Sweet Potato Zheng Shan Xiao Zhong Black Tea spring 2024-1.jpg, Sweet Potato Zheng Shan Xiao Zhong Black Tea spring 2024-2.jpg",
    publishedAt: "2024-12-24",
    productSlug: null,
  },
  {
    title: "White Bunny, the Hopper! 🐇",
    slug: "white-bunny-the-hopper",
    body: `This white tea is crafted from material harvested in a 1:1 ratio (leaf and bud) from wild purple tea trees (ye sheng cha) growing in the Mangshi County, Dehong Prefecture. The harvest took place in April 2023.

The leaves are processed using the ye guang bai method: the raw material is slightly wilted and then placed in a long tunnel with air circulation, where the oxidation process gradually halts.

What's this bunny like? 🐰

The dry leaves greet you with sweet notes of green gooseberry, hematogen, and lingonberry. But once steamed, they unveil bright aromas of chocolate candy with hazelnut, white currants, and top notes of birch twigs and cinnamon.

The taste combines the tartness of currant leaves with the tang of pineapple rind and the sweetness of cane juice. In the mouth, the tea feels quenching, mineral, and hydrating, like a sip of coconut water enhanced with the creamy richness of coconut pulp. The aftertaste distinctly reveals marzipan and the sweetness of macadamia nuts. With subsequent infusions, flavors of candied lime zest, Golden Delicious apples, lemongrass, and yellow dandelion flowers emerge.

Tea effect (cha qi):

The experience is meditative yet energizing, inspiring movement and creativity.`,
    images: "purple-yue-guan-bai-2023-1.jpg, purple-yue-guan-bai-2023-2.jpg, purple-yue-guan-bai-2023-3.jpg, purple-yue-guan-bai-2023-4.jpg, purple-yue-guan-bai-2023-5.jpg",
    publishedAt: "2024-12-21",
    productSlug: null,
  },
  {
    title: "Lincang Arbor Gong Ting Ripe Pu'er 2009 Spring",
    slug: "lincang-arbor-gong-ting-ripe-puer-2009",
    body: `Today's spotlight is on the 2009 spring harvest Gong Ting from Lincang Arbor, pressed in 2011. 🍃

The warmed leaf transports to an old farm hayloft with a faint note of manure in the distance. The steamed leaf in the top notes envelops aromas of rawhide, rye bread and rich iodine. The lower notes reveal baked apples, Westphalian bread, walnuts and varnished wood reminiscent of country house furniture.

On the palate, oak bark and a slight bitterness of apple pith come to the fore, complemented by a spicy cinnamon accent. The complete absence of sweetness emphasizes the austerity and character of the drink. The mouthfeel is reminiscent of the texture of natural cocoa powder, harmonizing with a slight butteriness, but without any pronounced drinkability.

Gunthinchik classically gives off an ultra-fast leaf extraction, but this copy surprises with its armor-piercing resistance to spills! 🦣`,
    images: "Man-Tang-Hong-Gong-Ting-2011-1.jpg, Man-Tang-Hong-Gong-Ting-2011-2.jpg, Man-Tang-Hong-Gong-Ting-2011-3.jpg, Man-Tang-Hong-Gong-Ting-2011-4.jpg, Man-Tang-Hong-Gong-Ting-2011-5.jpg, Man-Tang-Hong-Gong-Ting-2011-6.jpg",
    publishedAt: "2024-12-19",
    productSlug: null,
  },
  {
    title: "Greetings!",
    slug: "greetings",
    body: `My name is Alexander, but my friends call me gaiwan 🦣

The purpose of this blog is to share the diverse manifestations of Chinese tea, as well as an educational base for an in-depth understanding of it.

I discovered the tea world in 2021, and began conducting ceremonies this year.

I was hooked by the phenomenon's limitless spectrum of flavors and aromas, where the final product is shaped by a myriad of variables. Among them: the location and altitude of the Camellia sinensis (tea tree), its age, cultivar, season, year and batch of harvest, as well as the choice of the part of the plant: leaf, bud or cuttings. Equally important is the processing of the raw material: every tiny detail, from the roasting temperature to the type of fermentation, forms the unique categories of Chinese tea, each of which would take more than a lifetime to study....`,
    images: "me.jpg",
    publishedAt: "2024-12-19",
    productSlug: null,
  },
  {
    title: "Ripe Pu'er Ku Zhu Shan \"Guardian 2.0\"",
    slug: "guardian-2",
    body: `📍Ancient trees from Ku Zhu Shan Mountain, Jinggu County. 🌿Fermentation was carried out in small-volume baskets. 
    
    Aroma Creamy and nutty, with confectionery notes: burnt brownie crust, condensed milk, chocolate sponge cake, and a hint of vanilla pod. 
    
    Taste Grainy sweetness reminiscent of a "Kinder Country" bar, Neapolitan vanilla wafers, the astringency of grape seeds, a coppery tang, and the distinct flavor of Brazil nuts. The infusion is deep, smooth, and oily in texture. 
    
    Hui Gan (returning sweetness, 回甘) is pronounced — the tea starts fresh and sweet with a clean bitterness. The aftertaste lingers and evolves gradually: the bitterness recedes, the sweetness intensifies, and ultimately, the sweetness prevails over bitterness. 
    
    Effect Focuses attention, gathers the mind, and energizes the body — a perfect balance! Some deeply immersive ambient for an attentive and meditative tea ritual 🎶`,
    images: "",
    publishedAt: "2024-01-15",
    productSlug: "guardian-2",
  },
  {
    title: "2005 Menghai 7542",
    slug: "menghai-7542",
    body: `🍂 A classic recipe from one of the most renowned factories. This 7542 from 2005 represents the golden era of Menghai production.

    Aroma: Aged wood, leather, and dark fruits create a complex bouquet that speaks of careful aging. Hints of camphor emerge as the tea opens up.

    Taste: Smooth and well-balanced with a pronounced sweetness. Notes of aged wood, dark chocolate, and a subtle earthiness that doesn't overwhelm. The finish is clean with a pleasant mineral quality.

    Texture: Silky and full-bodied, coating the mouth without any roughness. The soup is clear and dark amber, showing its clean aging process.

    Effect: Grounding and centering, perfect for afternoon contemplation. The energy is steady and lasting, without any sharpness. 🍵✨`,
    images: "hranitel-2.jpg, hranitel-4.jpg, hranitel-6.jpg",
    publishedAt: "2024-01-10",
    productSlug: null,
  },
  {
    title: "Shu Pu-erh \"Black Cat\" 🐈‍⬛",
    slug: "black-cat-puer",
    body: `🌿 Harvested in 2022 from 70-year-old trees on Ai Lao Mountain, Pu'er Prefecture, Menghai County, Xishuangbanna. After a year of aging, it was pressed in September 2023.

Aroma
Hot leaves: a sweetish scent with notes of tree bark, hazelnut, subtle spice, and minerality.

Wet leaves: hematogen, milk chocolate with caramel, cocoa beans.

Taste
Full-bodied and oily, velvety, slightly metallic, creamy, and pastry-like. Pronounced sweetness, particularly toffee and powdered sugar.

Effect
Energizing, sharpens focus for a productive mindset.

A cat in a cup—this tea is all about a grin from ear to ear with the first sip, a rich extraction even with less leaf, and a first-class awakening from deep sleep. 🥱

Musical pairing — Falling in Love with the cat . 💃`,
    images: "black-cat-47-1.jpg, black-cat-26-1.jpg, black-cat-7.jpg",
    publishedAt: "2025-02-25",
    productSlug: "black-cat-puer",
  },
]; 