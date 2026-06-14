import { Stack } from "expo-router";
import { colors } from "../../../src/theme/tokens";

export default function CollectionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgApp },
        animation: "slide_from_right",
      }}
    />
  );
}
