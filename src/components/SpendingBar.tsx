import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

export function SpendingBar({ spending }: { spending?: number }) {
  const progress = spending ? Math.min(spending / 100, 1) : 0;

  const checkpoints = [0.25, 0.5, 0.75];

  return (
    <View style={styles.container}>
      <View style={styles.background} />

      <View style={[styles.fill, { width: `${progress * 100}%` }]} />

      {checkpoints.map((point, i) => (
        <View
          key={i}
          style={[styles.iconContainer, { left: `${point * 100}%` }]}
        >
          <FontAwesome
            name="gift"
            size={18}
            color={progress >= point ? "#4CAF50" : "#888"}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    position: "relative",
  },

  background: {
    position: "absolute",
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
  },

  fill: {
    position: "absolute",
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  iconContainer: {
    position: "absolute",
    top: -12,
    transform: [{ translateX: -9 }], // centers the icon
  },
});
