export const sampleData = {
    users: [
        {
            name: 'Admin User',
            email: 'admin@example.com',
            emailVerified: new Date(),
            image: 'https://avatars.githubusercontent.com/u/1234567',
            role: 'admin',
            password: 'hashed_password_would_go_here',
        },
        {
            name: 'Test User',
            email: 'user@example.com',
            emailVerified: new Date(),
            image: 'https://avatars.githubusercontent.com/u/7654321',
            role: 'user',
            password: 'hashed_password_would_go_here',
        },
    ],

    categories: [
        {
            name: 'Clothing',
            description: 'Fashionable apparel for all occasions',
            slug: 'clothing',
        },
        {
            name: 'Electronics',
            description: 'Latest gadgets and tech accessories',
            slug: 'electronics',
        },
        {
            name: 'Home & Kitchen',
            description: 'Essential items for your living space',
            slug: 'home-kitchen',
        },
    ],

    brands: [
        {
            name: 'Premium Brand',
            description: 'High-quality products for discerning customers',
            slug: 'premium-brand',
            logoUrl: 'https://example.com/logos/premium-brand.png',
        },
        {
            name: 'Value Brand',
            description: 'Affordable products without compromising quality',
            slug: 'value-brand',
            logoUrl: 'https://example.com/logos/value-brand.png',
        },
    ],

    products: [
        {
            name: 'Classic T-Shirt',
            description: 'A comfortable cotton t-shirt for everyday wear',
            price: 2499, // $24.99
            inventory: 100,
            slug: 'classic-t-shirt',
            images: [
                'https://example.com/images/classic-tshirt-1.jpg',
                'https://example.com/images/classic-tshirt-2.jpg',
            ],
        },
        {
            name: 'Wireless Earbuds',
            description: 'High-quality sound with noise cancellation',
            price: 12999, // $129.99
            inventory: 50,
            slug: 'wireless-earbuds',
            images: [
                'https://example.com/images/wireless-earbuds-1.jpg',
                'https://example.com/images/wireless-earbuds-2.jpg',
            ],
        },
        {
            name: 'Kitchen Knife Set',
            description: 'Professional-grade stainless steel knife set',
            price: 8999, // $89.99
            inventory: 30,
            slug: 'kitchen-knife-set',
            images: [
                'https://example.com/images/knife-set-1.jpg',
                'https://example.com/images/knife-set-2.jpg',
            ],
        },
    ]
};
