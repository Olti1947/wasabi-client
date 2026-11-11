// components/BackButton.tsx
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export default function BackButton({ title }: { title?: string }) {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <Pressable
      onPress={handleBack}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
      }}
    >
      <Ionicons name="arrow-back" size={24} color={colors.primary} />
      {title && (
        <Text style={{ marginLeft: 6, color: colors.primary }}>{title}</Text>
      )}
    </Pressable>
  );
}
