import { colors } from "@/src/theme/colors";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentOrder } from "../features/cart/cartSelectors";
import { fetchCurrentOrder } from "../features/cart/cartSlice";
import { AppDispatch } from "../store";
import BackButton from "./BackButton";

export default function CurrentOrder() {
  const dispatch = useDispatch<AppDispatch>();
  const currentOrder = useSelector(selectCurrentOrder);

  useEffect(() => {
    dispatch(fetchCurrentOrder());
  }, []);

  useEffect(() => {
    if (!currentOrder) return;
    console.log("Current order status:", currentOrder.orderStatus);
    if (
      currentOrder.orderStatus === "COMPLETED" ||
      currentOrder.orderStatus === "CANCELLED"
    ) {
      return;
    }

    const interval = setInterval(() => {
      dispatch(fetchCurrentOrder());
    }, 5000);

    return () => clearInterval(interval);
  }, [currentOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "green";
      case "PAID":
        return "blue";
      case "CANCELLED":
        return "red";
      case "REFUNDED":
        return "purple";
      case "CREATED":
        return "orange";
      case "IN_PROGRESS":
        return "teal";
      case "DELIVERY":
        return "brown";
      default:
        return colors.primary;
    }
  };

  // 🔄 Loading

  // ❌ No active order
  if (!currentOrder) {
    return (
      <View style={styles.center}>
        <Text>No active order</Text>
      </View>
    );
  }

  const items = currentOrder.items ?? [];
  const discounts = currentOrder.discounts ?? [];

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      {/* HEADER */}
      <Text style={styles.title}>Your Order</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text
          style={[
            styles.value,
            { color: getStatusColor(currentOrder.orderStatus!) },
          ]}
        >
          {currentOrder.orderStatus}
        </Text>

        <Text style={styles.label}>Placed At</Text>
        <Text style={styles.value}>
          {new Date(currentOrder.createdAt!).toLocaleString()}
        </Text>
      </View>

      {/* DELIVERY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{currentOrder.phoneNumber}</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{currentOrder.address}</Text>

        {currentOrder.comment && (
          <>
            <Text style={styles.label}>Comment</Text>
            <Text style={styles.value}>{currentOrder.comment}</Text>
          </>
        )}
      </View>

      {/* ITEMS */}
      <Text style={styles.sectionTitle}>Items</Text>

      {items.map((item, index) => (
        <View key={index} style={styles.itemCard}>
          <Text style={styles.itemName}>{item.foodName}</Text>
          <Text>Qty: {item.quantity}</Text>
          <Text>€{item.unitPrice.toFixed(2)}</Text>
        </View>
      ))}

      {/* DISCOUNTS */}
      {discounts.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Discounts</Text>
          {discounts.map((d, index) => (
            <View key={index} style={styles.discountCard}>
              <Text>{d.discountName}</Text>
              <Text>-€{d.discountAmount}</Text>
            </View>
          ))}
        </>
      )}

      {/* TOTAL */}
      <View style={styles.totalCard}>
        <Text>Subtotal: €{currentOrder.subtotal!.toFixed(2)}</Text>
        <Text>Discount: -€{currentOrder.discountTotal!.toFixed(2)}</Text>
        <Text style={styles.total}>
          Total: €{currentOrder.total!.toFixed(2)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#f7f7f7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  label: {
    fontWeight: "bold",
    marginTop: 8,
  },
  value: {
    marginBottom: 4,
  },
  itemCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemName: {
    fontWeight: "bold",
  },
  discountCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  totalCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
  },
  total: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
});
