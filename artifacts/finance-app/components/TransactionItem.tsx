import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Transaction } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/format";

interface Props {
  transaction: Transaction;
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<string, { lib: "feather" | "mci"; name: string }> = {
  food: { lib: "mci", name: "food" },
  transport: { lib: "feather", name: "navigation" },
  entertainment: { lib: "feather", name: "film" },
  health: { lib: "feather", name: "heart" },
  shopping: { lib: "feather", name: "shopping-cart" },
  education: { lib: "feather", name: "book" },
  salary: { lib: "feather", name: "trending-up" },
  investment: { lib: "feather", name: "bar-chart-2" },
};

export default function TransactionItem({ transaction, onPress }: Props) {
  const colors = useColors();
  const isExpense = transaction.type === "expense" || transaction.type === "card_expense";
  const isTransfer = transaction.type === "transfer";
  const amountColor = isExpense ? colors.expense : isTransfer ? colors.blue : colors.income;
  const icon = transaction.category?.icon;
  const iconDef = icon ? CATEGORY_ICONS[icon] : null;
  const bgColor = transaction.category?.color ?? (isExpense ? "#ff333344" : "#00d4aa33");

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor: colors.card }]} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        {iconDef ? (
          iconDef.lib === "feather" ? (
            <Feather name={iconDef.name as any} size={18} color={transaction.category?.color ?? colors.primary} />
          ) : (
            <MaterialCommunityIcons name={iconDef.name as any} size={18} color={transaction.category?.color ?? colors.primary} />
          )
        ) : isTransfer ? (
          <Feather name="repeat" size={18} color={colors.blue} />
        ) : isExpense ? (
          <Feather name="arrow-down" size={18} color={colors.expense} />
        ) : (
          <Feather name="arrow-up" size={18} color={colors.income} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.desc, { color: colors.foreground }]} numberOfLines={1}>{transaction.description}</Text>
        <View style={styles.sub}>
          {transaction.card && (
            <Feather name="credit-card" size={11} color={colors.mutedForeground} />
          )}
          {transaction.account && !transaction.card && (
            <MaterialCommunityIcons name="wallet-outline" size={11} color={colors.mutedForeground} />
          )}
          <Text style={[styles.subText, { color: colors.mutedForeground }]}>
            {transaction.card?.name ?? transaction.account?.name ?? "—"}
          </Text>
          {transaction.status === "pending" && (
            <View style={[styles.pendingBadge, { borderColor: colors.warning }]}>
              <Text style={[styles.pendingText, { color: colors.warning }]}>pendiente</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {isExpense ? "-" : isTransfer ? "" : "+"}{formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  desc: { fontSize: 15, fontFamily: "Inter_500Medium" },
  sub: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  subText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  amount: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  pendingBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 4,
  },
  pendingText: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
});
