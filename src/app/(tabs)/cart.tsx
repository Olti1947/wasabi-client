import CartItemComponent from "@/src/components/CartItemComponent";
import { selectCartItems, selectCartTotalPrice } from "@/src/features/cart/cartSelectors";
import { AppDispatch } from "@/src/store";
import { colors } from "@/src/theme/colors";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector(selectCartItems);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
const phonePattern = /^\d{3} \d{3} \d{3}$/

  const totalPrice = useSelector(selectCartTotalPrice);

  const handlePlaceOrder = () => {
    
    if (!phone || !address) {
      setError("Please enter phone number and delivery address.");
      return;
    }

      if (!phonePattern.test(phone)) {
    setError("Phone number must be in the format XXX XXX XXX (e.g., 045 123 456).");
    return;
  }
    setError("");
    alert(`Order placed!\nTotal: $${totalPrice}\nPhone: ${phone}\nAddress: ${address}`);
  };

  const formatKosovoPhone = (input: string) => {
  // Remove any non-digit characters
  const digits = input.replace(/\D/g, '');
  // Insert spaces after 3 and 6 digits
  const part1 = digits.substring(0, 3);
  const part2 = digits.substring(3, 6);
  const part3 = digits.substring(6, 9);

  return [part1, part2, part3].filter(Boolean).join(' ');
};


  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {cartItems.map((item) => (
        <CartItemComponent
          key={item.id}
          id={item.id}
          name={item.name}
          description={item.description}
          price={item.price}
          imageUrl={item.imageUrl}
        />
      ))}

      {/* Delivery Section */}
      <View style={styles.deliveryContainer}>
        <Text style={styles.sectionTitle}>Delivery Information</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
            onChangeText={(text) => setPhone(formatKosovoPhone(text))}
        />

        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Delivery Address"
          multiline
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.totalPrice}>Total: ${totalPrice.toFixed(2)}</Text>

        {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
        <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
          <Text style={styles.orderButtonText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40, 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: colors.primary,
    fontSize: 18,
  },
  deliveryContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
  },
  orderButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
