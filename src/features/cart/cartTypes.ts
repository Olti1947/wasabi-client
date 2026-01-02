import { FoodItem } from "../food/foodTypes";

export interface CartItem extends FoodItem {
    quantity: number;
}