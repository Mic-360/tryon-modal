
interface Product {
    id: number;
    name: string;
    image: string;
    link: string;
    category: string;
}

export const Products: Product[] = [
    {
        id: 1,
        name: 'Teardrop Sparkle Diamond Hoop Earrings',
        image: '/model-base.webp',
        link: '/product/1',
        category: 'Earrings',
    },
    {
        id: 2,
        name: 'Ethereal Cage Diamond Drop Earrings',
        image: '/model-one.png',
        link: '/product/2',
        category: 'Earrings',
    },
    {
        id: 3,
        name: 'Classic Pearl Diamond Studs',
        image: '/model-base.webp',
        link: '/product/2',
        category: 'Studs',
    },
    {
        id: 4,
        name: 'Floral Diamond Drop Earrings',
        image: '/model-base.webp',
        link: '/product/2',
        category: 'Drops',
    },
];

export const Thumbnails = [
    '/model-base.webp',
    '/model-one.png',
    '/model-two.png',
]

export const InferenceParams = {
    num_inference_steps: 50,
    seed: -1,
    guidance_scale: 2.5,
}
