import { createSlice } from "@reduxjs/toolkit";
import { CartItem } from "./cartTypes";

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [] as CartItem[]
    },
    reducers: {
        addToCart(state, action) {
            const { id, name, description, price, imageUrl, quantity } = action.payload;
            const existingItem = state.items.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ id, name, description, price, imageUrl, quantity });
            }
        },
        updateCartItemQuantity(state, action) {
            const { id, quantity } = action.payload;
            const existingItem = state.items.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity = quantity;
            }
        },
        removeFromCart(state, action) {
            const id = action.payload;
            state.items = state.items.filter(item => item.id !== id);
        },
        resetCart(state) {
            state.items = [];
        }
    }
});

export const { addToCart, updateCartItemQuantity, removeFromCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;