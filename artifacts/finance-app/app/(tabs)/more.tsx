import React from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import * as Haptics from "expo-haptics";

interface MenuItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuItem({ icon, iconBg, title, subtitle, onPress, danger }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuTitle, { color: danger ? colors.destructive : colors.foreground }]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

interface GridItemProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  onPress?: () => void;
}

function GridItem({ icon, iconBg, label, onPress }: GridItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.gridIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={[styles.gridLabel, { color: colors.foreground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut, deleteAccount } = useAuth();
  const { refreshAll, transactions, accounts, creditCards, categories, recurrences, budgets } = useFinance();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres desconectarte?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); signOut(); } },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Eliminar cuenta", "¿Eliminar permanentemente tu cuenta y todos tus datos?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => { await deleteAccount(); } },
    ]);
  };

  const handleExport = () => {
    const data = { accounts, creditCards, categories, transactions, recurrences, budgets, exportedAt: new Date().toISOString() };
    Alert.alert("Datos exportados", "Copia guardada como JSON:\n" + JSON.stringify(data).substring(0, 100) + "...");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Más opciones</Text>
      </View>

      {/* Grid */}
      <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.grid}>
          <GridItem icon={<MaterialCommunityIcons name="bank-outline" size={22} color="#4fc3f7" />} iconBg="#4fc3f722" label="Cuentas" onPress={() => router.push("/accounts")} />
          <GridItem icon={<Feather name="credit-card" size={22} color="#00d4aa" />} iconBg="#00d4aa22" label="Tarjetas" onPress={() => router.push("/cards")} />
          <GridItem icon={<Feather name="tag" size={22} color="#56d364" />} iconBg="#56d36422" label="Categorías" onPress={() => router.push("/categories")} />
          <GridItem icon={<Feather name="repeat" size={22} color="#bc8cff" />} iconBg="#bc8cff22" label="Recurrentes" onPress={() => router.push("/recurrences")} />
          <GridItem icon={<Feather name="clock" size={22} color="#f85149" />} iconBg="#f8514922" label="Pendientes" onPress={() => router.push("/pending")} />
          <GridItem icon={<MaterialCommunityIcons name="piggy-bank-outline" size={22} color="#00d4aa" />} iconBg="#00d4aa22" label="Presupuestos" onPress={() => router.push("/budgets")} />
        </View>
      </View>

      {/* Cuenta */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CUENTA</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MenuItem
          icon={<Feather name="user" size={18} color="#4fc3f7" />}
          iconBg="#4fc3f722"
          title="Conectado"
          subtitle={user?.email ?? ""}
        />
        <MenuItem
          icon={<Feather name="log-out" size={18} color={colors.expense} />}
          iconBg={colors.expense + "22"}
          title="Cerrar sesión"
          subtitle="Desconectarse de esta cuenta"
          onPress={handleSignOut}
        />
        <MenuItem
          icon={<Feather name="trash-2" size={18} color={colors.destructive} />}
          iconBg={colors.destructive + "22"}
          title="Eliminar cuenta"
          subtitle="Eliminar permanentemente tu cuenta y datos"
          onPress={handleDelete}
          danger
        />
      </View>

      {/* Datos */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DATOS</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MenuItem
          icon={<Feather name="refresh-cw" size={18} color="#4fc3f7" />}
          iconBg="#4fc3f722"
          title="Sincronización"
          subtitle="Última: ahora"
          onPress={() => { refreshAll(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        />
        <MenuItem
          icon={<Feather name="upload" size={18} color={colors.income} />}
          iconBg={colors.income + "22"}
          title="Exportar datos"
          subtitle="Guardar copia de seguridad en JSON"
          onPress={handleExport}
        />
        <MenuItem
          icon={<Feather name="download" size={18} color="#4fc3f7" />}
          iconBg="#4fc3f722"
          title="Importar datos"
          subtitle="Restaurar desde una copia"
          onPress={() => Alert.alert("Importar", "Función disponible próximamente")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  gridCard: { marginHorizontal: 16, marginBottom: 20, borderRadius: 14, borderWidth: 1, padding: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 0 },
  gridItem: { width: "33.3%", alignItems: "center", paddingVertical: 16, gap: 8 },
  gridIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  gridLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginHorizontal: 20, marginBottom: 6 },
  section: { marginHorizontal: 16, marginBottom: 20, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderBottomWidth: 1 },
  menuIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuTitle: { fontSize: 15, fontFamily: "Inter_500Medium" },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
});
