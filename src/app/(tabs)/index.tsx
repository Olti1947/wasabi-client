import HorizontalFoodList from "@/src/components/HorizontalFoodList";
import MenuScroll from "@/src/components/MenuScroll";
import { selectUser } from "@/src/features/auth/authSelectors";
import { colors } from "@/src/theme/colors";
import React, { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

/**
 * Home / Index screen
 * - Uses MenuScroll (FlashList) as the primary scroll container.
 * - This allows the infinite scroll (pagination) of MenuScroll to function correctly.
 */
  // example data for horizontal list: replace with real data or props
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const ListHeader = (
    <>
      {/* Header */}
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

      {/* Show Popular ONLY when not searching */}
      {debouncedSearch.length === 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Dishes</Text>
          <HorizontalFoodList data={popularData} title="" />
        </View>
      )}

      {/* Title changes based on mode */}
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
      <MenuScroll
        ListHeaderComponent={ListHeader}
        search={debouncedSearch}   
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // Removed scrollContent and foodScroll as they are no longer necessary for the main scroll container
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 16,
  },
  searchbar: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  section: {
    marginTop: 14,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 6,
    marginBottom: 8,
  },
});