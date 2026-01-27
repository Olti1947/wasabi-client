import api from "@/src/api/apiClient";
import HorizontalDiscountList from "@/src/components/HorizontalDiscountList";
import HorizontalFoodList from "@/src/components/HorizontalFoodList";
import MenuScroll from "@/src/components/MenuScroll";
import { selectUser } from "@/src/features/auth/authSelectors";
import { fetchActiveDiscounts } from "@/src/features/discount/discountSlice";
import { fetchFoodItems } from "@/src/features/food/foodSlice";
import { AppDispatch, RootState } from "@/src/store";
import { colors } from "@/src/theme/colors";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

/* ---------------- POPULAR DATA ---------------- */
const popularData = [
  {
    id: 1,
    name: "Sushi Platter",
    description: "Assorted sushi rolls",
    price: 25.99,
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-eacef0df6022?w=1200&h=900&fit=crop",
  },
  {
    id: 2,
    name: "Ramen Bowl",
    description: "Spicy miso ramen",
    price: 12.99,
    imageUrl:
      "https://images.unsplash.com/photo-1543352634-6fcf2b0c9bda?w=1200&h=900&fit=crop",
  },
  {
    id: 3,
    name: "Salmon Nigiri",
    description: "Fresh salmon nigiri",
    price: 9.5,
    imageUrl:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&h=900&fit=crop",
  },
];

export default function Index() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const user = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();
  const activeDiscounts = useSelector(
    (state: RootState) => state.discounts.active,
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [image, setImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  /* ---------------- SUBMIT FOOD ---------------- */
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
      dispatch(fetchFoodItems({ page: 0, size: 10, search }));
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

  function cancel() {
    setName("");
    setDescription("");
    setIngredients([]);
    setPrice("");
    setImage(null);
    setOpen(false);
  }

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    dispatch(fetchActiveDiscounts());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- HEADER ---------------- */
  const ListHeader = (
    <>
      {open && (
        <View style={styles.overlay}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.adminModal}>
            <Text style={styles.modalTitle}>Add Food Item</Text>

            <TextInput
              style={styles.adminInput}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.adminInput}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={styles.adminInput}
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.adminInput}
              placeholder="Ingredients (comma separated)"
              value={ingredients.join(", ")}
              onChangeText={(text) =>
                setIngredients(text.split(",").map((i) => i.trim()))
              }
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
      )}

      <View style={styles.container}>
        <Text style={styles.greeting}>
          Hey {user?.firstName || "there"}!{" "}
          <Text style={{ fontWeight: "bold", color: colors.primary }}>
            Welcome back!
          </Text>
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search a dish..."
          style={styles.searchbar}
        />
      </View>

      {user?.role === "ADMIN" && (
        <View style={styles.adminPanel}>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => setOpen(true)}
          >
            <Text style={styles.buttonText}>Add Food Item</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.primary, fontWeight: "bold" }}>
            Admin Panel
          </Text>
        </View>
      )}

      {debouncedSearch.length === 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Dishes</Text>
          <HorizontalFoodList data={popularData} title="" />
        </View>
      )}

      {debouncedSearch.length === 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Active Discounts</Text>
          <HorizontalDiscountList data={activeDiscounts} title="" />
        </View>
      )}

      <View style={[styles.section, { marginBottom: 0 }]}>
        <Text style={styles.sectionTitle}>
          {debouncedSearch.length > 0
            ? `Results for “${debouncedSearch}”`
            : "Full Menu"}
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <MenuScroll ListHeaderComponent={ListHeader} search={debouncedSearch} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  greeting: { fontSize: 16 },
  searchbar: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  section: { marginTop: 14, paddingHorizontal: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 6,
    marginBottom: 8,
  },
  adminPanel: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adminButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    padding: 10,
    backgroundColor: colors.accent,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16 },
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
});
