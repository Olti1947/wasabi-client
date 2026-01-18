import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import DiscountCard from './DiscountCard';

type HorizontalDiscountListProps = {
  title: string;
  data: any[];
};

const HorizontalDiscountList = ({ title, data }: HorizontalDiscountListProps) => {
  return (
    <View style={{ marginVertical: 10, backgroundColor: colors.primary, borderRadius: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>{title}</Text>
      <FlatList
        data={data}
        renderItem={({ item }) =>  <DiscountCard 
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
            activating = {false}
        />}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
};

export default HorizontalDiscountList;
