import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import TransactionItem from "@/components/TransactionItem";
import { formatCurrency } from "@/utils/format";
import * as Haptics from "expo-haptics";

export default function PendingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getPendingTransactions, updateTransaction } = useFinance();
  const pending = getPendingTransactions();
  const total = pending.reduce((s, t) => s + t.amount, 0);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const markPaid = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateTransaction(id, { status: "paid" });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} color={colors.foreground} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Pendientes</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}>
        {pending.length > 0 && (
          <View style={[styles.totalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total pendiente</Text>
            <Text style={[styles.totalAmount, { color: colors.expense }]}>{formatCurrency(total)}</Text>
          </View>
        )}
        {pending.map((t) => (
          <View key={t.id} style={styles.txWrapper}>
            <TransactionItem transaction={t} />
            <TouchableOpacity
              style={[styles.payBtn, { backgroundColor: colors.income }]}
              onPress={() => Alert.alert("Marcar como pagado", `¿Marcar "${t.description}" como pagado?`, [
                { text: "Cancelar", style: "cancel" },
                { text: "Pagado", onPress: () => markPaid(t.id) },
              ])}
            >
              <Feather name="check" size={14} color="#fff" />
              <Text style={styles.payBtnText}>Marcar pagado</Text>
            </TouchableOpacity>
          </View>
        ))}
        {pending.length === 0 && (
          <View style={styles.empty}>
            <Feather name="check-circle" size={48} color={colors.income} />
            <Text style={[styles.emptyText, { color: colors.foreground }]}>Todo al día</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>No tienes pagos pendientes</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  totalBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, alignItems: "center" },
  totalLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  totalAmount: { fontSize: 28, fontFamily: "Inter_700Bold", marginTop: 4 },
  txWrapper: { marginBottom: 8 },
  payBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 8, paddingVertical: 8, marginTop: 4 },
  payBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
