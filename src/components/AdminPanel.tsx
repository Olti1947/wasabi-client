import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";

interface AdminPanelProps {
  buttonTitle: string;

  setOpen: (open: boolean) => void;
}

export function AdminPanel({ buttonTitle, setOpen }: AdminPanelProps) {
  return (
    <View style={styles.adminPanel}>
      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.buttonText}>{buttonTitle}</Text>
      </TouchableOpacity>
      <Text style={{ color: colors.primary, fontWeight: "bold" }}>
        Admin Panel
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  buttonText: { color: "#fff", fontSize: 16 },
});
