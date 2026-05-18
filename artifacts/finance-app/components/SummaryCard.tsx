import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/format";

interface Props {
  label: string;
  value: number;
  icon: string;
  iconLib?: "feather" | "mci";
  valueColor?: string;
  small?: boolean;
}

export default function SummaryCard({ label, value, icon, iconLib = "feather", valueColor, small }: Props) {
  const colors = useColors();
  const color = valueColor ?? colors.foreground;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        {iconLib === "feather" ? (
          <Feather name={icon as any} size={small ? 13 : 14} color={colors.mutedForeground} />
        ) : (
          <MaterialCommunityIcons name={icon as any} size={small ? 13 : 14} color={colors.mutedForeground} />
        )}
        <Text style={[styles.label, { color: colors.mutedForeground, fontSize: small ? 11 : 12 }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color, fontSize: small ? 14 : 16 }]}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  label: { fontFamily: "Inter_400Regular" },
  value: { fontFamily: "Inter_700Bold" },
});
