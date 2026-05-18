import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import * as Haptics from "expo-haptics";

export default function AddRecurrenceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { accounts, creditCards, categories, addRecurrence } = useFinance();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0.00");
  const [type, setType] = useState<"expense" | "income" | "card_expense">("expense");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [cardId, setCardId] = useState<string | null>(creditCards[0]?.id ?? null);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [loading, setLoading] = useState(false);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const save = async () => {
    const amt = parseFloat(amount.replace(",", "."));
    if (!description.trim() || !amt || amt <= 0) { Alert.alert("Error", "Completa todos los campos"); return; }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await addRecurrence({
        description: description.trim(),
        amount: amt,
        type,
        category_id: categoryId,
        account_id: type === "card_expense" ? null : accountId,
        card_id: type === "card_expense" ? cardId : null,
        day_of_month: dayOfMonth,
        active: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Error", "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  const filteredCats = categories.filter((c) => type === "income" ? c.type === "income" : c.type === "expense");
  const typeColor = type === "income" ? colors.income : colors.expense;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Nueva Recurrencia</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">

        {/* Type selector */}
        <View style={[styles.typeRow, { backgroundColor: colors.card }]}>
          {(["expense", "income", "card_expense"] as const).map((t) => {
            const tColor = t === "income" ? colors.income : colors.expense;
            const active = type === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, active && { backgroundColor: colors.background, borderColor: tColor, borderWidth: 1.5 }]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeBtnText, { color: tColor }]}>
                  {t === "expense" ? "Gasto" : t === "income" ? "Ingreso" : "Tarjeta"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Amount */}
        <View style={[styles.amountBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Monto mensual</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currencySign, { color: typeColor }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: typeColor }]}
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
            placeholder="Descripción (ej: Netflix, Gym)"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Day of month */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Día del mes que se cobra</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.dayPill, { backgroundColor: colors.secondary }, dayOfMonth === d && { backgroundColor: colors.primary }]}
                onPress={() => setDayOfMonth(d)}
              >
                <Text style={[styles.dayPillText, { color: dayOfMonth === d ? colors.primaryForeground : colors.foreground }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category */}
        {filteredCats.length > 0 && (
          <View style={[styles.selectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.selectLabel, { color: colors.mutedForeground }]}>Categoría (opcional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {filteredCats.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, { backgroundColor: categoryId === c.id ? c.color : colors.secondary }]}
                  onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
                >
                  <Text style={[styles.catChipText, { color: categoryId === c.id ? "#fff" : colors.foreground }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.purple }]}
          onPress={save}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.saveBtnText}>GUARDAR RECURRENCIA</Text>
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
  typeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  amountBox: { borderRadius: 12, padding: 16, alignItems: "center" },
  amountLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  amountRow: { flexDirection: "row", alignItems: "center" },
  currencySign: { fontSize: 28, fontFamily: "Inter_600SemiBold", marginRight: 4 },
  amountInput: { fontSize: 40, fontFamily: "Inter_700Bold", minWidth: 120, textAlign: "center" },
  field: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  fieldInput: { flex: 1, height: 50, fontSize: 15, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  dayPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 6 },
  dayPillText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  selectCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  selectLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  catChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 8 },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  saveBtn: { borderRadius: 12, height: 52, alignItems: "center", justifyContent: "center", marginTop: 8 },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.5 },
});
