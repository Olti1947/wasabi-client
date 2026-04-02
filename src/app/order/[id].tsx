import api from "@/src/api/apiClient";
import BackButton from "@/src/components/BackButton";
import SushiAlert from "@/src/components/SushiAlert";
import { Order, OrderStatus } from "@/src/features/order/orderTypes";
import { colors } from "@/src/theme/colors";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrderDetails() {
  const { id } = useLocalSearchParams();

  const orderId = Array.isArray(id) ? id[0] : id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        setLoading(true);
        const response = await api.get(`/api/admin/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError("Failed to load order.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const updateOrderStatus = async (status: OrderStatus) => {
    if (!order) return;

    try {
      setUpdating(true);

      const response = await api.put(
        `/api/admin/orders/${order.orderId}/status`,
        {
          status,
        },
      );

      setAlertTitle("Status Updated");
      setAlertMessage(
        response.data.message || "Order status updated successfully!",
      );
      setAlertVisible(true);

      // optimistic update
      setOrder((prev) => (prev ? { ...prev, orderStatus: status } : prev));
    } catch (err: any) {
      setAlertTitle("Update Failed");
      setAlertMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to update order status.",
      );
      setAlertVisible(true);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "green";
      case "READY":
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
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading order...</Text>
      </View>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  // ⚠️ No data
  if (!order) {
    return (
      <View style={styles.center}>
        <Text>No order found.</Text>
      </View>
    );
  }

  const items = order.items ?? [];
  const discounts = order.discounts ?? [];

  return (
    <ScrollView style={styles.container}>
      <SushiAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
      />
      <View
        style={{
          height: 60,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
          paddingHorizontal: 0,
        }}
      >
        <BackButton />
      </View>
      {/* HEADER */}
      <Text style={styles.title}>Order #{order.orderId}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text
          style={[styles.value, { color: getStatusColor(order.orderStatus!) }]}
        >
          {order.orderStatus}
        </Text>

        <Text style={styles.label}>Customer</Text>
        <Text style={styles.value}>{order.userEmail}</Text>

        <Text style={styles.label}>Created</Text>
        <Text style={styles.value}>
          {new Date(order.createdAt!).toLocaleString()}
        </Text>
      </View>

      {/* STATUS ACTIONS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Update Status</Text>

        <View style={styles.buttonRow}>
          {[
            "CREATED",
            "IN_PROGRESS",
            "DELIVERY",
            "READY",
            "CANCELLED",
            "COMPLETED",
            "REFUNDED",
          ].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                order.orderStatus === status && styles.activeButton,
              ]}
              onPress={() => updateOrderStatus(status as OrderStatus)}
              disabled={updating}
            >
              <Text
                style={{
                  color: order.orderStatus === status ? "#fff" : "#000",
                }}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {updating && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 10 }}
          />
        )}
      </View>

      {/* DELIVERY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{order.phoneNumber}</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{order.address}</Text>

        {order.comment && (
          <>
            <Text style={styles.label}>Comment</Text>
            <Text style={styles.value}>{order.comment}</Text>
          </>
        )}
      </View>

      {/* ITEMS */}
      <Text style={styles.sectionTitle}>Items</Text>

      {items.length > 0 ? (
        items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.foodName}</Text>
            <Text>Qty: {item.quantity}</Text>
            <Text>€{item.unitPrice.toFixed(2)}</Text>
          </View>
        ))
      ) : (
        <Text>No items</Text>
      )}

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

      {/* TOTALS */}
      <View style={styles.totalCard}>
        <Text>Subtotal: €{order.subtotal!.toFixed(2)}</Text>
        <Text>Discount: -€{order.discountTotal!.toFixed(2)}</Text>
        <Text style={styles.total}>Total: €{order.total!.toFixed(2)}</Text>
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
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  activeButton: {
    backgroundColor: colors.primary,
  },
});
