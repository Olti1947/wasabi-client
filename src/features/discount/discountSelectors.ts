import { RootState } from "@/src/store";

export const selectAvailableDiscounts = (state:RootState) => state.discounts.available;

export const selectActiveDiscounts = (state:RootState) => state.discounts.active;

