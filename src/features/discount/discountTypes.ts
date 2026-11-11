export interface Discount {
    id: number;
    title: string;
    description: string;
    type: 'PERCENTAGE' | 'FIXED';
    imageUrl: string;
    value: number;
    startsAt:string;
    endsAt:string;
    minOrderValue: number;
    stackable: boolean;
}

export interface DiscountState {
    available: Discount[];
    active: Discount[];
    selectDiscountId: number | null;
}