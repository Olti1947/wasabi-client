import api from "@/src/api/apiClient";
import DiscountCard from "@/src/components/DiscountCard";
import SushiAlert from "@/src/components/SushiAlert";
import { selectUser } from "@/src/features/auth/authSelectors";
import {
  activateDiscount,
  fetchAvailableDiscounts,
} from "@/src/features/discount/discountSlice";
import { AppDispatch, RootState } from "@/src/store";
import { colors } from "@/src/theme/colors";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";
import { useDispatch, useSelector } from "react-redux";

export default function Discounts() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const { available, loading } = useSelector(
    (state: RootState) => state.discounts,
  );
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [minOrderValue, setMinOrderValue] = useState<string>("");
  const [pendingDiscountId, setPendingDiscountId] = useState<number | null>(
    null,
  );
  const [range, setRange] = useState<{
    startDate: DateType;
    endDate: DateType;
  }>({ startDate: undefined, endDate: undefined });
  const [stackable, setStackable] = useState<boolean>();
  const [open, setOpen] = useState<boolean>();
  const [drop, setDrop] = useState<boolean>(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [image, setImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const [productIdsInput, setProductIdsInput] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const toBackendDateTime = (date?: Date | null) => {
    if (!date) return null;
    return date.toISOString().slice(0, 19); // "yyyy-MM-ddTHH:mm:ss"
  };

  const parsedProductIds = productIdsInput
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean)
    .map((i) => parseInt(i))
    .filter((i) => !isNaN(i));

  const formatDisplayDate = (date?: DateType) => {
    if (!date) return "";
    const d = new Date(date as any);
    return d.toLocaleString(); // nice & readable
  };

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setAlertTitle("Permission Denied");
      setAlertMessage("Permission to access media library is required!");
      setAlertVisible(true);
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

  const cancel = () => {
    setTitle("");
    setDescription("");
    setValue("");
    setStackable(false);
    setDrop(false);
    setShowStartPicker(false);
    setMinOrderValue("");
    setOpen(false);
    setRange({
      startDate: undefined,
      endDate: undefined,
    });
  };

  async function submitDiscount() {
    if (!image) {
      setAlertTitle("Error");
      setAlertMessage("Please select an image.");
      setAlertVisible(true);
      return;
    }

    try {
      const formData = new FormData();

      // 1. Prepare JSON Data
      const discountData = {
        title,
        description,
        type,
        value: parseFloat(value),
        startsAt: toBackendDateTime(range.startDate as Date),
        endsAt: toBackendDateTime(range.endDate as Date),
        stackable,
        minOrderValue: parseFloat(minOrderValue),
        productIds: parsedProductIds,
      };

      // Matches @RequestPart("data") or @RequestParam("data")
      formData.append("data", JSON.stringify(discountData));

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
      await api.post("/api/discounts/admin", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        transformRequest: (data) => data,
      });

      setAlertTitle("Success");
      setAlertMessage("Discount added successfully!");
      setAlertVisible(true);
      dispatch(fetchAvailableDiscounts());
      cancel();
    } catch (error: any) {
      console.error("Submission Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      setAlertTitle("Upload Failed");
      setAlertMessage(errorMsg);
      setAlertVisible(true);
    }
  }

  const discountTypes = [
    { label: "PERCENTAGE", value: "PERCENTAGE" },
    { label: "FIXED", value: "FIXED" },
  ];

  useEffect(() => {
    dispatch(fetchAvailableDiscounts());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAvailableDiscounts());
    }, [dispatch]),
  );

  if (available.length === 0 && user?.role !== "ADMIN") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: colors.primary,
        }}
      >
        <Text style={{ textAlign: "center", color: "#fff", fontSize: 18 }}>
          No discounts available.
        </Text>
      </View>
    );
  }

  return (
    <>
      {open && (
        <View style={styles.overlay}>
          <SushiAlert
            title={alertTitle}
            message={alertMessage}
            visible={alertVisible}
            onConfirm={() => {
              setAlertVisible(false);
              if (pendingDiscountId) {
                dispatch(activateDiscount(pendingDiscountId));
                setPendingDiscountId(null);
              }
            }}
          />
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.adminModal}>
            <Text style={styles.modalTitle}>Add Discount</Text>

            <TextInput
              style={styles.adminInput}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={"#999"}
            />
            <TextInput
              style={styles.adminInput}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={"#999"}
            />
            <DropDownPicker
              open={drop}
              value={type}
              items={discountTypes}
              setOpen={setDrop}
              setValue={setType}
              placeholder="Select discount type"
              listMode="SCROLLVIEW"
              style={styles.dropdown}
            />
            <TextInput
              style={styles.adminInput}
              keyboardType="phone-pad"
              value={value}
              onChangeText={setValue}
              placeholder="Discount Value"
              placeholderTextColor={"#999"}
            />
            <TextInput
              style={styles.adminInput}
              keyboardType="phone-pad"
              value={minOrderValue}
              onChangeText={setMinOrderValue}
              placeholder="Minimum order amount"
              placeholderTextColor={"#999"}
            />
            <TouchableOpacity
              onPress={() => setShowStartPicker((prev) => !prev)}
            >
              <TextInput
                style={styles.adminInput}
                value={
                  range.startDate && range.endDate
                    ? `${formatDisplayDate(range.startDate)}  →  ${formatDisplayDate(
                        range.endDate,
                      )}`
                    : range.startDate
                      ? `${formatDisplayDate(range.startDate)}  →  ...`
                      : ""
                }
                placeholder="Select discount period"
                editable={false}
                pointerEvents="none"
                placeholderTextColor={"#999"}
              />
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                mode="range"
                startDate={range.startDate}
                endDate={range.endDate}
                onChange={(params) => setRange(params)}
                styles={{
                  selected: {
                    backgroundColor: colors.primary,
                    borderRadius: 30,
                  },
                  selected_label: {
                    color: "#fff",
                  },
                  header: {
                    color: "#000",
                  },
                }}
              />
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ flex: 1 }}>Stackable</Text>
              <Switch value={stackable} onValueChange={setStackable} />
            </View>
            <TextInput
              style={styles.adminInput}
              placeholder="Food Ids (comma separated)"
              value={productIdsInput}
              onChangeText={setProductIdsInput}
              placeholderTextColor={"#999"}
            />

            <TouchableOpacity
              style={styles.adminDiscountButton}
              onPress={pickImage}
            >
              <Text style={styles.discountButtonText}>Select Image</Text>
            </TouchableOpacity>

            {image && (
              <Text style={styles.imageText}>Image selected: {image.name}</Text>
            )}

            <TouchableOpacity
              style={styles.adminDiscountButton}
              onPress={submitDiscount}
            >
              <Text style={styles.discountButtonText}>Submit Discount</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={cancel} style={styles.cancelButton}>
              <Text style={styles.discountButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View
        style={{
          flex: 1,
          paddingTop:
            Platform.OS === "ios" ? 50 : Platform.OS === "web" ? 0 : 40,
        }}
      >
        {loading && <ActivityIndicator color={colors.primary} />}
        <SushiAlert
          title={alertTitle}
          message={alertMessage}
          visible={alertVisible}
          onConfirm={() => setAlertVisible(false)}
        />
        {user?.role === "ADMIN" && (
          <View style={styles.adminPanel}>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => setOpen(true)}
            >
              <Text style={styles.buttonText}>Add Discount</Text>
            </TouchableOpacity>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Admin Panel
            </Text>
          </View>
        )}

        <FlatList
          style={styles.container}
          data={available}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DiscountCard
              key={item.id}
              id={user?.role === "ADMIN" ? item.id : 0}
              imageUrl={item.imageUrl}
              title={item.title}
              description={item.description}
              type={item.type}
              value={item.value}
              startsAt={new Date(item.startsAt)}
              endsAt={new Date(item.endsAt)}
              minOrderValue={item.minOrderValue}
              stackable={item.stackable}
              onActivate={() => {
                setAlertTitle("Discount Activated");
                setAlertMessage(`${item.title} is now active!`);
                setAlertVisible(true);
                setPendingDiscountId(item.id);
              }}
              activating={false}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  adminPanel: {
    padding: 12,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adminButton: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: colors.primary, fontSize: 16 },
  discountButtonText: { color: "#fff", fontSize: 16 },

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
  dropdown: {
    borderColor: "#ccc",
  },
  cancelButton: {
    padding: 10,
    backgroundColor: colors.accent,
    borderRadius: 8,
    alignItems: "center",
  },
  adminDiscountButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
});
