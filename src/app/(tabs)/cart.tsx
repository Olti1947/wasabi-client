import api from "@/src/api/apiClient";
import CartItemComponent from "@/src/components/CartItemComponent";
import CurrentOrder from "@/src/components/CurrentOrder";
import OrderComponent from "@/src/components/OrderComponent";
import SushiAlert from "@/src/components/SushiAlert";
import {
  selectCartItems,
  selectCartTotalPrice,
} from "@/src/features/cart/cartSelectors";
import { fetchCurrentOrder, resetCart } from "@/src/features/cart/cartSlice";
import { CartItemRequest } from "@/src/features/cart/cartTypes";
import {
  getAvailableCoupons,
  previewCheckout,
  selectCoupon,
} from "@/src/features/checkout/checkoutSlice";
import { fetchOrders } from "@/src/features/order/orderSlice";
import { AppDispatch, RootState } from "@/src/store";
import { colors } from "@/src/theme/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector(selectCartItems);
  const orders = useSelector((state: RootState) => state.order);
  const currentOrder = useSelector(
    (state: RootState) => state.cart.currentOrder,
  );
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (cartItems.length === 0) return;

    const payload: CartItemRequest[] = cartItems.map((item) => ({
      foodItemId: item.id,
      quantity: item.quantity,
    }));

    dispatch(getAvailableCoupons(payload));
  }, [cartItems, dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) return;
      if (!user) return;
      if (user.role === "USER") {
        dispatch(
          getAvailableCoupons(
            cartItems.map((item) => ({
              foodItemId: item.id,
              quantity: item.quantity,
            })),
          ),
        );
        dispatch(fetchCurrentOrder());
        return;
      }
      dispatch(fetchOrders());
    }, [authLoading, user, dispatch]),
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (user.role === "USER") return;

    dispatch(fetchOrders());
  }, [dispatch]);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState("");
  const phonePattern = /^\d{3} \d{3} \d{3}$/;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [uiTotal, setUiTotal] = useState(0);
  const [additionalComments, setAdditionalComments] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const setSelectedCoupon = (couponId: number | null) => {
    dispatch(selectCoupon(couponId));
  };

  const { preview, availableCoupons, selectedCouponId, loading, error } =
    useSelector((state: RootState) => state.checkout);

  const couponItems = availableCoupons.map((coupon) => ({
    label: `${coupon.title} - ${coupon.value}`,
    value: coupon.id,
  }));

  useEffect(() => {
    setSelectedCoupon(value);
    if (selectedCouponId && cartItems.length > 0) {
      const payload = {
        items: cartItems.map((item) => ({
          foodItemId: item.id,
          quantity: item.quantity,
        })),
        discountId: selectedCouponId,
      };
      dispatch(previewCheckout(payload));
    }
  }, [selectedCouponId, value, cartItems, dispatch]);

  useEffect(() => {
    if (cartItems.length > 0 && !preview) {
      setUiTotal(
        cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
      );
    }
  }, [cartItems, preview]);

  const totalPrice = useSelector(selectCartTotalPrice);

  const handlePlaceOrder = () => {
    const orderRequest = {
      items: cartItems.map((item) => {
        return {
          foodItemId: item.id,
          quantity: item.quantity,
        };
      }),
      phoneNumber: phone,
      address: address,
      discountId: selectedCouponId ? selectedCouponId : null,
      comment: additionalComments ? additionalComments : null,
    };

    if (!phone || !address) {
      setFormError("Please enter phone number and delivery address.");
      console.log("Phone error");
      return;
    }

    if (!phonePattern.test(phone)) {
      setFormError(
        "Phone number must be in the format XXX XXX XXX (e.g., 045 123 456).",
      );
      return;
    }
    setFormError("");
    try {
      api.post("/api/checkout", orderRequest);
      setAlertTitle("Order Placed");
      setAlertMessage(
        "Your order has been placed successfully! The restaurant will contact you for confirmation. Thank you for your order!",
      );
      setAlertVisible(true);
      setPhone("");
      setAddress("");
      setAdditionalComments("");
    } catch (error) {
      setAlertTitle("Order Failed");
      setAlertMessage("Failed to place order. Please try again.");
      setAlertVisible(true);
      setFormError("Failed to place order. Please try again.");
    }
  };

  const formatKosovoPhone = (input: string) => {
    // Remove any non-digit characters
    const digits = input.replace(/\D/g, "");
    // Insert spaces after 3 and 6 digits
    const part1 = digits.substring(0, 3);
    const part2 = digits.substring(3, 6);
    const part3 = digits.substring(6, 9);

    return [part1, part2, part3].filter(Boolean).join(" ");
  };

  if (
    currentOrder &&
    currentOrder.orderStatus !== "COMPLETED" &&
    currentOrder.orderStatus !== "CANCELLED" &&
    currentOrder.orderStatus !== "REFUNDED" &&
    user?.role === "USER"
  ) {
    return <CurrentOrder />;
  }

  if (cartItems.length === 0 && user?.role === "USER") {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      </View>
    );
  }

  if (user?.role === "USER") {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: Platform.OS === "ios" ? 50 : 20,
        }}
      >
        <SushiAlert
          title={alertTitle}
          message={alertMessage}
          visible={alertVisible}
          onConfirm={() => {
            setAlertVisible(false);
            dispatch(fetchCurrentOrder());
            dispatch(resetCart());
          }}
        />

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
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => setPhone(formatKosovoPhone(text))}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Delivery Address"
              placeholderTextColor="#999"
              multiline
              value={address}
              onChangeText={setAddress}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Additional Comments (optional)"
              placeholderTextColor="#999"
              multiline
              value={additionalComments}
              onChangeText={setAdditionalComments}
            />

            {availableCoupons.length > 0 ? (
              <DropDownPicker
                open={open}
                value={value}
                items={couponItems}
                setOpen={setOpen}
                setValue={setValue}
                placeholder="Select a coupon"
                disabled={couponItems.length === 0}
                listMode="SCROLLVIEW"
                style={styles.dropdown}
              />
            ) : (
              <Text>No coupons available</Text>
            )}

            {preview ? (
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>
                  Subtotal: €{preview.subtotal.toFixed(2)}
                </Text>
                <Text style={styles.discountText}>
                  Discount: €{preview.discount.toFixed(2)}
                </Text>
                <Text style={styles.totalPrice}>
                  Total: €{preview.total.toFixed(2)}
                </Text>
              </View>
            ) : (
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>
                  Subtotal: €{uiTotal.toFixed(2)}
                </Text>
                <Text style={styles.discountText}>Discount: €{0}</Text>
                <Text style={styles.totalPrice}>
                  Total: €{uiTotal.toFixed(2)}
                </Text>
              </View>
            )}

            {formError ? (
              <Text style={{ color: "red", marginBottom: 10 }}>
                {formError}
              </Text>
            ) : null}
            <TouchableOpacity
              style={styles.orderButton}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.orderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  } else if (user?.role === "ADMIN") {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: Platform.OS === "ios" ? 50 : 20,
        }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {orders.items.map((item, index) => {
            return (
              <OrderComponent
                key={index}
                orderId={item.orderId}
                status={item.orderStatus}
                total={item.total}
                createdAt={item.createdAt}
                userEmail={item.userEmail}
                items={item.items}
                phoneNumber={item.phoneNumber}
                address={item.address}
                comment={item.comment}
                onPress={() => router.push(`/order/${item.orderId}` as any)}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  }
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
  dropdown: {
    borderColor: "#ccc",
  },
  previewContainer: {
    marginTop: 10,
  },
  previewText: {
    fontSize: 16,
  },
  discountText: {
    fontSize: 16,
    color: colors.accent,
  },
});
