import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const OPTIONS = [
  { type: "expense", icon: "arrow-down", iconLib: "feather", color: "#f85149", bg: "#f8514922", title: "Gasto", subtitle: "Registrar un gasto" },
  { type: "income", icon: "arrow-up", iconLib: "feather", color: "#3fb950", bg: "#3fb95022", title: "Ingreso", subtitle: "Registrar un ingreso" },
  { type: "card_expense", icon: "credit-card", iconLib: "feather", color: "#00d4aa", bg: "#00d4aa22", title: "Gasto en Tarjeta", subtitle: "Cargar a tarjeta de crédito" },
  { type: "transfer", icon: "repeat", iconLib: "feather", color: "#79c0ff", bg: "#79c0ff22", title: "Transferencia", subtitle: "Transferir entre cuentas" },
  { type: "recurrence", icon: "repeat", iconLib: "feather", color: "#bc8cff", bg: "#bc8cff22", title: "Nueva Recurrencia", subtitle: "Cuota fija o suscripción" },
];

export default function AddTypeSheet() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handleSelect = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
    setTimeout(() => {
      if (type === "recurrence") {
        router.push("/add-recurrence");
      } else {
        router.push({ pathname: "/add-transaction", params: { type } });
      }
    }, 100);
  };

  return (
    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        {OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={opt.type}
            style={[styles.item, i < OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => handleSelect(opt.type)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: opt.bg }]}>
              <Feather name={opt.icon as any} size={20} color={opt.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.foreground }]}>{opt.title}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{opt.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12, paddingHorizontal: 16 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  item: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
});
