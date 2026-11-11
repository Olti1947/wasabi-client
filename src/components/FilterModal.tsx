import { FoodCategory } from "@/src/features/food/foodTypes";
import { colors } from "@/src/theme/colors";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useDispatch } from "react-redux";
import { fetchFoodItems } from "../features/food/foodSlice";
import { AppDispatch } from "../store";

interface Props {
  visible: boolean;
  onApply: (filters: { category?: string; baked?: boolean | null }) => void;
}

export default function FilterModal({ visible, onApply }: Props) {
  const [category, setCategory] = useState<string | null>(null);
  const [baked, setBaked] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  function onClose() {
    setCategory(null);
    setBaked(null);
    dispatch(
      fetchFoodItems({
        page: 0,
        size: 10,
        category: category || undefined,
        baked,
      }),
    );
    onApply({ category: undefined, baked: null });
  }

  function handleApply() {
    dispatch(
      fetchFoodItems({
        page: 0,
        size: 10,
        category: category || undefined,
        baked,
      }),
    );
  }

  const items = Object.values(FoodCategory).map((cat) => ({
    label: cat,
    value: cat,
  }));

  if (!visible) return null;

  return (
    <View style={styles.popupContainer}>
      <Text style={styles.label}>Category</Text>
      <DropDownPicker
        open={open}
        value={category}
        items={items}
        setOpen={setOpen}
        setValue={setCategory}
        placeholder="Select..."
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownList}
        containerStyle={{ height: open ? 200 : 50 }} // Prevent clipping
      />

      <View style={styles.row}>
        <Text style={styles.label}>Baked Only</Text>
        <Switch
          value={baked === true}
          onValueChange={(val) => setBaked(val)}
          trackColor={{ false: "#767577", true: colors.primary }}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => {
            onApply({ category: category || undefined, baked });
            handleApply();
          }}
        >
          <Text style={styles.btnText}>Apply</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    // Center it horizontally
    backgroundColor: "#f9f9f9", // Light background to distinguish from pure white
    borderRadius: 12,
    padding: 16,
    marginTop: 10, // Gap between "Full Menu" title and filters
    marginBottom: 10, // Gap between filters and the first food item
    paddingHorizontal: 20,
    // Minimal border instead of heavy shadows
    borderWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  dropdown: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
    minHeight: 40,
  },
  dropdownList: {
    borderColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    gap: 25,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelText: {
    color: "#e63946", // Make "Clear" or "Cancel" look like a secondary action
    fontSize: 14,
    fontWeight: "500",
  },
});
