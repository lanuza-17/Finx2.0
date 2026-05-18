import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import MonthSelector from "@/components/MonthSelector";
import { formatCurrency } from "@/utils/format";

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getMonthlyTransactions, getMonthlyIncome, getMonthlyExpenses, categories } = useFinance();

  const monthly = getMonthlyTransactions();
  const income = getMonthlyIncome();
  const expenses = getMonthlyExpenses();
  const balance = income - expenses;

  const catExpenses = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthly) {
      if ((t.type === "expense" || t.type === "card_expense") && t.status === "paid") {
        const key = t.category_id ?? "sin-categoría";
        map.set(key, (map.get(key) ?? 0) + t.amount);
      }
    }
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return { catId, name: cat?.name ?? "Sin categoría", color: cat?.color ?? colors.mutedForeground, amount };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [monthly, categories]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const total = catExpenses.reduce((s, c) => s + c.amount, 0) || 1;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Estadísticas</Text>
      </View>
      <MonthSelector />

      {/* Income vs Expenses */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Resumen del mes</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Ingresos</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>{formatCurrency(income)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Gastos</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>{formatCurrency(expenses)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Balance</Text>
            <Text style={[styles.summaryValue, { color: balance >= 0 ? colors.income : colors.expense }]}>{balance >= 0 ? "+" : ""}{formatCurrency(balance)}</Text>
          </View>
        </View>
        {/* Bar */}
        <View style={styles.barRow}>
          <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
            {income + expenses > 0 && (
              <View style={{ flexDirection: "row", height: "100%" }}>
                <View style={{ width: `${(income / (income + expenses)) * 100}%` as any, backgroundColor: colors.income, borderRadius: 4 }} />
                <View style={{ flex: 1, backgroundColor: colors.expense, borderRadius: 4 }} />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* By Category */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Gastos por categoría</Text>
        {catExpenses.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>Sin gastos este mes</Text>
        ) : (
          catExpenses.map((c) => (
            <View key={c.catId} style={styles.catRow}>
              <View style={[styles.catDot, { backgroundColor: c.color }]} />
              <Text style={[styles.catName, { color: colors.foreground }]}>{c.name}</Text>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <View style={[styles.catBar, { backgroundColor: colors.muted }]}>
                  <View style={[styles.catFill, { backgroundColor: c.color, width: `${(c.amount / total) * 100}%` as any }]} />
                </View>
              </View>
              <Text style={[styles.catAmount, { color: colors.foreground }]}>{formatCurrency(c.amount)}</Text>
              <Text style={[styles.catPct, { color: colors.mutedForeground }]}>{Math.round((c.amount / total) * 100)}%</Text>
            </View>
          ))
        )}
      </View>

      {/* Recent transactions list */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Últimas transacciones</Text>
        {monthly.slice(0, 8).map((t) => (
          <View key={t.id} style={[styles.txRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.txDesc, { color: colors.foreground }]} numberOfLines={1}>{t.description}</Text>
            <Text style={[styles.txAmount, { color: (t.type === "expense" || t.type === "card_expense") ? colors.expense : colors.income }]}>
              {(t.type === "expense" || t.type === "card_expense") ? "-" : "+"}{formatCurrency(t.amount)}
            </Text>
          </View>
        ))}
        {monthly.length === 0 && <Text style={[styles.empty, { color: colors.mutedForeground }]}>Sin transacciones</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  summaryItem: { alignItems: "center", gap: 4 },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  barRow: { height: 8 },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  catRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: 13, fontFamily: "Inter_400Regular", width: 90, marginLeft: 8 },
  catBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  catFill: { height: "100%", borderRadius: 3 },
  catAmount: { fontSize: 13, fontFamily: "Inter_600SemiBold", width: 70, textAlign: "right" },
  catPct: { fontSize: 11, fontFamily: "Inter_400Regular", width: 32, textAlign: "right" },
  txRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 1 },
  txDesc: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  txAmount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  empty: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 16 },
});
