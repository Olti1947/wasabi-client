import { selectIsAuthenticated } from "@/src/features/auth/authSelectors";
import { Redirect, Tabs } from "expo-router";
import { useSelector } from "react-redux";

export default function TabsLayout(){
const isAuthenticated = useSelector(selectIsAuthenticated)
 
if (!isAuthenticated){
    return <Redirect href = {"/(auth)/login" as any} />
}

    return <Tabs
    screenOptions={{
        headerShown: false
    }}
    >
        <Tabs.Screen name = "index" options={{title: "Home"}} />
    </Tabs>;
}