import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../api/apiClient";
import { FoodItem } from "../features/food/foodTypes";
import { colors } from "../theme/colors";

interface AdminFoodModalProps {
  visible: boolean;
  id: number | undefined;
  refreshFoodList: () => void;
  cancel: () => void;
}

export function AdminEditFoodModal({
  id,
  visible,
  refreshFoodList,
  cancel,
}: AdminFoodModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [popular, setPopular] = useState<boolean>(false);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await api.get<FoodItem>(`/api/foods/summary/${id}`);
        const foodItem = res.data;

        setName(foodItem.name);
        setDescription(foodItem.description);
        setPrice(foodItem.price.toString());
        setIngredients(foodItem.ingredients || []);
        setPopular(foodItem.popular || false);
      } catch (error) {
        console.error("Error fetching food item:", error);
        Alert.alert("Error", "Failed to load food item details.");
        cancel();
      }
    };

    fetchFood();
  }, [id]);

  function resetForm() {
    setName("");
    setDescription("");
    setIngredients([]);
    setPrice("");
    setPopular(false);
  }

  async function submitFood() {
    try {
      const formData = {
        id,
        name,
        description,
        price: parseFloat(price),
        ingredients,
        popular,
      };

      await api.put("/api/foods/admin/food", formData);

      Alert.alert("Success", "Food added successfully!");
      refreshFoodList();
      resetForm();
      cancel();
    } catch (error: any) {
      console.error("Submission Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      Alert.alert("Upload Failed", errorMsg);
    }
  }

  if (!visible) {
    return <></>;
  }

  return (
    <View style={styles.overlay}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.adminModal}>
        <Text style={styles.modalTitle}>Edit Food Item</Text>

        <TextInput
          style={styles.adminInput}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={"#999"}
        />
        <TextInput
          style={styles.adminInput}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor={"#999"}
        />
        <TextInput
          style={styles.adminInput}
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholderTextColor={"#999"}
        />
        <TextInput
          style={styles.adminInput}
          placeholder="Ingredients (comma separated)"
          value={ingredients.join(", ")}
          onChangeText={(text) =>
            setIngredients(text.split(",").map((i) => i.trim()))
          }
          placeholderTextColor={"#999"}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ flex: 1 }}>Popular</Text>
          <Switch value={popular} onValueChange={setPopular} />
        </View>

        <TouchableOpacity style={styles.adminButton} onPress={submitFood}>
          <Text style={styles.buttonText}>Submit Food</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={cancel} style={styles.cancelButton}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  adminModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    width: "85%",
    gap: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  adminInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 10,
  },
  imageText: { textAlign: "center", fontSize: 12, color: "#555" },
  adminButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16 },
  cancelButton: {
    padding: 10,
    backgroundColor: colors.accent,
    borderRadius: 8,
    alignItems: "center",
  },
});
