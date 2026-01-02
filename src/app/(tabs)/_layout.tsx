import { selectIsAuthenticated } from "@/src/features/auth/authSelectors";
import { colors } from "@/src/theme/colors";
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from "expo-router";
import { useSelector } from "react-redux";

export default function TabsLayout(){
const isAuthenticated = useSelector(selectIsAuthenticated)
 
if (!isAuthenticated){
    return <Redirect href = {"/(auth)/login" as any} />
}

    return <Tabs
    screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8e8e93',

    }}
    >
        <Tabs.Screen 
        name = "index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }} />
        <Tabs.Screen 
        name = "settings" 
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }} />
    </Tabs>;
}