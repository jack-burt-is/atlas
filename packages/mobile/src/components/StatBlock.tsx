import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "../theme/tokens";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
}

export function StatBlock({ label, value, unit }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit !== undefined && <Text style={styles.unit}>{unit}</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 2,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  value: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  unit: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    lineHeight: 16,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
});
