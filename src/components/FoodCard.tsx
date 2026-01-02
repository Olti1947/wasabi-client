import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { AppDispatch, store } from '../store';
import { colors } from '../theme/colors';


type FoodCardProps = {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
};

const FoodCard = ({ id, name, imageUrl, description, price }: FoodCardProps) => {
  const [cartText, setCartText] = React.useState('Add to Cart');
  
  const dispatch = useDispatch<AppDispatch>();
  const handleAddToCart = () => {
    // Handle add to cart action
    dispatch(addToCart({ id, name, description, price, imageUrl, quantity: 1 }));
    setCartText('Added to Cart ✓');
    setTimeout(() => setCartText('Add to Cart'), 2000);
    console.log(store.getState().cart);
  };

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image style={styles.imageStyle} source={{ uri: imageUrl }} />
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.foodTitle}>{name}</Text>
        <Text style={styles.foodDescription}>{description}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>{cartText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    margin: 8,
    overflow: 'hidden',
  },
  imageStyle: {
    width: '100%',
    height: 120,
  },
  placeholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
  },
  infoContainer: {
    padding: 10,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FoodCard;
