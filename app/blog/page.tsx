import BlogPost from "@/components/ui/blogPost";

const blogPosts = [
  {
    id: "guardian-2",
    title: 'Ripe Pu\'er Ku Zhu Shan "Guardian 2.0"',
    body: `📍Ancient trees from Ku Zhu Shan Mountain, Jinggu County. 🌿Fermentation was carried out in small-volume baskets. 
    
    Aroma Creamy and nutty, with confectionery notes: burnt brownie crust, condensed milk, chocolate sponge cake, and a hint of vanilla pod. 
    
    Taste Grainy sweetness reminiscent of a "Kinder Country" bar, Neapolitan vanilla wafers, the astringency of grape seeds, a coppery tang, and the distinct flavor of Brazil nuts. The infusion is deep, smooth, and oily in texture. 
    
    Hui Gan (returning sweetness, 回甘) is pronounced — the tea starts fresh and sweet with a clean bitterness. The aftertaste lingers and evolves gradually: the bitterness recedes, the sweetness intensifies, and ultimately, the sweetness prevails over bitterness. 
    
    Effect Focuses attention, gathers the mind, and energizes the body — a perfect balance! Some deeply immersive ambient for an attentive and meditative tea ritual 🎶`,
    images: [
      "https://pub-e0cacce632b34b06ae852d50afaa9085.r2.dev/hranitel-6.jpg",
      "https://pub-e0cacce632b34b06ae852d50afaa9085.r2.dev/hranitel-3.jpg",
      "https://pub-e0cacce632b34b06ae852d50afaa9085.r2.dev/hranitel-1.jpg",
      "https://pub-e0cacce632b34b06ae852d50afaa9085.r2.dev/hranitel-2.jpg",
      "https://pub-e0cacce632b34b06ae852d50afaa9085.r2.dev/hranitel-4.jpg",
    ],
    publishedAt: "2024-01-15",
  },
  {
    id: "menghai-7542",
    title: "2005 Menghai 7542",
    body: `🍂 A classic recipe from one of the most renowned factories. This 7542 from 2005 represents the golden era of Menghai production.

    Aroma: Aged wood, leather, and dark fruits create a complex bouquet that speaks of careful aging. Hints of camphor emerge as the tea opens up.

    Taste: Smooth and well-balanced with a pronounced sweetness. Notes of aged wood, dark chocolate, and a subtle earthiness that doesn't overwhelm. The finish is clean with a pleasant mineral quality.

    Texture: Silky and full-bodied, coating the mouth without any roughness. The soup is clear and dark amber, showing its clean aging process.

    Effect: Grounding and centering, perfect for afternoon contemplation. The energy is steady and lasting, without any sharpness. 🍵✨`,
    images: [
      "https://pub-e0cacce632b34b06ae852d50afaa9085.r2.dev/hranitel-2.jpg",
      "https://pub-e0cacce632b34b06ae852d50afaa9085.r2.dev/hranitel-4.jpg",
      "https://pub-e0cacce632b34b06ae852d50afaa9085.r2.dev/hranitel-6.jpg",
    ],
    publishedAt: "2024-01-10",
  },
];

export default function Page() {
  return (
    <section className="pt-24 sm:pt-32">
      <div>
        <h1 className="text-center mb-8">What's in the gaiwan?</h1>
        <h5 className="text-center mb-16 sm:mb-24">
          <a className="blurLink" href="https://t.me/gaiwan_contents">
            🇷🇺 RU blog version
          </a>
        </h5>
      </div>

      <div className="space-y-32">
        {blogPosts.map((post) => (
          <BlogPost
            key={post.id}
            id={post.id}
            title={post.title}
            body={post.body}
            images={post.images}
            publishedAt={post.publishedAt}
          />
        ))}
      </div>
    </section>
  );
}
