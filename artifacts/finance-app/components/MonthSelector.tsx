import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useFinance } from "@/context/FinanceContext";

export default function MonthSelector() {
  const colors = useColors();
  const { selectedMonth, setSelectedMonth } = useFinance();

  const prev = () => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() - 1);
    setSelectedMonth(d);
  };

  const next = () => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() + 1);
    setSelectedMonth(d);
  };

  const label = selectedMonth.toLocaleDateString("es", { month: "long" });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={prev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.monthBtn}>
        <Text style={[styles.month, { color: colors.foreground }]}>{label}</Text>
        <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
      </TouchableOpacity>
      <TouchableOpacity onPress={next} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 8,
  },
  monthBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  month: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
});
