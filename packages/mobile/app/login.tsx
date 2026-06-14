import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { login } from "../src/api/auth";
import { colors, typography, spacing, radius } from "../src/theme/tokens";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/(tabs)/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing[8], paddingBottom: insets.bottom + spacing[6] },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>ATLAS</Text>
          <Text style={styles.subtitle}>Your outdoor exploration journal</Text>
        </View>

        <View style={styles.form}>
          {error !== null && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              placeholderTextColor={colors.textFaint}
              placeholder="you@example.com"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              placeholderTextColor={colors.textFaint}
              placeholder="••••••••"
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnGold} />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>No account? </Text>
            <Link href="/signup" asChild>
              <Pressable>
                <Text style={styles.link}>Create one</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[5],
    gap: spacing[8],
  },
  header: {
    alignItems: "center",
    gap: spacing[2],
  },
  wordmark: {
    fontFamily: typography.display,
    fontSize: 32,
    color: colors.accent,
    letterSpacing: 6,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  form: {
    gap: spacing[4],
  },
  errorBox: {
    backgroundColor: "rgba(224, 80, 63, 0.12)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(224, 80, 63, 0.3)",
    padding: spacing[3],
  },
  errorText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.coral[400],
  },
  field: {
    gap: spacing[1],
  },
  fieldLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    color: colors.textPrimary,
    fontFamily: typography.body,
    fontSize: 15,
    height: 48,
    paddingHorizontal: spacing[4],
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing[2],
  },
  buttonPressed: {
    backgroundColor: colors.accentPress,
  },
  buttonText: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.textOnGold,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  link: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.accent,
  },
});
