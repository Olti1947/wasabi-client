import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import FoodCard from "../components/FoodCard";
import SushiAlert from "./SushiAlert";

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
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const handleEditAlert = (tTitle: string, alertMessage: string) => {
    setAlertTitle(tTitle);
    setAlertMessage(alertMessage);
    setAlertVisible(true);
  };
  return (
    <View style={{ marginVertical: 10 }}>
      <SushiAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
      />
      <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 10 }}>
        {title}
      </Text>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <FoodCard
            {...item}
            onEdit={onEdit}
            onPress={() =>
              handleEditAlert("Food Added", `${item.name} added to cart!`)
            }
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
};

export default HorizontalFoodList;
