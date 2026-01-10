import api from "@/src/api/apiClient";
import FoodDetails from "@/src/components/FoodDetails";
import { selectToken } from "@/src/features/auth/authSelectors";
import { selectFoodItemById } from "@/src/features/food/foodSelectors";
import { FoodItem } from "@/src/features/food/foodTypes";
import { RootState } from "@/src/store";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";

export default function FoodDetailPage() {
 
    const { id } = useLocalSearchParams<{id: string}>();
    const foodId = Number(id);

    const cachedFood = useSelector((state: RootState) => selectFoodItemById(state, foodId));
    const [food, setFood] = useState<FoodItem | null>(cachedFood ?? null);
    const [loading, setLoading] = useState(!cachedFood);

const token = useSelector(selectToken);

useEffect(() => {
  if (!cachedFood && token) {
    api.get(`/api/foods/${foodId}`)
      .then(res => setFood(res.data))
      .finally(() => setLoading(false));
  }
}, [foodId, token]);
 
    if(loading){
        return <ActivityIndicator color={"green"}/>
    }

    return (
    <FoodDetails id={food?.id} name={food?.name} imageUrl={food?.imageUrl} description={food?.description} price={food?.price} ingredients={food?.ingredients}/>
    );
}