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

export interface InferenceParams {
    num_inference_steps: number;
    seed: number;
    guidance_scale: number;
}
