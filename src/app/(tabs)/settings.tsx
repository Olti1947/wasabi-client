import { StyleSheet, Text, View } from "react-native";
import SettingsButton from "../../components/SettingsButton";

export default function Settings() {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.user}>User Name</Text>
            </View>
    
            <View style={styles.buttonGroupContainer}>
            <SettingsButton title="Personal Info" icon="person" onPress={()=>{}}></SettingsButton>
         <SettingsButton title="Addresses" icon="location" onPress={()=>{}}></SettingsButton>
            </View>


            <View style={styles.buttonGroupContainer}>
                <SettingsButton title="Cart" icon="cart" onPress={()=>{}}></SettingsButton>
                <SettingsButton title="Notifications" icon="notifications" onPress={()=>{}}></SettingsButton>
                 <SettingsButton title="Payment Methods" icon="card" onPress={()=>{}}></SettingsButton>
                    </View>
                <View style={styles.buttonGroupContainer}>
                <SettingsButton title="Log out" icon="log-out" onPress={()=>{}}></SettingsButton>
                </View>
     
        </View>
    );
}

const styles = StyleSheet.create({
container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
},

user: {
    fontSize: 24,
    fontWeight: 'bold',
},

buttonGroupContainer: {
    backgroundColor: '#F6F8FA',
        borderRadius: 10,
}
});
