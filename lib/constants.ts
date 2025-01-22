interface Product {
    id: string;
    name: string;
    image: string;
    link: string;
    category: string;
}

export const Products: Product[] = [
    {
        id: '1',
        name: 'Teardrop Sparkle Diamond Hoop Earrings',
        image: '/model-base.jpg',
        link: '/product/1',
        category: 'Earrings',
    },
    {
        id: '2',
        name: 'Ethereal Cage Diamond Drop Earrings',
        image: '/model-one.jpg',
        link: '/product/2',
        category: 'Earrings',
    },
    {
        id: '3',
        name: 'Classic Pearl Diamond Studs',
        image: '/model-base.jpg',
        link: '/product/2',
        category: 'Studs',
    },
    {
        id: '4',
        name: 'Floral Diamond Drop Earrings',
        image: '/model-base.jpg',
        link: '/product/2',
        category: 'Drops',
    },
];

export const Thumbnails = [
    '/model-base.jpg',
    '/model-one.png',
    '/model-two.png',
    '/model-three.png',
]

export const InferenceParams = {
    num_inference_steps: 50,
    seed: -1,
    guidance_scale: 2.5,
}

export const fadeInVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};
