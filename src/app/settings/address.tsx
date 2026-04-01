import api from "@/src/api/apiClient";
import BackButton from "@/src/components/BackButton";
import { fetchUserAddresses } from "@/src/features/auth/authSlice";
import { Address } from "@/src/features/auth/authTypes";
import { AppDispatch } from "@/src/store";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Addresses() {
  const dispatch = useDispatch<AppDispatch>();

  const addresses = useSelector(
    (state: any) => state.auth.user?.addresses || [],
  );

  useEffect(() => {
    dispatch(fetchUserAddresses());
  }, [dispatch]);

  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleAddAddress = () => {
    if (!label || !street || !city || !postalCode) return;

    const newAddress = {
      label,
      street,
      city,
      postalCode,
      isDefault,
    };

    api.post("/api/me/address", newAddress).then((response) => {
      alert(response.data.message || "Address added successfully!");
      dispatch(fetchUserAddresses());
    });

    // reset inputs
    setLabel("");
    setStreet("");
    setCity("");
    setPostalCode("");
    setIsDefault(false);
  };

  const handleDelete = (id: string) => {
    api.delete(`/api/me/address/${id}`).then((response) => {
      alert(response.data.message || "Address removed successfully!");
      dispatch(fetchUserAddresses());
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <Text style={styles.title}>Addresses</Text>

      {/* Existing Addresses */}
      {addresses.length === 0 && (
        <Text style={{ color: "#777", fontStyle: "italic", marginBottom: 20 }}>
          No addresses found. Add one below!
        </Text>
      )}
      {addresses.length > 0 && (
        <View style={styles.card}>
          {addresses.map((addr: Address) => (
            <View key={addr.id} style={styles.addressItem}>
              <View>
                {addr.isDefault && <Text style={styles.default}>Default</Text>}
                <Text style={styles.addressLabel}>{addr.label}</Text>
                <Text style={styles.addressText}>
                  {addr.street}, {addr.city} {addr.postalCode}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(addr.id.toString())}
              >
                <Text style={styles.delete}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      {/* Add New Address */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add New Address</Text>

        <Text style={styles.label}>Label</Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          style={styles.input}
          placeholder="Home, Work..."
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Street</Text>
        <TextInput
          value={street}
          onChangeText={setStreet}
          style={styles.input}
          placeholder="Street name and number"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          style={styles.input}
          placeholder="City"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Postal Code</Text>
        <TextInput
          value={postalCode}
          onChangeText={setPostalCode}
          style={styles.input}
          placeholder="Postal Code"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />

        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}
        >
          <TouchableOpacity
            onPress={() => setIsDefault((prev) => !prev)}
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#E63946",
                backgroundColor: isDefault ? "#E63946" : "transparent",
                marginRight: 8,
              }}
            />
            <Text style={{ color: "#1C1C1E" }}>Set as default</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
        <Text style={styles.addText}>Add Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1C1C1E",
  },

  default: {
    backgroundColor: "#E63946",
    color: "#FFF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10,
    marginBottom: 4,
  },

  card: {
    backgroundColor: "#F6F8FA",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1C1C1E",
  },

  label: {
    fontSize: 13,
    color: "#777",
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },

  addressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  addressLabel: {
    fontWeight: "600",
    color: "#1C1C1E",
  },

  addressText: {
    color: "#666",
    fontSize: 13,
  },

  delete: {
    color: "#E63946",
    fontWeight: "500",
  },

  addButton: {
    backgroundColor: "#E63946",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  addText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
