import React from "react";
import { FlatList, Text, View } from "react-native";
import FoodCard from "../components/FoodCard";

type HorizontalFoodListProps = {
  title: string;
  data: any[];
  onEdit?: (id: number) => void;
};

const HorizontalFoodList = ({
  title,
  data,
  onEdit,
}: HorizontalFoodListProps) => {
  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 10 }}>
        {title}
      </Text>
      <FlatList
        data={data}
        renderItem={({ item }) => <FoodCard {...item} onEdit={onEdit} />}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
};

export default HorizontalFoodList;
