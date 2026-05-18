import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch, Platform } from "react-native";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/format";
import * as Haptics from "expo-haptics";

export default function RecurrencesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recurrences, categories, accounts, creditCards, addRecurrence, updateRecurrence, deleteRecurrence } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [type, setType] = useState<"expense" | "income" | "card_expense">("expense");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [cardId, setCardId] = useState<string | null>(creditCards[0]?.id ?? null);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [loading, setLoading] = useState(false);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const save = async () => {
    if (!description.trim() || !parseFloat(amount)) return;
    setLoading(true);
    await addRecurrence({ description: description.trim(), amount: parseFloat(amount), type, category_id: categoryId, account_id: type === "card_expense" ? null : accountId, card_id: type === "card_expense" ? cardId : null, day_of_month: dayOfMonth, active: true });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false); setShowAdd(false); setDescription(""); setAmount("0");
  };

  const active = recurrences.filter((r) => r.active);
  const inactive = recurrences.filter((r) => !r.active);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} color={colors.foreground} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Recurrentes</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}><Feather name="plus" size={24} color={colors.primary} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}>
        {showAdd && (
          <View style={[styles.addCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]} placeholder="Descripción (ej: Netflix)" placeholderTextColor={colors.mutedForeground} value={description} onChangeText={setDescription} />
            <TextInput style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]} placeholder="Monto" placeholderTextColor={colors.mutedForeground} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <View style={styles.typeRow}>
              {(["expense", "income", "card_expense"] as const).map((t) => (
                <TouchableOpacity key={t} style={[styles.typePill, { backgroundColor: type === t ? colors.primary : colors.secondary }]} onPress={() => setType(t)}>
                  <Text style={[styles.typePillText, { color: type === t ? colors.primaryForeground : colors.foreground }]}>{t === "expense" ? "Gasto" : t === "income" ? "Ingreso" : "Tarjeta"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.dayRow}>
              <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>Día del mes:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <TouchableOpacity key={d} style={[styles.dayPill, dayOfMonth === d && { backgroundColor: colors.primary }]} onPress={() => setDayOfMonth(d)}>
                    <Text style={[styles.dayPillText, { color: dayOfMonth === d ? colors.primaryForeground : colors.foreground }]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        )}

        {[{ label: "ACTIVAS", items: active }, { label: "INACTIVAS", items: inactive }].map(({ label, items }) => items.length > 0 && (
          <View key={label}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{label}</Text>
            {items.map((r) => (
              <View key={r.id} style={[styles.recCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.recIcon, { backgroundColor: colors.purple + "22" }]}>
                  <Feather name="repeat" size={18} color={colors.purple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recDesc, { color: colors.foreground }]}>{r.description}</Text>
                  <Text style={[styles.recSub, { color: colors.mutedForeground }]}>Día {r.day_of_month} de cada mes</Text>
                </View>
                <Text style={[styles.recAmount, { color: r.type === "income" ? colors.income : colors.expense }]}>{formatCurrency(r.amount)}</Text>
                <Switch
                  value={r.active}
                  onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateRecurrence(r.id, { active: v }); }}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        ))}

        {recurrences.length === 0 && !showAdd && (
          <View style={styles.empty}>
            <Feather name="repeat" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Sin recurrencias</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  addCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
  input: { borderRadius: 10, paddingHorizontal: 14, height: 46, fontSize: 15, fontFamily: "Inter_400Regular" },
  typeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  typePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  typePillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  dayRow: { gap: 8 },
  dayLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dayPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
  dayPillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  saveBtn: { borderRadius: 10, height: 44, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  recCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8, gap: 10 },
  recIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  recDesc: { fontSize: 15, fontFamily: "Inter_500Medium" },
  recSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  recAmount: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
});
