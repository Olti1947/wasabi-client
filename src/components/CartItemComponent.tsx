import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from "react-redux";
import { selectCartItemCountById } from "../features/cart/cartSelectors";
import { removeFromCart, updateCartItemQuantity } from "../features/cart/cartSlice";
import { FoodItem } from "../features/food/foodTypes";
import { AppDispatch, RootState } from "../store";
import { colors } from "../theme/colors";

const CartItemComponent = ({ id, name, description, price, imageUrl }: FoodItem) => {
  const dispatch = useDispatch<AppDispatch>();

  // Get quantity from Redux store
  const quantity = useSelector((state: RootState) => selectCartItemCountById(state, id));

  // Handlers
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      dispatch(updateCartItemQuantity({ id, quantity: quantity - 1 }));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const handleIncreaseQuantity = () => {
    dispatch(updateCartItemQuantity({ id, quantity: quantity + 1 }));
  };

  const handleRemoveItem = () => {
    dispatch(removeFromCart(id));
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.infoContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={handleRemoveItem}>
          <Icon name="close-circle-outline" size={20} color="red" />
        </TouchableOpacity>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={handleDecreaseQuantity}>
            <Icon name="remove-circle-outline" size={24} color={colors.secondary} />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity onPress={handleIncreaseQuantity}>
            <Icon name="add-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  description: {
    fontSize: 12,
    color: '#555',
    marginVertical: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CartItemComponent;
