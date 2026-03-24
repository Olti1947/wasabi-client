import api from "@/src/api/apiClient";
import { AdminBannerModal } from "@/src/components/AdminBannerModal";
import { AdminEditFoodModal } from "@/src/components/AdminEditFoodModal";
import { AdminFoodModal } from "@/src/components/AdminFoodModal";
import { AdminPanel } from "@/src/components/AdminPanel";
import { AutoBanner } from "@/src/components/AutoBanner";
import HorizontalDiscountList from "@/src/components/HorizontalDiscountList";
import HorizontalFoodList from "@/src/components/HorizontalFoodList";
import MenuScroll from "@/src/components/MenuScroll";
import { SpendingBar } from "@/src/components/SpendingBar";
import {
  selectIsAuthenticated,
  selectUser,
} from "@/src/features/auth/authSelectors";
import {
  fetchSpending,
  setNotificationToken,
} from "@/src/features/auth/authSlice";
import { fetchBanners } from "@/src/features/banner/bannerSlice";
import { fetchActiveDiscounts } from "@/src/features/discount/discountSlice";
import {
  fetchFoodItems,
  fetchPopularFoodItems,
} from "@/src/features/food/foodSlice";
import { AppDispatch, RootState } from "@/src/store";
import { colors } from "@/src/theme/colors";
import { registerForPushNotificationAsync } from "@/src/utils/registerForPushNotificationAsync";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function Index() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const user = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();
  const activeDiscounts = useSelector(
    (state: RootState) => state.discounts.active,
  );

  const bannerImages = useSelector((state: RootState) => state.banner.banners);

  const popularFoodItems = useSelector(
    (state: RootState) => state.food.popular,
  );

  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [openFoodModal, setOpenFoodModal] = useState(false);
  const [openBannerModal, setOpenBannerModal] = useState(false);
  const [openEditFoodModal, setEditFoodModal] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  /* ---------------- EFFECTS ---------------- */

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchFoodItems({ page: 0, size: 10, search: "" }));
      dispatch(fetchSpending());
      dispatch(fetchPopularFoodItems());
    }, [dispatch]),
  );

  useEffect(() => {
    registerForPushNotificationAsync().then((token) => {
      if (!isAuthenticated) return;

      if (token) {
        console.log(token);
        api.post("/api/notification/register", {
          token,
          deviceType: Platform.OS,
        });

        dispatch(setNotificationToken(token));
      } else {
        console.log("No token");
      }
    });
  }, [isAuthenticated]);
  useEffect(() => {
    dispatch(fetchActiveDiscounts());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleEdit = (id: number) => {
    setEditId(id);
    setEditFoodModal(true);
  };

  /* ---------------- HEADER ---------------- */
  const ListHeader = (
    <>
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
          placeholderTextColor={"#999"}
          style={styles.searchbar}
        />
      </View>

      {user?.role === "ADMIN" && (
        <AdminPanel
          buttonTitle="Add Banner Image"
          setOpen={setOpenBannerModal}
        />
      )}

      <AutoBanner bannerImages={bannerImages} />
      {user?.role === "ADMIN" && (
        <AdminPanel buttonTitle="Add Food Item" setOpen={setOpenFoodModal} />
      )}

      {debouncedSearch.length === 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Dishes</Text>
          <HorizontalFoodList
            data={popularFoodItems}
            title=""
            onEdit={handleEdit}
          />
        </View>
      )}

      {user?.spending !== null && user?.role === "USER" && (
        <View style={[styles.section, styles.spendingCard]}>
          <View style={styles.spendingHeader}>
            <Text style={styles.sectionTitle}>Your Spending</Text>
            <Text style={styles.spendingAmount}>
              ${user?.spending?.toFixed(2)}
            </Text>
          </View>

          <SpendingBar spending={user?.spending} />

          <View style={styles.spendingFooter}>
            <Text style={styles.spendingLabel}>$0</Text>
            <Text style={styles.spendingLabel}>$100 limit</Text>
          </View>
        </View>
      )}

      {debouncedSearch.length === 0 &&
        activeDiscounts.length > 0 &&
        user?.role === "USER" && (
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
      {openFoodModal && (
        <AdminFoodModal
          visible={openFoodModal}
          cancel={() => setOpenFoodModal(false)}
          refreshFoodList={() => {
            dispatch(fetchFoodItems({ page: 0, size: 10, search }));
            dispatch(fetchPopularFoodItems());
          }}
        />
      )}

      {openEditFoodModal && (
        <AdminEditFoodModal
          visible={openEditFoodModal}
          cancel={() => setEditFoodModal(false)}
          refreshFoodList={() => {
            dispatch(fetchFoodItems({ page: 0, size: 10, search }));
            dispatch(fetchPopularFoodItems());
          }}
          id={editId}
        />
      )}

      {openBannerModal && (
        <AdminBannerModal
          visible={openBannerModal}
          cancel={() => setOpenBannerModal(false)}
          refreshBannerList={() => dispatch(fetchBanners())}
        />
      )}
      <MenuScroll
        ListHeaderComponent={ListHeader}
        search={debouncedSearch}
        onEdit={handleEdit}
      />
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
  },

  spendingCard: {
    marginTop: 16,
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 3,
    gap: 12,
  },

  spendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },

  spendingAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },

  spendingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  spendingLabel: {
    fontSize: 12,
    color: "#888",
  },
});
