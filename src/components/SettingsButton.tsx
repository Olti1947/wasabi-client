import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type SettingsButtonProps = {
    onPress: () => void;
    title: string;
    icon: string;
}

const SettingsButton = ({ onPress, title, icon }: SettingsButtonProps) => {
  return (
    <Pressable onPress={onPress}>
    <View style={styles.container} onTouchEnd={onPress}>
      <View style={styles.leftPart}>
        <Icon name={icon} size={24} color={"green"}/>
        <Text>{title}</Text>
      </View>
        <Icon name="chevron-forward" size={20}/>
    </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
},

leftPart : {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
}
});

export default SettingsButton