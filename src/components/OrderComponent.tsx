import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { OrderItem } from "../features/order/orderTypes";
import { colors } from "../theme/colors";
import OrderItemComponent from "./OrderItemComponent";

type OrderCardProps = {
  orderId: number | null;
  status: string | null;
  total: number | null;
  createdAt: string | null;
  items: OrderItem[] | null;
  userEmail?: string | null; // admin-only
  phoneNumber: string | null;
  address: string | null;
  onPress?: () => void;
};

const OrderCardComponent = ({
  orderId,
  status,
  total,
  createdAt,
  items,
  userEmail,
  phoneNumber,
  address,
  onPress,
}: OrderCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{orderId}</Text>

        <View style={styles.statusContainer}>
          <Icon name="time-outline" size={14} color={colors.secondary} />
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>

      {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
      {phoneNumber && <Text style={styles.phoneNumber}>{phoneNumber}</Text>}
      {address && <Text style={styles.address}>{address}</Text>}

      {/* Items */}
      <View style={styles.itemsContainer}>
        {items!.map((item) => (
          <OrderItemComponent
            key={item.foodItemId}
            name={item.foodName}
            quantity={item.quantity}
            unitPrice={item.unitPrice}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.date}>{new Date(createdAt!).toLocaleString()}</Text>

        <Text style={styles.total}>${total!.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  status: {
    marginLeft: 4,
    fontSize: 13,
    color: colors.secondary,
    fontWeight: "500",
  },
  userEmail: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
  itemsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#777",
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  address: {
    fontSize: 12,
    color: "#000",
  },
  phoneNumber: {
    fontSize: 12,
    color: "#000",
  },
});

export default OrderCardComponent;
