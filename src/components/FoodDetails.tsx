import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import { AppDispatch, store } from "../store";
import { colors } from "../theme/colors";
import BackButton from "./BackButton";

type FoodDetailProps = {
  id: number | undefined;
  name: string | undefined;
  imageUrl: string | undefined;
  description: string | undefined;
  price: number | undefined;
  ingredients: string[] | undefined;
};

const FoodDetails = ({
  id,
  name,
  imageUrl,
  description,
  price,
  ingredients,
}: FoodDetailProps) => {
  const [cartText, setCartText] = useState("Add to Cart");

  const dispatch = useDispatch<AppDispatch>();
  const handleAddToCart = () => {
    // Handle add to cart action
    dispatch(
      addToCart({ id, name, description, price, imageUrl, quantity: 1 }),
    );
    setCartText("Added to Cart ✓");
    setTimeout(() => setCartText("Add to Cart"), 2000);
    console.log(store.getState().cart);
  };

  return (
    <>
      <View style={styles.container}>
        <View
          style={{
            height: 60,
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            paddingHorizontal: 0,
          }}
        >
          <BackButton />
        </View>
        <View style={styles.imageContainer}>
          {imageUrl && (
            <Image
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
              source={{ uri: imageUrl }}
            />
          )}
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.price}>${price?.toFixed(2)}</Text>
          </View>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.ingredientsContainer}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
              Ingredients:
            </Text>
            {ingredients?.map((ingredient, index) => (
              <Text key={index} style={styles.ingredient}>
                {ingredient}
              </Text>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
            <Text style={styles.buttonText}>{cartText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  imageContainer: {
    height: "60%",
    width: "100%",
    marginBottom: 16,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  price: {
    fontSize: 20,
    color: "#888",
  },
  description: {
    fontSize: 16,
    color: "#555",
  },
  ingredientsContainer: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  ingredient: {
    fontSize: 18,
    color: "#555",
    fontStyle: "italic",
    marginBottom: 4,
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
});

export default FoodDetails;
