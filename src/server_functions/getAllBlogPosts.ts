// import { desc, eq } from "drizzle-orm";
// import db from "~/db";
// import { blogPosts, products, blogTeaCategories } from "~/schema";
// import { BlogPost } from "~/types/index";

// /**
//  * Get all blog posts with their tea categories and product images
//  * Used on the public blog page
//  */
// export default async function getAllBlogPosts(): Promise<BlogPost[]> {
//   try {
//     const results = await db
//       .select()
//       .from(blogPosts)
//       .leftJoin(products, eq(blogPosts.productSlug, products.slug))
//       .leftJoin(blogTeaCategories, eq(blogTeaCategories.blogPostId, blogPosts.id))
//       .orderBy(desc(blogPosts.publishedAt));

//     // Group results by blog post ID and collect tea categories
//     const postsWithCategories = new Map<number, { post: BlogPost; categories: Set<string> }>();

//     for (const row of results) {
//       const post = row.blog_posts;
//       const product = row.products;
//       const teaCategory = row.blog_tea_categories;

//       if (!postsWithCategories.has(post.id)) {
//         postsWithCategories.set(post.id, {
//           post: {
//             id: post.id,
//             title: post.title ?? "",
//             slug: post.slug,
//             body: post.body ?? "",
//             images: [post.images, product?.images]
//               .filter(Boolean)
//               .join(",")
//               .replace(/,+/g, ",")
//               .replace(/^,|,$/g, ""),
//             productSlug: post.productSlug ?? "",
//             publishedAt: post.publishedAt.getTime(),
//             teaCategories: []
//           },
//           categories: new Set()
//         });
//       }

//       if (teaCategory?.teaCategorySlug) {
//         postsWithCategories.get(post.id)!.categories.add(teaCategory.teaCategorySlug);
//       }
//     }

//     // Convert Sets to arrays and return the final blog posts
//     return Array.from(postsWithCategories.values()).map(({ post, categories }) => ({
//       ...post,
//       teaCategories: Array.from(categories)
//     }));
//   } catch (error) {
//     console.error("Error in getAllBlogPosts:", error);
//     return [];
//   }
// }
