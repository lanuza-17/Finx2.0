import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/format";
import * as Haptics from "expo-haptics";

const COLORS = ["#00d4aa", "#3fb950", "#79c0ff", "#bc8cff", "#ffa657", "#f85149", "#e3b341", "#ff7eb6"];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { creditCards, addCreditCard, deleteCreditCard } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("0");
  const [closingDay, setClosingDay] = useState(26);
  const [dueDay, setDueDay] = useState(10);
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const save = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await addCreditCard({ name: name.trim(), limit: parseFloat(limit) || 0, balance: 0, closing_day: closingDay, due_day: dueDay, color });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false); setShowAdd(false); setName(""); setLimit("0");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Tarjeta de crédito</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}>
        {showAdd && (
          <View style={[styles.addCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.addTitle, { color: colors.foreground }]}>Nueva tarjeta de crédito</Text>
            {/* Card preview */}
            <View style={[styles.cardPreview, { backgroundColor: color }]}>
              <Text style={styles.cardPreviewName}>{name || "Mi Tarjeta"}</Text>
              <Feather name="credit-card" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <TextInput style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]} placeholder="Ej: Visa, Mastercard..." placeholderTextColor={colors.mutedForeground} value={name} onChangeText={setName} />
            <View style={[styles.limitBox, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.limitLabel, { color: colors.mutedForeground }]}>Límite</Text>
              <Text style={[styles.limitValue, { color: colors.primary }]}>$ {limit}</Text>
              <TextInput style={{ position: "absolute", opacity: 0, width: "100%", height: "100%" }} keyboardType="decimal-pad" value={limit} onChangeText={setLimit} />
            </View>
            <View style={styles.daysRow}>
              <View style={[styles.dayBox, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>Día de cierre</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {DAYS.map((d) => (
                    <TouchableOpacity key={d} style={[styles.dayPill, closingDay === d && { backgroundColor: colors.primary }]} onPress={() => setClosingDay(d)}>
                      <Text style={[styles.dayPillText, { color: closingDay === d ? colors.primaryForeground : colors.foreground }]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={[styles.dayBox, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>Día de vencimiento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {DAYS.map((d) => (
                    <TouchableOpacity key={d} style={[styles.dayPill, dueDay === d && { backgroundColor: colors.primary }]} onPress={() => setDueDay(d)}>
                      <Text style={[styles.dayPillText, { color: dueDay === d ? colors.primaryForeground : colors.foreground }]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={styles.colorRow}>
              <Text style={[styles.colorLabel, { color: colors.mutedForeground }]}>Color de la tarjeta</Text>
              <View style={styles.colorDots}>
                {COLORS.map((c) => (
                  <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorSelected]} onPress={() => setColor(c)} />
                ))}
              </View>
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>GUARDAR TARJETA</Text>}
            </TouchableOpacity>
          </View>
        )}

        {creditCards.map((card) => {
          const pct = card.limit > 0 ? Math.min(100, (card.balance / card.limit) * 100) : 0;
          const available = Math.max(0, card.limit - card.balance);
          return (
            <TouchableOpacity
              key={card.id}
              style={[styles.creditCard, { backgroundColor: card.color }]}
              onLongPress={() => Alert.alert("Eliminar", `¿Eliminar "${card.name}"?`, [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => deleteCreditCard(card.id) },
              ])}
              activeOpacity={0.9}
            >
              <View style={styles.creditCardHeader}>
                <Text style={styles.creditCardName}>{card.name}</Text>
                <Feather name="credit-card" size={20} color="rgba(255,255,255,0.8)" />
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
              </View>
              <View style={styles.pctRow}>
                <Text style={styles.pctText}>{Math.round(pct)}% usado</Text>
                <Text style={styles.pctText}>{100 - Math.round(pct)}% disponible</Text>
              </View>
              <View style={styles.creditCardInfo}>
                <View>
                  <Text style={styles.creditInfoLabel}>Límite disponible</Text>
                  <Text style={styles.creditInfoValue}>{formatCurrency(available)}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.creditInfoLabel}>Límite total</Text>
                  <Text style={styles.creditInfoValue}>{formatCurrency(card.limit)}</Text>
                </View>
              </View>
              <View style={styles.pillRow}>
                <View style={styles.pill}><Text style={styles.pillText}>Cierra el día {card.closing_day}</Text></View>
                <View style={styles.pill}><Text style={styles.pillText}>Vence el día {card.due_day}</Text></View>
              </View>
            </TouchableOpacity>
          );
        })}

        {creditCards.length === 0 && !showAdd && (
          <View style={styles.empty}>
            <Feather name="credit-card" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Sin tarjetas aún</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Toca + para agregar una</Text>
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
  cardPreview: { borderRadius: 14, padding: 20, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", minHeight: 100 },
  cardPreviewName: { color: "#fff", fontSize: 18, fontFamily: "Inter_600SemiBold" },
  input: { borderRadius: 10, paddingHorizontal: 14, height: 46, fontSize: 15, fontFamily: "Inter_400Regular" },
  limitBox: { borderRadius: 10, padding: 16, alignItems: "center" },
  limitLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  limitValue: { fontSize: 32, fontFamily: "Inter_700Bold" },
  daysRow: { gap: 10 },
  dayBox: { borderRadius: 10, padding: 12 },
  dayLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  dayPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
  dayPillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  colorRow: { gap: 8 },
  colorLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  colorDots: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorSelected: { borderWidth: 3, borderColor: "#fff" },
  saveBtn: { borderRadius: 10, height: 48, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  creditCard: { borderRadius: 16, padding: 18, marginBottom: 14 },
  creditCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  creditCardName: { color: "#fff", fontSize: 18, fontFamily: "Inter_600SemiBold" },
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3, marginBottom: 6, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3 },
  pctRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  pctText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_400Regular" },
  creditCardInfo: { flexDirection: "row", justifyContent: "space-between" },
  creditInfoLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_400Regular" },
  creditInfoValue: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 2 },
  pillRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  pill: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
