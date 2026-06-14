import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, CheckCircle2, Circle } from "lucide-react-native";
import type { CollectionItem } from "@atlas/shared";
import { fetchCollectionItems } from "../../../src/api/collections";
import { colors, typography, spacing, radius, tabbarHeight } from "../../../src/theme/tokens";

function ItemRow({ item }: { item: CollectionItem }) {
  const subtitle =
    item.elevation != null
      ? `${item.elevation}m`
      : item.distanceKm != null
        ? `${item.distanceKm}km`
        : item.category ?? "";

  return (
    <View style={[styles.itemRow, item.collected && styles.itemRowCollected]}>
      {item.collected ? (
        <CheckCircle2 size={16} color={colors.spruce[400]} strokeWidth={2} />
      ) : (
        <Circle size={16} color={colors.borderStrong} strokeWidth={1.5} />
      )}
      <View style={styles.itemText}>
        <Text style={[styles.itemName, !item.collected && styles.itemNameUncollected]}>
          {item.name}
        </Text>
        {subtitle.length > 0 && (
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        )}
      </View>
      {item.collected && item.visits > 0 && (
        <Text style={styles.visits}>{item.visits}×</Text>
      )}
    </View>
  );
}

export default function CollectionDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();

  const { data, isLoading } = useQuery({
    queryKey: ["collection", slug],
    queryFn: () => fetchCollectionItems(slug),
    enabled: slug !== undefined,
  });

  const collection = data?.collection;
  const items = data?.items ?? [];
  const collectedCount = items.filter((i) => i.collected).length;
  const pct = items.length > 0 ? (collectedCount / items.length) * 100 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Back button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={18} color={colors.accent} strokeWidth={2.2} />
        <Text style={styles.backText}>Collections</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabbarHeight + insets.bottom + spacing[5] },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            collection !== undefined ? (
              <View style={styles.collectionHeader}>
                <Text style={styles.collectionType}>{collection.type.toUpperCase()}</Text>
                <Text style={styles.collectionName}>{collection.name}</Text>
                {collection.description !== null && (
                  <Text style={styles.collectionDescription}>{collection.description}</Text>
                )}
                <View style={styles.progressRow}>
                  <View style={styles.trackBg}>
                    <View style={[styles.trackFill, { width: `${Math.min(pct, 100)}%` }]} />
                  </View>
                  <Text style={styles.progressLabel}>
                    {collectedCount} / {items.length} · {Math.round(pct)}%
                  </Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => <ItemRow item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  backText: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.accent,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: spacing[5],
    gap: spacing[3],
  },
  collectionHeader: {
    gap: spacing[3],
    paddingBottom: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    marginBottom: spacing[4],
  },
  collectionType: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.4,
  },
  collectionName: {
    fontFamily: typography.displaySemiBold,
    fontSize: 24,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  collectionDescription: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  progressRow: {
    gap: spacing[1],
  },
  trackBg: {
    height: 4,
    backgroundColor: colors.surfaceHover,
    borderRadius: 2,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  progressLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  itemRowCollected: {},
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemNameUncollected: {
    color: colors.textSecondary,
  },
  itemSubtitle: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 0.8,
  },
  visits: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
});
