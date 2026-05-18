import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import { todayStr, yesterdayStr } from "@/utils/format";
import * as Haptics from "expo-haptics";

type TxType = "expense" | "income" | "card_expense" | "transfer";

export default function AddTransactionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string }>();
  const { accounts, creditCards, categories, addTransaction } = useFinance();

  const [txType, setTxType] = useState<TxType>((params.type as TxType) ?? "expense");
  const [amount, setAmount] = useState("0.00");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayStr());
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [toAccountId, setToAccountId] = useState<string | null>(accounts[1]?.id ?? null);
  const [cardId, setCardId] = useState<string | null>(creditCards[0]?.id ?? null);
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [loading, setLoading] = useState(false);

  const filteredCats = categories.filter((c) => txType === "income" ? c.type === "income" : c.type === "expense");

  const handleSave = async () => {
    const amt = parseFloat(amount.replace(",", "."));
    if (!amt || amt <= 0) { Alert.alert("Error", "Ingresa un monto válido"); return; }
    if (!description.trim()) { Alert.alert("Error", "Ingresa una descripción"); return; }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await addTransaction({
        type: txType,
        amount: amt,
        description: description.trim(),
        date,
        category_id: categoryId,
        account_id: txType === "card_expense" ? null : accountId,
        card_id: txType === "card_expense" ? cardId : null,
        to_account_id: txType === "transfer" ? toAccountId : null,
        status,
        recurrence_id: null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const TYPE_CONFIG: Record<TxType, { label: string; color: string; btnColor: string }> = {
    expense: { label: "Gasto", color: colors.expense, btnColor: colors.expense },
    income: { label: "Ingreso", color: colors.income, btnColor: colors.income },
    card_expense: { label: "Gasto en Tarjeta", color: colors.expense, btnColor: "#00a895" },
    transfer: { label: "Transferencia", color: colors.blue, btnColor: colors.blue },
  };

  const cfg = TYPE_CONFIG[txType];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {txType === "expense" ? "Nuevo Gasto" : txType === "income" ? "Nuevo Ingreso" : txType === "card_expense" ? "Gasto en Tarjeta" : "Transferencia"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Type Selector */}
        <View style={[styles.typeRow, { backgroundColor: colors.card }]}>
          {(["expense", "income"] as TxType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, txType === t && { backgroundColor: colors.background, borderColor: t === "expense" ? colors.expense : colors.income, borderWidth: 1.5 }]}
              onPress={() => setTxType(t)}
            >
              <Feather name={t === "expense" ? "arrow-down" : "arrow-up"} size={16} color={t === "expense" ? colors.expense : colors.income} />
              <Text style={[styles.typeBtnText, { color: t === "expense" ? colors.expense : colors.income }]}>
                {t === "expense" ? "Gasto" : "Ingreso"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <View style={[styles.amountBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Monto</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currencySign, { color: cfg.color }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: cfg.color }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          </View>
        </View>

        {/* Description */}
        <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="file-text" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.fieldInput, { color: colors.foreground }]}
            placeholder="Descripción"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Date */}
        <View style={[styles.dateRow]}>
          {[{ label: "Hoy", val: todayStr() }, { label: "Ayer", val: yesterdayStr() }].map((d) => (
            <TouchableOpacity
              key={d.val}
              style={[styles.datePill, { backgroundColor: date === d.val ? cfg.color : colors.card, borderColor: colors.border }]}
              onPress={() => setDate(d.val)}
            >
              <Text style={[styles.datePillText, { color: date === d.val ? colors.primaryForeground : colors.foreground }]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.datePill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="calendar" size={14} color={colors.mutedForeground} />
            <Text style={[styles.datePillText, { color: colors.foreground }]}>Otra</Text>
          </TouchableOpacity>
        </View>

        {/* Category */}
        {txType !== "transfer" && (
          <View style={[styles.selectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.selectLabel, { color: colors.mutedForeground }]}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {filteredCats.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, { backgroundColor: categoryId === c.id ? c.color : colors.secondary, borderColor: categoryId === c.id ? c.color : "transparent" }]}
                  onPress={() => setCategoryId(c.id)}
                >
                  <Text style={[styles.catChipText, { color: categoryId === c.id ? "#fff" : colors.foreground }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
              {filteredCats.length === 0 && (
                <TouchableOpacity onPress={() => router.push("/categories")} style={[styles.catChip, { backgroundColor: colors.secondary }]}>
                  <Feather name="plus" size={14} color={colors.primary} />
                  <Text style={[styles.catChipText, { color: colors.primary }]}>Agregar</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* Account / Card */}
        {txType === "card_expense" ? (
          <View style={[styles.selectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.selectLabel, { color: colors.mutedForeground }]}>Tarjeta</Text>
            {creditCards.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.accountRow, { borderTopColor: colors.border }]}
                onPress={() => setCardId(c.id)}
              >
                <View style={[styles.accountIcon, { backgroundColor: c.color + "33" }]}>
                  <Feather name="credit-card" size={16} color={c.color} />
                </View>
                <Text style={[styles.accountName, { color: colors.foreground }]}>{c.name}</Text>
                {cardId === c.id && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        ) : txType === "transfer" ? (
          <View style={[styles.selectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.selectLabel, { color: colors.mutedForeground }]}>Desde</Text>
            {accounts.map((a) => (
              <TouchableOpacity key={a.id} style={[styles.accountRow, { borderTopColor: colors.border }]} onPress={() => setAccountId(a.id)}>
                <View style={[styles.accountIcon, { backgroundColor: a.color + "33" }]}>
                  <MaterialCommunityIcons name="wallet-outline" size={16} color={a.color} />
                </View>
                <Text style={[styles.accountName, { color: colors.foreground }]}>{a.name}</Text>
                {accountId === a.id && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <Text style={[styles.selectLabel, { color: colors.mutedForeground, marginTop: 10 }]}>Hacia</Text>
            {accounts.filter((a) => a.id !== accountId).map((a) => (
              <TouchableOpacity key={a.id} style={[styles.accountRow, { borderTopColor: colors.border }]} onPress={() => setToAccountId(a.id)}>
                <View style={[styles.accountIcon, { backgroundColor: a.color + "33" }]}>
                  <MaterialCommunityIcons name="wallet-outline" size={16} color={a.color} />
                </View>
                <Text style={[styles.accountName, { color: colors.foreground }]}>{a.name}</Text>
                {toAccountId === a.id && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={[styles.selectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.selectLabel, { color: colors.mutedForeground }]}>Cuenta</Text>
            {accounts.map((a) => (
              <TouchableOpacity key={a.id} style={[styles.accountRow, { borderTopColor: colors.border }]} onPress={() => setAccountId(a.id)}>
                <View style={[styles.accountIcon, { backgroundColor: a.color + "33" }]}>
                  <MaterialCommunityIcons name="wallet-outline" size={16} color={a.color} />
                </View>
                <Text style={[styles.accountName, { color: colors.foreground }]}>{a.name}</Text>
                {accountId === a.id && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Status */}
        {txType !== "transfer" && (
          <View style={[styles.statusRow, { backgroundColor: colors.card }]}>
            {(["paid", "pending"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, status === s && { backgroundColor: colors.background, borderColor: s === "paid" ? colors.income : colors.warning, borderWidth: 1.5 }]}
                onPress={() => setStatus(s)}
              >
                <Feather name={s === "paid" ? "check-circle" : "clock"} size={15} color={s === "paid" ? colors.income : colors.warning} />
                <Text style={[styles.statusText, { color: s === "paid" ? colors.income : colors.warning }]}>
                  {s === "paid" ? "Pagado" : "Pendiente"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: cfg.btnColor }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.saveBtnText}>
              {txType === "expense" ? "GUARDAR GASTO" : txType === "income" ? "GUARDAR INGRESO" : txType === "card_expense" ? "GUARDAR GASTO" : "GUARDAR TRANSFERENCIA"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  body: { padding: 16, gap: 12 },
  typeRow: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  typeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  typeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  amountBox: { borderRadius: 12, padding: 16, alignItems: "center" },
  amountLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  amountRow: { flexDirection: "row", alignItems: "center" },
  currencySign: { fontSize: 28, fontFamily: "Inter_600SemiBold", marginRight: 4 },
  amountInput: { fontSize: 40, fontFamily: "Inter_700Bold", minWidth: 120, textAlign: "center" },
  field: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  fieldInput: { flex: 1, height: 50, fontSize: 15, fontFamily: "Inter_400Regular" },
  dateRow: { flexDirection: "row", gap: 8 },
  datePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  datePillText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  selectCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  selectLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  catChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 8 },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  accountRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 12, borderTopWidth: 1, marginTop: 8 },
  accountIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  accountName: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  statusRow: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  statusBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  statusText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  saveBtn: { borderRadius: 12, height: 52, alignItems: "center", justifyContent: "center", marginTop: 8 },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.5 },
});
