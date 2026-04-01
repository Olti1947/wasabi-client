import api from "@/src/api/apiClient";
import BackButton from "@/src/components/BackButton";
import { selectUser } from "@/src/features/auth/authSelectors";
import { fetchUserInfo } from "@/src/features/auth/authSlice";
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

export default function PersonalInfo() {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, []);

  const [name, setName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = () => {
    const request = {
      firstName: name,
      lastName: lastName,
      email: email,
      phone: phone,
    };

    try {
      api.post("/api/me/edit", request).then((response) => {
        // Optionally, you can update the user in the Redux store here
        // dispatch(updateUser(response.data));
        alert(response.data.message || "Profile updated successfully!");
      });
      dispatch(fetchUserInfo());
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      {/* Header */}
      <Text style={styles.title}>Personal Info</Text>

      {/* Profile Card */}
      <View style={styles.card}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
          placeholder="Enter your last name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholder="Enter your phone number (+383 44 123 456)"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
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

  card: {
    backgroundColor: "#F6F8FA",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
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

  saveButton: {
    backgroundColor: "#E63946", // sushi red
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  saveText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
