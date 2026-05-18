import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency, formatDate } from "@/utils/format";
import * as Haptics from "expo-haptics";

export default function TransactionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, deleteTransaction, updateTransaction } = useFinance();
  const tx = transactions.find((t) => t.id === id);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (!tx) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.foreground }}>Transacción no encontrada</Text>
    </View>
  );

  const isExpense = tx.type === "expense" || tx.type === "card_expense";
  const amountColor = isExpense ? colors.expense : tx.type === "transfer" ? colors.blue : colors.income;

  const handleDelete = () => {
    Alert.alert("Eliminar", "¿Eliminar esta transacción?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await deleteTransaction(tx.id);
        router.back();
      }},
    ]);
  };

  const toggleStatus = () => {
    const newStatus = tx.status === "paid" ? "pending" : "paid";
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateTransaction(tx.id, { status: newStatus });
  };

  const typeLabel: Record<string, string> = {
    expense: "Gasto",
    income: "Ingreso",
    card_expense: "Gasto en Tarjeta",
    transfer: "Transferencia",
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} color={colors.foreground} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Detalle</Text>
        <TouchableOpacity onPress={handleDelete}><Feather name="trash-2" size={22} color={colors.destructive} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}>
        <View style={[styles.amountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.typeBadge, { backgroundColor: amountColor + "22" }]}>
            <Text style={[styles.typeLabel, { color: amountColor }]}>{typeLabel[tx.type] ?? tx.type}</Text>
          </View>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isExpense ? "-" : tx.type === "transfer" ? "" : "+"}{formatCurrency(tx.amount)}
          </Text>
          <Text style={[styles.description, { color: colors.foreground }]}>{tx.description}</Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Fecha", value: formatDate(tx.date) },
            { label: "Estado", value: tx.status === "paid" ? "Pagado" : "Pendiente", color: tx.status === "paid" ? colors.income : colors.warning },
            { label: "Categoría", value: tx.category?.name ?? "Sin categoría" },
            { label: tx.card ? "Tarjeta" : "Cuenta", value: tx.card?.name ?? tx.account?.name ?? "—" },
          ].map((row, i) => (
            <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.detailValue, { color: row.color ?? colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {tx.status === "pending" && (
          <TouchableOpacity style={[styles.payBtn, { backgroundColor: colors.income }]} onPress={toggleStatus}>
            <Feather name="check-circle" size={18} color="#fff" />
            <Text style={styles.payBtnText}>Marcar como pagado</Text>
          </TouchableOpacity>
        )}
        {tx.status === "paid" && (
          <TouchableOpacity style={[styles.payBtn, { backgroundColor: colors.warning }]} onPress={toggleStatus}>
            <Feather name="clock" size={18} color="#fff" />
            <Text style={styles.payBtnText}>Marcar como pendiente</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  amountCard: { borderRadius: 14, borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginBottom: 12 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  typeLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  amount: { fontSize: 40, fontFamily: "Inter_700Bold" },
  description: { fontSize: 16, fontFamily: "Inter_500Medium", textAlign: "center" },
  detailCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  detailLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payBtn: { borderRadius: 12, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  payBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
