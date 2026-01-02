import { RootState } from "@/src/store";

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartItemCount = (state: RootState): number => {
    return state.cart.items.reduce((total, item) => total + item.quantity, 0);
};

export const selectCartTotalPrice = (state: RootState): number => {
    return state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
};

