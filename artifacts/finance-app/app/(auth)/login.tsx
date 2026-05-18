import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!email || !password) { setError("Completa todos los campos"); return; }
    setLoading(true);
    setError("");
    const fn = isSignUp ? signUp : signIn;
    const { error: err } = await fn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary + "22" }]}>
            <Text style={[styles.logoText, { color: colors.primary }]}>$</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>FinanzasApp</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {isSignUp ? "Crea tu cuenta" : "Bienvenido de vuelta"}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Contraseña"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={handle}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
                {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setError(""); }} style={styles.switchBtn}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
              {isSignUp ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
              <Text style={{ color: colors.primary }}>{isSignUp ? "Iniciar sesión" : "Registrarse"}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 40 },
  logoBox: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  logoText: { fontSize: 36, fontFamily: "Inter_700Bold" },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular" },
  form: { gap: 14 },
  inputWrapper: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16 },
  input: { height: 52, fontSize: 15, fontFamily: "Inter_400Regular" },
  error: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  btn: { height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  switchBtn: { alignItems: "center", paddingVertical: 8 },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
