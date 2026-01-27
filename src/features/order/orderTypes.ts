export enum OrderStatus {
  Created = "CREATED",
  Paid = "PAID",
  Cancelled = "CANCELLED",
  Completed = "COMPLETED",
  Refunded = "REFUNDED",
}

export interface OrderItem {
  foodItemId: number;
  foodName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDiscount {
  discountId: number;
  discountName: string;
  discountAmount: number;
}

export interface Order {
  orderId: number | null;
  userId: number | null;
  userEmail: string | null;

  subtotal: number | null;
  discountTotal: number | null;
  total: number | null;

  phoneNumber: string | null;
  address: string | null;

  orderStatus: OrderStatus | null;
  createdAt: string | null;

  items: OrderItem[] | null;
  discounts: OrderDiscount[] | null;
}
