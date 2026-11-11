import api from "@/src/api/apiClient";
import { selectNotificationToken } from "@/src/features/auth/authSelectors";
import { logout } from "@/src/features/auth/authSlice";
import { AppDispatch } from "@/src/store";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import SettingsButton from "../../components/SettingsButton";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const notificationToken = useSelector(selectNotificationToken);

  const handleLogout = () => {
    dispatch(logout());
    api
      .delete("/api/notification/deleteToken", {
        params: { token: notificationToken },
      })
      .catch((error) => {
        console.error("Failed to delete notification token:", error);
      });
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.user}>User Name</Text>
      </View>

      <View style={styles.buttonGroupContainer}>
        <SettingsButton
          title="Personal Info"
          icon="person"
          onPress={() => {
            router.push("/settings/personal");
          }}
        ></SettingsButton>
        <SettingsButton
          title="Addresses"
          icon="location"
          onPress={() => {
            router.push("/settings/address" as any);
          }}
        ></SettingsButton>
      </View>

      <View style={styles.buttonGroupContainer}>
        <SettingsButton
          title="Cart"
          icon="cart"
          onPress={() => {
            router.push("/cart");
          }}
        ></SettingsButton>
        <SettingsButton
          title="Notifications"
          icon="notifications"
          onPress={() => {}}
        ></SettingsButton>
        <SettingsButton
          title="Payment Methods"
          icon="card"
          onPress={() => {}}
        ></SettingsButton>
      </View>
      <View style={styles.buttonGroupContainer}>
        <SettingsButton
          title="Log out"
          icon="log-out"
          onPress={handleLogout}
        ></SettingsButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "space-evenly",
    paddingHorizontal: 24,
  },

  user: {
    fontSize: 24,
    fontWeight: "bold",
  },

  buttonGroupContainer: {
    backgroundColor: "#F6F8FA",
    borderRadius: 10,
  },
});
