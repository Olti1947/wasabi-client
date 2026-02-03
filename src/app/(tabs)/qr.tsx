import DiscountCard from "@/src/components/DiscountCard";
import {
    selectQrCodeToken,
    selectUser,
} from "@/src/features/auth/authSelectors";
import { Discount } from "@/src/features/discount/discountTypes";
import { fetchScanInfo, resetQrCode } from "@/src/features/qrScan/qrScanSlice";
import { AppDispatch, RootState } from "@/src/store";
import { colors } from "@/src/theme/colors";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function QrRoute() {
  const qrCodeToken = useSelector(selectQrCodeToken);
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  const user = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser, loading } = useSelector(
    (state: RootState) => state.qrCode,
  );

  const scan = (qrToken: string) => {
    dispatch(fetchScanInfo(qrToken));
  };

  const scanNext = () => {
    dispatch(resetQrCode());
  };

  useEffect(() => {
    if (user?.role === "ADMIN" && !isPermissionGranted) {
      requestPermission();
    }
  }, []);

  if (!qrCodeToken) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.text}>No QR Code available.</Text>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator />;
  }

  if (user?.role === "ADMIN" && isPermissionGranted && selectedUser == null) {
    return (
      <SafeAreaView style={styles.scannerContainer}>
        {Platform.OS === "android" ? <StatusBar hidden /> : null}

        <CameraView
          style={styles.camStyle}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={({ data }) => {
            console.log(data);
            scan(data);
          }}
        />
      </SafeAreaView>
    );
  }

  if (selectedUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.email}>Email: {selectedUser.email}</Text>

        <Text style={styles.name}>
          Full Name: {selectedUser.firstName} {selectedUser.lastName}
        </Text>

        {selectedUser.discounts?.length! > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.discountsContainer}
          >
            {selectedUser.discounts!.map((item: Discount, index) => (
              <DiscountCard
                key={index}
                title={item.title}
                description={item.description}
                imageUrl={item.imageUrl}
                type={item.type}
                value={item.value}
                startsAt={new Date(item.startsAt)}
                endsAt={new Date(item.endsAt)}
                minOrderValue={item.minOrderValue}
                stackable={item.stackable}
              />
            ))}
          </ScrollView>
        )}
        <TouchableOpacity style={styles.scanButton} onPress={scanNext}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Scan Next</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (user?.role === "USER") {
    return (
      <View style={styles.notFound}>
        <QRCode value={qrCodeToken} size={220} />
        <Text style={styles.text}>Show this QR Code to the waiter</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  notFound: {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    marginTop: 20,
    fontSize: 16,
    color: colors.primary,
  },

  scannerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    rowGap: 20,
  },

  camStyle: {
    position: "absolute",
    width: 300,
    height: 300,
  },
  container: {
    padding: 10,
    marginTop: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111",
  },
  discountsContainer: {
    marginTop: 20,
    backgroundColor: colors.primary,
    maxHeight: 220,
  },
  discountItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginTop: 20,
    paddingInline: 20,
    paddingBlock: 10,
  },
});
