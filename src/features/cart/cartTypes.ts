
export interface CartItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    quantity: number;
}

export interface CartItemRequest {
    foodItemId: number;
    quantity: number;
}