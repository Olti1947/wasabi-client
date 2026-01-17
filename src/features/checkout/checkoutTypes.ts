import { Discount } from "../discount/discountTypes";

export interface CartItemRequest {
    foodItemId: number;
    quantity: number;
}

export interface CheckoutRequest {
    items: CartItemRequest[];
    discountId: number;
}

export interface CheckoutPreview {
    subtotal: number;
    discount: number;
    total: number;
    appliedDiscount: string;
}

export interface CheckoutState {
    availableCoupons: Discount[];
    selectedCouponId: number | null;
    preview: CheckoutPreview | null;
    loading : boolean;
    error: string | null;
}