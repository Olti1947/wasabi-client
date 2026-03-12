import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../api/apiClient";
import { colors } from "../theme/colors";

interface AdminFoodModalProps {
  visible: boolean;
  refreshFoodList: () => void;
  cancel: () => void;
}

export function AdminFoodModal({
  visible,
  refreshFoodList,
  cancel,
}: AdminFoodModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [image, setImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  function resetForm() {
    setName("");
    setDescription("");
    setIngredients([]);
    setPrice("");
    setImage(null);
  }

  async function submitFood() {
    if (!image) {
      Alert.alert("Error", "Please select an image.");
      return;
    }

    try {
      const formData = new FormData();

      // 1. Prepare JSON Data
      const foodData = {
        name,
        description,
        price: parseFloat(price),
        ingredients,
      };

      // Matches @RequestPart("data") or @RequestParam("data")
      formData.append("data", JSON.stringify(foodData));

      // 2. Prepare Image
      // For Android, we ensure the uri is passed correctly within the expected object structure

      // 2. Handle Image Part based on Platform
      if (Platform.OS === "web") {
        // On Web, we need to fetch the URI and convert it back to a Blob/File
        // or use the 'file' property if your pickImage saved it.
        const response = await fetch(image.uri);
        const blob = await response.blob();
        formData.append("image", blob, image.name);
      } else {
        // On Mobile (Android/iOS), use the specialized object
        formData.append("image", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      }

      // 3. API Call
      // We use transformRequest to prevent Axios from trying to serialize the FormData
      // We also ensure no default Content-Type header interferes with the boundary
      await api.post("/api/foods/admin/food", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        transformRequest: (data) => data,
      });

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

  /* ---------------- IMAGE PICKER ---------------- */
  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo access to upload food images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7, // Reduced slightly for better network performance
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName ?? `food_${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });
    }
  }

  return (
    <View style={styles.overlay}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.adminModal}>
        <Text style={styles.modalTitle}>Add Food Item</Text>

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

        <TouchableOpacity style={styles.adminButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>

        {image && (
          <Text style={styles.imageText}>Image selected: {image.name}</Text>
        )}

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
