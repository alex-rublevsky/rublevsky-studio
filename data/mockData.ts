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
    hasVolume: false,
    stock: 0,
    unlimitedStock: false,
    categorySlug: "stickers",
    brandSlug: "rublevsky-studio",
    variations: JSON.stringify([
      {
        sku: "squirrel-sticker-6x6",
        name: "6x6",
        price: 3.00,
        stock: 50,
        sort: 0,
        attributes: [
          {
            name: "Size cm",
            value: "6x6"
          }
        ]
      },
      {
        sku: "squirrel-sticker-8x8",
        name: "8x8",
        price: 3.00,
        stock: 50,
        sort: 1,
        attributes: [
          {
            name: "Size cm",
            value: "8x8"
          }
        ]
      },
      {
        sku: "squirrel-sticker-10x10",
        name: "10x10",
        price: 3.00,
        stock: 50,
        sort: 2,
        attributes: [
          {
            name: "Size cm",
            value: "10x10"
          }
        ]
      },
      {
        sku: "squirrel-sticker-12x12",
        name: "12x12",
        price: 3.00,
        stock: 50,
        sort: 3,
        attributes: [
          {
            name: "Size cm",
            value: "12x12"
          }
        ]
      },
      {
        sku: "squirrel-sticker-14x14",
        name: "14x14",
        price: 3.00,
        stock: 50,
        sort: 4,
        attributes: [
          {
            name: "Size cm",
            value: "14x14"
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
    hasVolume: false,
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
            name: "color",
            value: "Blue"
          },
          {
            name: "size",
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
            name: "color",
            value: "Red"
          },
          {
            name: "size",
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
    productSlug: "purple-yue-guang-bai-2023",
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
    productSlug: "lincang-arbor-gong-ting-ripe-puer-2009-spring",
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
]; 