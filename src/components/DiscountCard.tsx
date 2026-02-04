import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/apiClient";
import { selectUser } from "../features/auth/authSelectors";
import {
  applyDiscount,
  fetchAvailableDiscounts,
} from "../features/discount/discountSlice";
import { AppDispatch } from "../store";
import { colors } from "../theme/colors";

type DiscountCardProps = {
  id?: number;
  title: string;
  description: string;
  imageUrl: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  startsAt: Date;
  endsAt: Date;
  minOrderValue: number;
  stackable: boolean;
  onActivate?: () => void;
  activating?: boolean;
  userId?: string;
};

const DiscountCard = ({
  id,
  title,
  imageUrl,
  description,
  type,
  value,
  startsAt,
  endsAt,
  minOrderValue,
  stackable,
  onActivate,
  userId,
  activating = false,
}: DiscountCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);

  const deleteDiscount = () => {
    api.delete(`/api/discounts/admin/${id}`);
    Alert.alert("Deleted discount");
    dispatch(fetchAvailableDiscounts());
  };

  const useSelectedDiscount = () => {
    console.log(userId);
    console.log(id);
    if (userId && id) {
      console.log("I ran: ", userId);
      const userNum = parseInt(userId);
      dispatch(applyDiscount({ discountId: id, userId: userNum }));
    }
    setApplyDiscountText("USED");
  };

  const [applyDiscountText, setApplyDiscountText] = useState("USE");

  const discountLabel =
    type === "PERCENTAGE" ? `${value}% OFF` : `€${value} OFF`;

  return (
    <View style={styles.wrapper}>
      {/* Ticket cut */}
      <View style={styles.cutLeft} />
      <View style={styles.cutRight} />

      <View style={styles.container}>
        {/* Image */}
        <Image source={{ uri: imageUrl }} style={styles.image} />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.discountValue}>{discountLabel}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.meta}>
            <Text style={styles.metaText}>Min order: €{minOrderValue}</Text>
            <Text style={styles.metaText}>
              {startsAt.toLocaleDateString()} – {endsAt.toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.footer}>
            {stackable && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>STACKABLE</Text>
              </View>
            )}

            {onActivate && (
              <TouchableOpacity
                style={[
                  styles.activateBtn,
                  activating && styles.activateBtnDisabled,
                ]}
                onPress={onActivate}
                disabled={activating}
                activeOpacity={0.8}
              >
                <Text style={styles.activateText}>
                  {activating ? "ACTIVATING..." : "ACTIVATE"}
                </Text>
              </TouchableOpacity>
            )}
            {user?.role === "ADMIN" && (
              <TouchableOpacity
                style={[
                  styles.activateBtn,
                  activating && styles.activateBtnDisabled,
                ]}
                onPress={deleteDiscount}
                disabled={activating}
                activeOpacity={0.8}
              >
                <Text style={styles.activateText}>
                  {activating ? "DELETING..." : "DELETE"}
                </Text>
              </TouchableOpacity>
            )}

            {user?.role === "ADMIN" && (
              <TouchableOpacity
                style={[
                  styles.activateBtn,
                  activating && styles.activateBtnDisabled,
                ]}
                onPress={useSelectedDiscount}
                disabled={activating}
                activeOpacity={0.8}
              >
                <Text style={styles.activateText}>{applyDiscountText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
    position: "relative",
    margin: 8,
  },

  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
  },

  image: {
    width: 90,
    height: "100%",
    resizeMode: "cover",
  },

  content: {
    flex: 1,
    padding: 14,
  },

  discountValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#d32f2f",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },

  description: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  meta: {
    marginTop: 8,
  },

  metaText: {
    fontSize: 12,
    color: "#888",
  },

  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#4caf50",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },

  activateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#d32f2f",
  },

  activateBtnDisabled: {
    opacity: 0.6,
  },

  activateText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Ticket cutouts
  cutLeft: {
    position: "absolute",
    left: -10,
    top: "40%",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    zIndex: 10,
  },

  cutRight: {
    position: "absolute",
    right: -10,
    top: "40%",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    zIndex: 10,
  },
});

export default DiscountCard;
