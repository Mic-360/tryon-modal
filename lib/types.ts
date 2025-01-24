export interface Product {
    _id: string;
    businessId: string;
    product_id: string;
    product_name: string;
    product_image: string;
    product_page: string;
    product_type: string;
    product_category: string;
    gender: string;
    created_at: string;
}

export type SiteProduct = {
    id: number;
    title: string;
    handle: string;
    body_html: string;
    published_at: string;
    created_at: string;
    updated_at: string;
    vendor: string;
    product_type: string;
    tags: string[];
    variants: Variant[];
    images: Image[];
    options: Option[];
};

type Variant = {
    id: number;
    title: string;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    sku: string;
    requires_shipping: boolean;
    taxable: boolean;
    featured_image: string | null;
    available: boolean;
    price: string;
    grams: number;
    compare_at_price: string | null;
    position: number;
    product_id: number;
    created_at: string;
    updated_at: string;
};

type Image = {
    id: number;
    created_at: string;
    position: number;
    updated_at: string;
    product_id: number;
    variant_ids: number[];
    src: string;
    width: number;
    height: number;
};

type Option = {
    name: string;
    position: number;
    values: string[];
};

export interface InferenceParams {
    num_inference_steps: number;
    seed: number;
    guidance_scale: number;
}
