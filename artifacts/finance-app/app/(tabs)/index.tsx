import React, { useRef } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import MonthSelector from "@/components/MonthSelector";
import { formatCurrency } from "@/utils/format";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    loading, refreshAll, getTotalBalance, getMonthlyIncome,
    getMonthlyExpenses, accounts, creditCards, recurrences, budgets,
    getPendingTransactions, getMonthlyTransactions, transactions,
  } = useFinance();

  const totalBalance = getTotalBalance();
  const income = getMonthlyIncome();
  const expenses = getMonthlyExpenses();
  const pending = getPendingTransactions();
  const pendingTotal = pending.reduce((s, t) => s + t.amount, 0);
  const activeRecurrences = recurrences.filter((r) => r.active);
  const recurrenceTotal = activeRecurrences.reduce((s, r) => s + r.amount, 0);
  const projection = totalBalance + income - expenses;

  const walletBalance = accounts.find((a) => a.type === "wallet")?.balance ?? 0;
  const cardBalance = creditCards.reduce((s, c) => s + c.balance, 0);

  // Spending trend: last 6 months
  const now = new Date();
  const trendMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d;
  });
  const maxTrend = Math.max(1, ...trendMonths.map((m) => {
    return transactions
      .filter((t) => {
        const td = new Date(t.date + "T00:00:00");
        return td.getMonth() === m.getMonth() && td.getFullYear() === m.getFullYear()
          && (t.type === "expense" || t.type === "card_expense") && t.status === "paid";
      })
      .reduce((s, t) => s + t.amount, 0);
  }));

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshAll} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <TouchableOpacity style={[styles.syncBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="cloud" size={12} color={colors.primary} />
          <Text style={[styles.syncText, { color: colors.primary }]}>Ahora</Text>
        </TouchableOpacity>
      </View>

      <MonthSelector />

      {/* Balance Total */}
      <View style={styles.balanceSection}>
        <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Saldo en cuentas</Text>
        <Text style={[styles.balanceAmount, { color: colors.primary }]}>{formatCurrency(totalBalance)}</Text>
      </View>

      {/* Summary Row */}
      <View style={[styles.summaryRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryLabelRow}>
            <Feather name="arrow-up" size={13} color={colors.income} />
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Ingresos</Text>
          </View>
          <Text style={[styles.summaryValue, { color: colors.income }]}>{formatCurrency(income)}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <View style={styles.summaryLabelRow}>
            <MaterialCommunityIcons name="wallet-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Cartera</Text>
          </View>
          <Text style={[styles.summaryValue, { color: expenses > walletBalance ? colors.expense : colors.expense }]}>{formatCurrency(walletBalance)}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <View style={styles.summaryLabelRow}>
            <Feather name="credit-card" size={13} color={colors.mutedForeground} />
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Tarjeta</Text>
          </View>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>{formatCurrency(cardBalance)}</Text>
        </View>
      </View>

      <View style={styles.cards}>
        {/* Pendientes */}
        {pending.length > 0 && (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/pending")}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: colors.warning + "22" }]}>
                <Feather name="bell" size={18} color={colors.warning} />
                <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.badgeText}>{pending.length}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Pendientes</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{formatCurrency(pendingTotal)} a pagar</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
            <View style={[styles.cardRow, { borderTopColor: colors.border }]}>
              <View style={styles.cardRowLeft}>
                <Feather name="clock" size={13} color={colors.mutedForeground} />
                <Text style={[styles.cardRowText, { color: colors.mutedForeground }]}>{pending.length} transacciones pendientes</Text>
              </View>
              <Text style={[styles.cardRowValue, { color: colors.expense }]}>{formatCurrency(pendingTotal)}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Recurrentes */}
        {activeRecurrences.length > 0 && (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/recurrences")}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: colors.purple + "22" }]}>
                <Feather name="repeat" size={18} color={colors.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Recurrentes</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{activeRecurrences.length} recurrencia{activeRecurrences.length !== 1 ? "s" : ""} activa{activeRecurrences.length !== 1 ? "s" : ""}</Text>
              </View>
              <Text style={[styles.recurrenceAmount, { color: colors.purple }]}>{formatCurrency(recurrenceTotal)}</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        )}

        {/* Previsión */}
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.blue + "22" }]}>
              <Feather name="calendar" size={18} color={colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Previsión del Mes</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>Cuánto tendrás</Text>
            </View>
            <Text style={[styles.recurrenceAmount, { color: projection >= 0 ? colors.income : colors.expense }]}>{projection >= 0 ? "" : "-"}{formatCurrency(Math.abs(projection))}</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </View>
          <View style={[styles.projectionRows, { borderTopColor: colors.border }]}>
            <View style={styles.projRow}>
              <Text style={[styles.projLabel, { color: colors.foreground }]}>Saldo actual</Text>
              <Text style={[styles.projValue, { color: colors.foreground }]}>{formatCurrency(totalBalance)}</Text>
            </View>
            <View style={styles.projRow}>
              <View style={styles.projLabelRow}>
                <View style={[styles.projDot, { backgroundColor: colors.income }]} />
                <Text style={[styles.projLabel, { color: colors.foreground }]}>Recibes</Text>
              </View>
              <Text style={[styles.projValue, { color: colors.income }]}>{formatCurrency(income)}</Text>
            </View>
            <View style={styles.projRow}>
              <View style={styles.projLabelRow}>
                <View style={[styles.projDot, { backgroundColor: colors.expense }]} />
                <Text style={[styles.projLabel, { color: colors.foreground }]}>Gastas</Text>
              </View>
              <Text style={[styles.projValue, { color: colors.expense }]}>{formatCurrency(expenses)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Presupuestos */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/budgets")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.primary + "22" }]}>
              <MaterialCommunityIcons name="piggy-bank-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Presupuestos</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </View>
          {budgets.length === 0 ? (
            <TouchableOpacity
              style={[styles.defineBudget, { borderTopColor: colors.border }]}
              onPress={() => router.push("/budgets")}
            >
              <Feather name="plus" size={14} color={colors.primary} />
              <View>
                <Text style={[styles.defineTitle, { color: colors.primary }]}>Definir presupuesto +</Text>
                <Text style={[styles.defineSub, { color: colors.mutedForeground }]}>Define límites mensuales para tus categorías de gastos.</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : (
            budgets.slice(0, 3).map((b) => (
              <View key={b.id} style={[styles.budgetRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.budgetName, { color: colors.foreground }]}>{b.category?.name}</Text>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <View style={[styles.budgetBar, { backgroundColor: colors.muted }]}>
                    <View style={[styles.budgetFill, { backgroundColor: (b.spent ?? 0) > b.amount ? colors.expense : colors.primary, width: `${Math.min(100, ((b.spent ?? 0) / b.amount) * 100)}%` as any }]} />
                  </View>
                </View>
                <Text style={[styles.budgetValue, { color: colors.mutedForeground }]}>{formatCurrency(b.spent ?? 0)}/{formatCurrency(b.amount)}</Text>
              </View>
            ))
          )}
        </TouchableOpacity>

        {/* Tarjetas de crédito */}
        {creditCards.length > 0 && (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/cards")}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="credit-card" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Tarjetas de Crédito</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{creditCards.length} tarjeta{creditCards.length !== 1 ? "s" : ""}</Text>
              </View>
              <Text style={[styles.recurrenceAmount, { color: colors.expense }]}>{formatCurrency(cardBalance)}</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
            {creditCards.map((c) => (
              <View key={c.id} style={[styles.cardRow, { borderTopColor: colors.border }]}>
                <View style={[styles.cardRowIcon, { backgroundColor: c.color + "33" }]}>
                  <Feather name="credit-card" size={13} color={c.color} />
                </View>
                <Text style={[styles.cardRowText, { color: colors.foreground, flex: 1 }]}>{c.name}</Text>
                <Text style={[styles.cardRowValue, { color: colors.expense }]}>{formatCurrency(c.balance)}</Text>
                <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
              </View>
            ))}
          </TouchableOpacity>
        )}

        {/* Cuentas */}
        {accounts.length > 0 && (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/accounts")}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: colors.blue + "22" }]}>
                <MaterialCommunityIcons name="wallet-outline" size={18} color={colors.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Cuentas</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}</Text>
              </View>
              <Text style={[styles.recurrenceAmount, { color: colors.income }]}>{formatCurrency(totalBalance)}</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
            {accounts.map((a) => (
              <View key={a.id} style={[styles.cardRow, { borderTopColor: colors.border }]}>
                <View style={[styles.cardRowIcon, { backgroundColor: a.color + "33" }]}>
                  <MaterialCommunityIcons name="wallet-outline" size={13} color={a.color} />
                </View>
                <Text style={[styles.cardRowText, { color: colors.foreground, flex: 1 }]}>{a.name}</Text>
                <Text style={[styles.cardRowValue, { color: colors.income }]}>{formatCurrency(a.balance)}</Text>
                <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
              </View>
            ))}
          </TouchableOpacity>
        )}

        {/* Tendencia de Gastos */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.expense + "22" }]}>
              <Feather name="trending-up" size={18} color={colors.expense} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Tendencia de Gastos</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>media: {formatCurrency(expenses)}</Text>
            </View>
          </View>
          <View style={[styles.trendChart, { borderTopColor: colors.border }]}>
            {trendMonths.map((m, i) => {
              const exp = transactions
                .filter((t) => {
                  const td = new Date(t.date + "T00:00:00");
                  return td.getMonth() === m.getMonth() && td.getFullYear() === m.getFullYear()
                    && (t.type === "expense" || t.type === "card_expense") && t.status === "paid";
                })
                .reduce((s, t) => s + t.amount, 0);
              const inc = transactions
                .filter((t) => {
                  const td = new Date(t.date + "T00:00:00");
                  return td.getMonth() === m.getMonth() && td.getFullYear() === m.getFullYear()
                    && t.type === "income" && t.status === "paid";
                })
                .reduce((s, t) => s + t.amount, 0);
              const expH = Math.max(4, (exp / maxTrend) * 80);
              const incH = Math.max(4, (inc / maxTrend) * 80);
              return (
                <View key={i} style={styles.trendCol}>
                  <View style={styles.bars}>
                    <View style={[styles.bar, { height: expH, backgroundColor: colors.expense }]} />
                    <View style={[styles.bar, { height: incH, backgroundColor: colors.income }]} />
                  </View>
                  <Text style={[styles.trendLabel, { color: colors.mutedForeground }]}>
                    {m.toLocaleDateString("es", { month: "short" }).substring(0, 3)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingBottom: 4 },
  syncBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  syncText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  balanceSection: { alignItems: "center", paddingVertical: 12 },
  balanceLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  balanceAmount: { fontSize: 38, fontFamily: "Inter_700Bold" },
  summaryRow: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 16 },
  summaryItem: { flex: 1, alignItems: "center", paddingVertical: 12, gap: 4 },
  summaryLabelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  summaryDivider: { width: 1, marginVertical: 8 },
  cards: { paddingHorizontal: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", position: "relative" },
  badge: { position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#000" },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  cardRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, gap: 10 },
  cardRowIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardRowText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  cardRowValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  recurrenceAmount: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  projectionRows: { borderTopWidth: 1, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  projRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  projLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  projDot: { width: 8, height: 8, borderRadius: 4 },
  projLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  projValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  defineBudget: { flexDirection: "row", alignItems: "flex-start", padding: 14, borderTopWidth: 1, gap: 10 },
  defineTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  defineSub: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  budgetRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1 },
  budgetName: { fontSize: 12, fontFamily: "Inter_400Regular", width: 80 },
  budgetBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  budgetFill: { height: "100%", borderRadius: 2 },
  budgetValue: { fontSize: 11, fontFamily: "Inter_400Regular", width: 80, textAlign: "right" },
  trendChart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", borderTopWidth: 1, paddingHorizontal: 14, paddingTop: 16, paddingBottom: 12 },
  trendCol: { alignItems: "center", gap: 6 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  bar: { width: 10, borderRadius: 4 },
  trendLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
