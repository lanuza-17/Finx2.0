import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/format";
import * as Haptics from "expo-haptics";

const COLORS = ["#00d4aa", "#3fb950", "#79c0ff", "#bc8cff", "#ffa657", "#f85149", "#e3b341", "#ff7eb6"];

export default function AccountsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { accounts, addAccount, deleteAccount } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("0");
  const [type, setType] = useState<"wallet" | "bank" | "savings">("wallet");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const save = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await addAccount({ name: name.trim(), balance: parseFloat(balance) || 0, type, color });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false);
    setShowAdd(false);
    setName(""); setBalance("0");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Cuentas</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}>
        {showAdd && (
          <View style={[styles.addCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.addTitle, { color: colors.foreground }]}>Nueva cuenta</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]} placeholder="Nombre" placeholderTextColor={colors.mutedForeground} value={name} onChangeText={setName} />
            <TextInput style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]} placeholder="Saldo inicial" placeholderTextColor={colors.mutedForeground} value={balance} onChangeText={setBalance} keyboardType="decimal-pad" />
            <View style={styles.typeRow}>
              {(["wallet", "bank", "savings"] as const).map((t) => (
                <TouchableOpacity key={t} style={[styles.typePill, { backgroundColor: type === t ? colors.primary : colors.secondary }]} onPress={() => setType(t)}>
                  <Text style={[styles.typePillText, { color: type === t ? colors.primaryForeground : colors.foreground }]}>{t === "wallet" ? "Billetera" : t === "bank" ? "Banco" : "Ahorros"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorSelected]} onPress={() => setColor(c)} />
              ))}
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        )}

        {accounts.map((acc) => (
          <TouchableOpacity
            key={acc.id}
            style={[styles.accCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onLongPress={() => Alert.alert("Eliminar", `¿Eliminar "${acc.name}"?`, [
              { text: "Cancelar", style: "cancel" },
              { text: "Eliminar", style: "destructive", onPress: () => deleteAccount(acc.id) },
            ])}
            activeOpacity={0.8}
          >
            <View style={[styles.accIcon, { backgroundColor: acc.color + "33" }]}>
              <MaterialCommunityIcons name="wallet-outline" size={22} color={acc.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.accName, { color: colors.foreground }]}>{acc.name}</Text>
              <Text style={[styles.accType, { color: colors.mutedForeground }]}>{acc.type === "wallet" ? "Billetera" : acc.type === "bank" ? "Banco" : "Ahorros"}</Text>
            </View>
            <Text style={[styles.accBalance, { color: acc.balance >= 0 ? colors.income : colors.expense }]}>{formatCurrency(acc.balance)}</Text>
          </TouchableOpacity>
        ))}

        {accounts.length === 0 && !showAdd && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="wallet-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Sin cuentas aún</Text>
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
  addCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
  addTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  input: { borderRadius: 10, paddingHorizontal: 14, height: 46, fontSize: 15, fontFamily: "Inter_400Regular" },
  typeRow: { flexDirection: "row", gap: 8 },
  typePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  typePillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorSelected: { borderWidth: 3, borderColor: "#fff" },
  saveBtn: { borderRadius: 10, height: 44, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  accCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
  accIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  accName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  accType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  accBalance: { fontSize: 16, fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
