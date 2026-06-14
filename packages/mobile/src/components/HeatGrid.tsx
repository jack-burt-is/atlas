import { View, StyleSheet } from "react-native";
import type { HeatmapEntry } from "@atlas/shared";
import { colors } from "../theme/tokens";

interface Props {
  data: HeatmapEntry[];
  weeks?: number;
}

function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

export function HeatGrid({ data, weeks = 14 }: Props) {
  const cellSize = 12;
  const gap = 3;

  // Build a map for O(1) lookup
  const byDate = new Map(data.map((d) => [d.date, d.count]));

  // Fill the grid from most recent Sunday back `weeks` weeks
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek - (weeks - 1) * 7);

  const cells: number[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    cells.push(byDate.get(key) ?? 0);
  }

  const columns: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(cells.slice(w * 7, w * 7 + 7));
  }

  return (
    <View style={[styles.grid, { gap }]}>
      {columns.map((col, wi) => (
        <View key={wi} style={[styles.col, { gap }]}>
          {col.map((count, di) => {
            const level = heatLevel(count);
            return (
              <View
                key={di}
                style={[
                  styles.cell,
                  { width: cellSize, height: cellSize, borderRadius: 2 },
                  { backgroundColor: colors.heat[level] },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
  },
  col: {
    flexDirection: "column",
  },
  cell: {},
});
