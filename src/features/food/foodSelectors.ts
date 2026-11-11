import { RootState } from "@/src/store";

export const selectFoodItemById = (state: RootState, id: number) => {
    return state.food.items.find(item => item.id === id);
}