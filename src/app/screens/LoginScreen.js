import {
  selectError,
  selectIsAuthenticated,
} from "@/src/features/auth/authSelectors";
import { colors } from "@/src/theme/colors";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { loginUser } from "../../features/auth/authSlice";

// Prevent splash screen from auto-hiding on app load
// SplashScreen.preventAutoHideAsync();

export const LoginScreen = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsAuthenticated);
  const { loading = false } = useSelector((state) => state.auth || {});
  const error = useSelector(selectError);

  const loginValidationSchema = yup.object().shape({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Email Address is Required"),
    password: yup
      .string()
      .min(6, ({ min }) => `Password must be at least ${min} characters`)
      .required("Password is required"),
  });

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const resultAction = await dispatch(loginUser(values));
      if (loginUser.fulfilled.match(resultAction)) {
        console.log("✅ Login successful:", resultAction.payload);
        router.replace("/(tabs)");
      } else {
        console.log(
          "❌ Login failed:",
          resultAction.payload || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Hide splash screen when app is ready
  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        // await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded || !appIsReady) {
    // Keep splash screen visible until fonts and other startup tasks are ready
    return null;
  }

  if (isLoggedIn) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={{ color: "#fff", fontSize: 18, marginTop: 100 }}>
          You are already logged in
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background Image */}
      <Image
        style={styles.image}
        source={require("../../assets/loginBackground.png")}
        resizeMode="cover"
      />

      {/* Header Area */}
      <View style={styles.headerArea}>
        <Text style={styles.title}>Log In</Text>
        <Text style={styles.paragraph}>
          Please sign in to your existing account
        </Text>
      </View>

      {/* Bottom Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoiding}
      >
        <View
          style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <Formik
              validationSchema={loginValidationSchema}
              initialValues={{ email: "", password: "" }}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isValid,
                isSubmitting,
              }) => (
                <>
                  <Text style={styles.fieldPlaceHolder}>EMAIL</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={"#999"}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      value={values.email}
                    />
                  </View>
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <Text style={styles.fieldPlaceHolder}>PASSWORD</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={"#999"}
                      secureTextEntry
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      value={values.password}
                    />
                  </View>
                  {errors.password && touched.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  <TouchableOpacity onPress={() => router.navigate("Forget")}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                  </TouchableOpacity>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      (!isValid || isSubmitting) && { opacity: 0.7 },
                    ]}
                    onPress={handleSubmit}
                    disabled={!isValid || isSubmitting}
                  >
                    <Text style={styles.buttonText}>
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/register")}
                  >
                    <Text style={styles.signUp}>
                      Don’t have an account?{" "}
                      <Text style={styles.signUpLink}>Sign Up</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  headerArea: {
    position: "absolute",
    top: "15%",
    zIndex: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    fontFamily: "Poppins-Bold",
  },
  paragraph: {
    fontSize: 16,
    color: colors.white,
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  keyboardAvoiding: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.white,
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  fieldPlaceHolder: {
    fontFamily: "Poppins-Regular",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#e4e4e4ff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: "Poppins-Regular",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
    color: colors.primary,
    fontFamily: "Poppins-Regular",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E90FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
  },
  signUp: {
    color: "#000",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  signUpLink: {
    color: colors.primary,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
  },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginBottom: 10,
    fontFamily: "Poppins-Regular",
  },
});
