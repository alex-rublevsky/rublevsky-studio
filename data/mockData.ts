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
  }
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
  }
];

// Mock Products
export const mockProducts = [
  
  {
    name: "Yin Yang Graffiti Blue",
    slug: "yin-yang-graffiti-blue",
    description: "Rublevsky studio x Abalych\n2024",
    images: JSON.stringify([
      "yin-yan-shirt-7.jpg",
      "yin-yan-shirt-6.jpg",
      "yin-yan-shirt-5.jpg",
      "yin-yan-shirt-4.jpg",
      "yin-yan-shirt-3.jpg",
      "yin-yan-shirt-2.jpg",
      "yin-yan-shirt-1.jpg",
    ]),
    price: 49.99,
    isActive: true,
    isFeatured: true,
    onSale: false,
    hasVariations: false,
    hasVolume: false,
    stock: 2,
    unlimitedStock: false,
    categorySlug: "apparel",
    brandSlug: "rublevsky-studio"
  },
  {
    name: "Ripe Pu'er Ku Zhu Shan \"Guardian 2.0\"",
    slug: "guardian-2",
    description: "Linked to blog post with the same slug",
    images: JSON.stringify([
      "hranitel-6.jpg",
      "hranitel-3.jpg",
      "hranitel-1.jpg",
      "hranitel-2.jpg",
      "hranitel-4.jpg",
    ]),
    price: 129.99,
    isActive: true,
    isFeatured: true,
    onSale: false,
    hasVariations: false,
    hasVolume: true,
    volume: "357g",
    stock: 1,
    unlimitedStock: false,
    categorySlug: "tea",
    brandSlug: "yunnan-sourcing"
  }
];

// Mock Blog Posts
export const mockBlogPosts = [
  {
    title: "Ripe Pu'er Ku Zhu Shan \"Guardian 2.0\"",
    slug: "guardian-2",
    body: `📍Ancient trees from Ku Zhu Shan Mountain, Jinggu County. 🌿Fermentation was carried out in small-volume baskets. 
    
    Aroma Creamy and nutty, with confectionery notes: burnt brownie crust, condensed milk, chocolate sponge cake, and a hint of vanilla pod. 
    
    Taste Grainy sweetness reminiscent of a "Kinder Country" bar, Neapolitan vanilla wafers, the astringency of grape seeds, a coppery tang, and the distinct flavor of Brazil nuts. The infusion is deep, smooth, and oily in texture. 
    
    Hui Gan (returning sweetness, 回甘) is pronounced — the tea starts fresh and sweet with a clean bitterness. The aftertaste lingers and evolves gradually: the bitterness recedes, the sweetness intensifies, and ultimately, the sweetness prevails over bitterness. 
    
    Effect Focuses attention, gathers the mind, and energizes the body — a perfect balance! Some deeply immersive ambient for an attentive and meditative tea ritual 🎶`,
    images: JSON.stringify([
      "hranitel-6.jpg",
      "hranitel-3.jpg",
      "hranitel-1.jpg",
      "hranitel-2.jpg",
      "hranitel-4.jpg",
    ]),
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
    images: JSON.stringify(["hranitel-2.jpg", "hranitel-4.jpg", "hranitel-6.jpg"]),
    publishedAt: "2024-01-10",
    productSlug: null,
  },
]; 