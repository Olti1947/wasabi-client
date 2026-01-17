import { FlashList } from '@shopify/flash-list';
// import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions // <-- IMPORT THE HOOK
  ,



  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFoodItems, resetFoodItems } from '../features/food/foodSlice';
import { FoodItem } from '../features/food/foodTypes';
import { AppDispatch } from '../store';
import FoodCard from './FoodCard';


// --- CONSTANTS ---
const MINIMUM_CARD_WIDTH = 180; // Smallest acceptable width for a single card
const GUTTER_SIZE = 8;        // Margin/Spacing between columns
const PADDING = 16;           // Horizontal padding of the list content

interface ImageData {
    id: string;
    url: string;
}

interface Page {
    images: ImageData[];
    nextPage: number;
}

interface MenuScrollProps {
    ListHeaderComponent: React.ReactElement | null;
    search: string;
}

export default function MenuScroll({ ListHeaderComponent, search }: MenuScrollProps) {
  const { width: screenWidth } = useWindowDimensions();
  const dispatch = useDispatch<AppDispatch>();

  const { items, loading, page, totalPages} = useSelector(
    (state: any) => state.food
  );

  // Initial load + search change
  useEffect(() => {
    dispatch(fetchFoodItems({ page: 0, size: 10, search }));
  }, [dispatch, search]);

  const loadMore = () => {
    if (!loading && page + 1 < totalPages) {
      dispatch(fetchFoodItems({ page: page + 1, size: 10, search }));
    }
  };

  const onRefresh = () => {
    dispatch(resetFoodItems());
    dispatch(fetchFoodItems({ page: 0, size: 10, search }));
  };

  const { DYNAMIC_COLUMN_COUNT, cardWrapperStyle } = useMemo(() => {
    const effectiveWidth = screenWidth - PADDING * 2;
    const numColumns = Math.max(
      1,
      Math.floor(effectiveWidth / (MINIMUM_CARD_WIDTH + GUTTER_SIZE))
    );

    const totalGutterWidth = GUTTER_SIZE * (numColumns - 1);
    const cardWidth = (effectiveWidth - totalGutterWidth) / numColumns;

    return {
      DYNAMIC_COLUMN_COUNT: numColumns,
      cardWrapperStyle: {
        width: cardWidth,
        marginHorizontal: GUTTER_SIZE / 2,
        marginBottom: GUTTER_SIZE,
      },
    };
  }, [screenWidth]);

  return (
    <View style={styles.container}>
      <FlashList
        data={items}
        keyExtractor={(item: FoodItem) => item.id.toString()}
        numColumns={DYNAMIC_COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={cardWrapperStyle}>
            <FoodCard {...item} />
          </View>
        )}
        onEndReachedThreshold={0.3}
        onEndReached={loadMore}
        ListFooterComponent={
          loading && page + 1 < totalPages ? (
            <ActivityIndicator size="large" color="green" />
          ) : null
        }
      />
    </View>
  );
}


// Stylesheet only contains static styles now
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    listContent: {
        paddingHorizontal: PADDING,
        paddingBottom: 20,
    },
    footer: {
        marginVertical: 20,
    }
});