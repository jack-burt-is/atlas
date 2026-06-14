import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LayoutGrid } from "lucide-react-native";
import { fetchCollections } from "../../../src/api/collections";
import { CollectionCard } from "../../../src/components/CollectionCard";
import { colors, typography, spacing, tabbarHeight } from "../../../src/theme/tokens";

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();

  const { data, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const collections = data?.collections ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.pageHeader}>
        <View style={styles.titleRow}>
          <LayoutGrid size={22} color={colors.accent} strokeWidth={2} />
          <Text style={styles.title}>Collections</Text>
        </View>
        {collections.length > 0 && (
          <Text style={styles.subtitle}>{collections.length} collections</Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabbarHeight + insets.bottom + spacing[5] },
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CollectionCard
              collection={item}
              onPress={() =>
                router.push(`/(tabs)/collections/${item.slug}`)
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  pageHeader: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  title: {
    fontFamily: typography.displaySemiBold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: spacing[5],
  },
  separator: {
    height: spacing[3],
  },
});
