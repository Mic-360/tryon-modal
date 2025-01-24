import type { Product, InferenceParams, SiteProduct } from './types';

const API_BASE_URL = 'https://twinverses.in/api/v1/business';
const API_KEY = 'ece3f635-7537-47da-ad58-0f4b262f73aa';

export async function fetchSiteProductImages() {
    const response = await fetch('https://shopatnude.com/collections/all/products.json');
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    const { products } = await response.json();

    products.forEach((product: SiteProduct) => {
        if (product.product_type === '') {
            product.product_type = 'combos & trousers';
        }
    });

    return products;
}

export async function fetchProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`, {
        headers: {
            'X-API-KEY': API_KEY,
            'Access-Control-Allow-Origin': '*',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
}

export async function sendImageToServer(
    clothImage: string,
    personImage: string,
    clothType: string,
    inferenceParams: InferenceParams
): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/tryon`, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': API_KEY,
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            clothImage,
            personImage,
            clothType,
            ...inferenceParams,
        }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return `data:image/png;base64,${data['result'].slice(2, -1)}`;
}
