import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/format";
import * as Haptics from "expo-haptics";

export default function BudgetsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { budgets, categories, addBudget, deleteBudget, selectedMonth } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [catId, setCatId] = useState<string | null>(null);
  const [amount, setAmount] = useState("500");
  const [loading, setLoading] = useState(false);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const expenseCats = categories.filter((c) => c.type === "expense");

  const save = async () => {
    if (!catId || !parseFloat(amount)) return;
    setLoading(true);
    await addBudget({ category_id: catId, amount: parseFloat(amount), month: selectedMonth.getMonth() + 1, year: selectedMonth.getFullYear() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false); setShowAdd(false); setCatId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} color={colors.foreground} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Presupuestos</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}><Feather name="plus" size={24} color={colors.primary} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}>
        {showAdd && (
          <View style={[styles.addCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.addTitle, { color: colors.foreground }]}>Nuevo presupuesto</Text>
            <Text style={[styles.addSub, { color: colors.mutedForeground }]}>Selecciona categoría</Text>
            <View style={styles.catsGrid}>
              {expenseCats.map((c) => (
                <TouchableOpacity key={c.id} style={[styles.catChip, { backgroundColor: catId === c.id ? c.color : colors.secondary }]} onPress={() => setCatId(c.id)}>
                  <Feather name={c.icon as any} size={14} color={catId === c.id ? "#fff" : c.color} />
                  <Text style={[styles.catChipText, { color: catId === c.id ? "#fff" : colors.foreground }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.amountBox, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Límite mensual</Text>
              <Text style={[styles.amountValue, { color: colors.primary }]}>$ {amount}</Text>
            </View>
            <View style={styles.quickAmounts}>
              {["200", "500", "1000", "2000", "5000"].map((a) => (
                <TouchableOpacity key={a} style={[styles.quickBtn, { backgroundColor: amount === a ? colors.primary : colors.secondary }]} onPress={() => setAmount(a)}>
                  <Text style={[styles.quickBtnText, { color: amount === a ? colors.primaryForeground : colors.foreground }]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Guardar presupuesto</Text>}
            </TouchableOpacity>
          </View>
        )}

        {budgets.map((b) => {
          const pct = b.amount > 0 ? Math.min(100, ((b.spent ?? 0) / b.amount) * 100) : 0;
          const over = (b.spent ?? 0) > b.amount;
          return (
            <TouchableOpacity
              key={b.id}
              style={[styles.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onLongPress={() => Alert.alert("Eliminar", "¿Eliminar este presupuesto?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => deleteBudget(b.id) },
              ])}
              activeOpacity={0.8}
            >
              <View style={styles.budgetHeader}>
                <View style={[styles.catIcon, { backgroundColor: (b.category?.color ?? colors.primary) + "33" }]}>
                  <Feather name={(b.category?.icon ?? "tag") as any} size={18} color={b.category?.color ?? colors.primary} />
                </View>
                <Text style={[styles.budgetName, { color: colors.foreground }]}>{b.category?.name ?? "Categoría"}</Text>
                <Text style={[styles.budgetLimit, { color: colors.mutedForeground }]}>{formatCurrency(b.spent ?? 0)} / {formatCurrency(b.amount)}</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: over ? colors.expense : colors.primary }]} />
              </View>
              <Text style={[styles.budgetStatus, { color: over ? colors.expense : colors.mutedForeground }]}>
                {over ? `Excedido por ${formatCurrency((b.spent ?? 0) - b.amount)}` : `Disponible: ${formatCurrency(b.amount - (b.spent ?? 0))}`}
              </Text>
            </TouchableOpacity>
          );
        })}

        {budgets.length === 0 && !showAdd && (
          <View style={styles.empty}>
            <Feather name="pie-chart" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Sin presupuestos</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Define límites para tus categorías</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  addCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16, gap: 12 },
  addTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  addSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  catsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  amountBox: { borderRadius: 10, padding: 16, alignItems: "center" },
  amountLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4 },
  amountValue: { fontSize: 32, fontFamily: "Inter_700Bold" },
  quickAmounts: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  quickBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  saveBtn: { borderRadius: 10, height: 44, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  budgetCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  budgetHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  catIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  budgetName: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  budgetLimit: { fontSize: 13, fontFamily: "Inter_400Regular" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 4 },
  budgetStatus: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
