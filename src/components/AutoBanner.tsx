import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import api from "../api/apiClient";
import { Banner } from "../features/banner/bannerType";
import { RootState } from "../store";
import { colors } from "../theme/colors";

type AutoBannerProps = {
  bannerImages: Banner[];
};
const { width } = Dimensions.get("window");

export function AutoBanner({ bannerImages }: AutoBannerProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAdmin = useSelector(
    (state: RootState) => state.auth.user?.role === "ADMIN",
  );

  const deleteBanner = async (id: number) => {
    const response = await api.delete(`/api/admin/banner-images/${id}`);
    return response.data;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (bannerImages.length === 0) return;
      const nextIndex =
        currentIndex === bannerImages.length - 1 ? 0 : currentIndex + 1;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 3000); // change every 3 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={{ marginVertical: 16 }}>
      <FlatList
        ref={flatListRef}
        data={bannerImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ alignItems: "center", flex: 1 }}>
            <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} />
            {isAdmin && <Text>Image ID: {item.id}</Text>}
            {isAdmin && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteBanner(item.id)}
              >
                <Text style={{ color: "#fff" }}>Delete Banner</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerImage: {
    width: width - 32,
    height: 200,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    marginTop: 3,
    paddingHorizontal: 12,
  },
});
