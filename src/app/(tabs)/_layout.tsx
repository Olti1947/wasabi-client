import { useAuthValidation } from "@/src/hooks/useAuthValidation";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout(){
    const {isAuthenticated, checking} = useAuthValidation();
    
    if(checking){
        return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
        )
    }

      if (!isAuthenticated) {
    // While router redirects, return nothing
    return null;
    }

    return <Tabs>
        <Tabs.Screen name = "index" options={{title: "Home"}} />
    </Tabs>;
}