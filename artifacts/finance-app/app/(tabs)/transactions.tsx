import React, { useState, useMemo } from "react";
import {
  View, Text, SectionList, StyleSheet, TouchableOpacity,
  RefreshControl, Platform, Modal, Pressable,
} from "react-native";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import MonthSelector from "@/components/MonthSelector";
import TransactionItem from "@/components/TransactionItem";
import SummaryCard from "@/components/SummaryCard";
import { formatCurrency, formatDayShort, isToday } from "@/utils/format";

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loading, refreshAll, getMonthlyTransactions, getTotalBalance, getMonthlyIncome, accounts, creditCards } = useFinance();

  const monthly = getMonthlyTransactions();

  const sections = useMemo(() => {
    const map = new Map<string, typeof monthly>();
    for (const t of monthly) {
      const key = t.date.substring(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, data]) => ({
        date,
        data,
        dayTotal: data.filter((t) => t.type === "expense" || t.type === "card_expense").reduce((s, t) => s + t.amount, 0),
      }));
  }, [monthly]);

  const totalBalance = getTotalBalance();
  const income = getMonthlyIncome();
  const walletBalance = accounts.find((a) => a.type === "wallet")?.balance ?? accounts[0]?.balance ?? 0;
  const cardBalance = creditCards.reduce((s, c) => s + c.balance, 0);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <SectionList
      sections={sections}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshAll} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <View style={[styles.header, { paddingTop: topInset + 8 }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>Transacciones</Text>
          </View>
          <MonthSelector />
          <View style={[styles.statsBox, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16, marginBottom: 12 }]}>
            <View style={styles.statsRow}>
              <SummaryCard label="Saldo actual" value={totalBalance} icon="repeat" iconLib="feather" valueColor={colors.income} small />
              <SummaryCard label="Ingresos" value={income} icon="trending-up" valueColor={colors.income} small />
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statsRow}>
              <SummaryCard label="Cartera" value={walletBalance} icon="wallet-outline" iconLib="mci" valueColor={colors.expense} small />
              <SummaryCard label="Tarjeta" value={cardBalance} icon="credit-card" valueColor={colors.expense} small />
            </View>
          </View>
        </View>
      }
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => {
        const d = new Date(section.date + "T00:00:00");
        const day = d.getDate();
        const month = `${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
        const weekday = formatDayShort(section.date);
        const today = isToday(section.date);
        return (
          <View style={[styles.sectionHeader, { marginHorizontal: 16 }]}>
            <View style={[styles.dayCircle, { backgroundColor: today ? colors.primary : colors.card }]}>
              <Text style={[styles.dayNum, { color: today ? colors.primaryForeground : colors.foreground }]}>{day}</Text>
            </View>
            <View style={styles.sectionInfo}>
              {today && <View style={[styles.todayBadge, { backgroundColor: colors.primary }]}><Text style={[styles.todayText, { color: colors.primaryForeground }]}>HOY</Text></View>}
              <Text style={[styles.weekday, { color: colors.mutedForeground }]}>{today ? "" : weekday}</Text>
              <Text style={[styles.monthYear, { color: colors.mutedForeground }]}>{month}</Text>
            </View>
            <Text style={[styles.dayTotal, { color: colors.expense }]}>↓ {formatCurrency(section.dayTotal)}</Text>
          </View>
        );
      }}
      renderItem={({ item }) => (
        <View style={{ marginHorizontal: 16, marginBottom: 2 }}>
          <TransactionItem transaction={item} onPress={() => router.push({ pathname: "/transaction-detail", params: { id: item.id } })} />
        </View>
      )}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statsBox: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  statsRow: { flexDirection: "row", gap: 0 },
  statsDivider: { height: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8, marginTop: 16 },
  dayCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  dayNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  todayBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  todayText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  weekday: { fontSize: 13, fontFamily: "Inter_400Regular", textTransform: "capitalize" },
  monthYear: { fontSize: 13, fontFamily: "Inter_400Regular" },
  dayTotal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
