import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import * as Haptics from "expo-haptics";

const COLORS = ["#00d4aa", "#3fb950", "#79c0ff", "#bc8cff", "#ffa657", "#f85149", "#e3b341", "#ff7eb6"];
const ICONS = ["shopping-cart", "coffee", "film", "heart", "book", "navigation", "home", "zap", "gift", "music", "briefcase", "tool"];

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories, addCategory, deleteCategory } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [catType, setCatType] = useState<"expense" | "income">("expense");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const save = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await addCategory({ name: name.trim(), type: catType, icon, color });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false); setShowAdd(false); setName("");
  };

  const expenses = categories.filter((c) => c.type === "expense");
  const incomes = categories.filter((c) => c.type === "income");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Categorías</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}>
        {showAdd && (
          <View style={[styles.addCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]} placeholder="Nombre de categoría" placeholderTextColor={colors.mutedForeground} value={name} onChangeText={setName} />
            <View style={styles.typeRow}>
              {(["expense", "income"] as const).map((t) => (
                <TouchableOpacity key={t} style={[styles.typePill, { backgroundColor: catType === t ? colors.primary : colors.secondary }]} onPress={() => setCatType(t)}>
                  <Text style={[styles.typePillText, { color: catType === t ? colors.primaryForeground : colors.foreground }]}>{t === "expense" ? "Gasto" : "Ingreso"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.iconsGrid}>
              {ICONS.map((ic) => (
                <TouchableOpacity key={ic} style={[styles.iconBtn, { backgroundColor: icon === ic ? color : colors.secondary }]} onPress={() => setIcon(ic)}>
                  <Feather name={ic as any} size={18} color={icon === ic ? "#fff" : colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorSelected]} onPress={() => setColor(c)} />
              ))}
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        )}

        {[{ label: "Gastos", items: expenses }, { label: "Ingresos", items: incomes }].map(({ label, items }) => (
          <View key={label}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{label.toUpperCase()}</Text>
            {items.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onLongPress={() => Alert.alert("Eliminar", `¿Eliminar "${cat.name}"?`, [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Eliminar", style: "destructive", onPress: () => deleteCategory(cat.id) },
                ])}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + "33" }]}>
                  <Feather name={cat.icon as any} size={18} color={cat.color} />
                </View>
                <Text style={[styles.catName, { color: colors.foreground }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
            {items.length === 0 && <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Sin categorías</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  addCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
  input: { borderRadius: 10, paddingHorizontal: 14, height: 46, fontSize: 15, fontFamily: "Inter_400Regular" },
  typeRow: { flexDirection: "row", gap: 8 },
  typePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  typePillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  iconsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorSelected: { borderWidth: 3, borderColor: "#fff" },
  saveBtn: { borderRadius: 10, height: 44, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  catRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8, gap: 12 },
  catIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  catName: { fontSize: 15, fontFamily: "Inter_500Medium" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", paddingVertical: 8 },
});
