import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { colors, typography, spacing } from "../src/theme/tokens";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.message}>This screen does not exist.</Text>
      <Link href="/(tabs)/" style={styles.link}>
        Go to home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[3],
  },
  code: {
    fontFamily: typography.display,
    fontSize: 64,
    color: colors.textFaint,
  },
  message: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.textMuted,
  },
  link: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.accent,
    marginTop: spacing[2],
  },
});
