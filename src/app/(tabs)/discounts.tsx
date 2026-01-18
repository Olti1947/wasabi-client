import DiscountCard from "@/src/components/DiscountCard";
import { activateDiscount, fetchAvailableDiscounts } from "@/src/features/discount/discountSlice";
import { AppDispatch, RootState } from "@/src/store";
import { colors } from "@/src/theme/colors";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
export default function Discounts(){
const dispatch = useDispatch<AppDispatch>();
const {available, loading} = useSelector((state:RootState) => state.discounts )

useEffect(()=>{
    dispatch(fetchAvailableDiscounts())
},[dispatch])
 

if (available.length === 0){
    return (
        <View style ={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: colors.primary,
}}>
    <Text style = {{textAlign: 'center', color: "#fff", fontSize: 18}}>No discounts available.</Text>
</View>)
}

return (
         <View style ={{
           flex: 1,
           paddingTop: Platform.OS === "ios" ? 50 : Platform.OS === "web" ? 0 : 40
         }}>
    {loading && <ActivityIndicator color={colors.primary}/>}

        <FlatList style = {styles.container}
            data = {available}
            keyExtractor={(item) => item.id.toString()}

            renderItem={({item}) => (
             <DiscountCard 
            key={item.id}
            imageUrl= {item.imageUrl}
            title = {item.title}
            description= {item.description}
            type = {item.type}
            value={item.value}
            startsAt={new Date(item.startsAt)}
            endsAt = {new Date(item.endsAt)}
            minOrderValue={item.minOrderValue}
            stackable = {item.stackable}
            onActivate={()=>{dispatch(activateDiscount(item.id))}}
            activating = {false}            
            />
            )}
            showsVerticalScrollIndicator = {false}
            contentContainerStyle = {{paddingBottom: 16}}
            />
    </View>
    )
}


const styles = StyleSheet.create({
container : {
    padding: 20,
    backgroundColor: colors.primary
}
})