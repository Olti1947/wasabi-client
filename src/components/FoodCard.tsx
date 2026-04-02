import { selectUser } from "@/src/features/auth/authSelectors";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/apiClient";
import { addToCart } from "../features/cart/cartSlice";
import { fetchFoodItems } from "../features/food/foodSlice";
import { AppDispatch, store } from "../store";
import { colors } from "../theme/colors";

type FoodCardProps = {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  onEdit?: (id: number) => void;
  onPress?: () => void;
};

const FoodCard = ({
  id,
  name,
  imageUrl,
  description,
  price,
  onEdit,
  onPress,
}: FoodCardProps) => {
  const [cartText, setCartText] = React.useState("Add to Cart");
  const [deleteText, setDeleteText] = useState("Delete Item");
  const [editText, setEditText] = useState("Edit Item");

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);

  const handleAddToCart = () => {
    // Handle add to cart action
    dispatch(
      addToCart({ id, name, description, price, imageUrl, quantity: 1 }),
    );
    setCartText("Added to Cart ✓");
    onPress?.();
    setTimeout(() => setCartText("Add to Cart"), 2000);
    console.log(store.getState().cart);
  };

  async function deleteItem() {
    await api.delete(`/api/foods/admin/${id.toString()}`);
    dispatch(fetchFoodItems({ page: 0, size: 10 }));
    setDeleteText("Item Deleted");
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push(`/food/${id}`)}>
        {imageUrl ? (
          <Image style={styles.imageStyle} source={{ uri: imageUrl }} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        {user?.role === "ADMIN" && (
          <Text style={styles.foodTitle}>{id.toString()}</Text>
        )}
        <Text style={styles.foodTitle}>{name}</Text>
        <Text style={styles.foodDescription}>{description}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        {user?.role === "USER" && (
          <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
            <Text style={styles.buttonText}>{cartText}</Text>
          </TouchableOpacity>
        )}
        {user?.role === "ADMIN" && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                onEdit?.(id);
              }}
            >
              <Text style={styles.buttonText}>{editText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={deleteItem}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {deleteText}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    margin: 8,
    overflow: "hidden",
  },
  imageStyle: {
    width: "100%",
    height: 120,
  },
  placeholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#eee",
  },
  infoContainer: {
    padding: 10,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  deleteButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    marginTop: 3,
  },
});

export default FoodCard;
