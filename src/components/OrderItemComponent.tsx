import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type OrderItemProps = {
  name: string | null;
  quantity: number | null;
  unitPrice: number | null;
};

const OrderItemComponent = ({ name, quantity, unitPrice }: OrderItemProps) => {
  let total;
  if (unitPrice && quantity) {
    total = unitPrice * quantity;
  }
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text style={styles.quantity}>Qty: {quantity}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>${total!.toFixed(2)}</Text>
        <Text style={styles.unitPrice}>${unitPrice!.toFixed(2)} ea</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  left: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  quantity: {
    marginTop: 2,
    fontSize: 12,
    color: "#777",
  },
  right: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  unitPrice: {
    fontSize: 11,
    color: "#999",
  },
});

export default OrderItemComponent;
