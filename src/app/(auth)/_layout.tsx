import { selectIsAuthenticated } from "@/src/features/auth/authSelectors";
import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";

export default function AuthLayout() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack
  screenOptions={{
    headerShown: false
  }}
  />;
}
