import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  useWindowDimensions // <-- IMPORT THE HOOK
  ,


  View
} from 'react-native';
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
}

const fetchImages = async ({ pageParam = 1 }): Promise<Page> => {
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const images = Array.from({ length: 10 }, (_, index) => ({
        id: `img-${pageParam}-${index}-${Date.now()}`, 
        url: `https://picsum.photos/300/200?random=${pageParam * 10 + index}`, 
    }));
    
    const nextPage = pageParam < 5 ? pageParam + 1 : 0; 
    return { images, nextPage: nextPage };
};

export default function MenuScroll({ ListHeaderComponent }: MenuScrollProps) {
    const { width: screenWidth } = useWindowDimensions();

    // 2. Wrap all calculations in useMemo to recalculate ONLY when screenWidth changes
    const { DYNAMIC_COLUMN_COUNT, cardWrapperStyle } = useMemo(() => {
        
        // --- CALCULATION LOGIC (Moved inside useMemo) ---
        
        // Calculate the effective width available for cards
        const effectiveWidth = screenWidth - (PADDING * 2);

        // Determine the maximum number of columns that can fit
        const numColumns = Math.max(1, Math.floor(
            effectiveWidth / (MINIMUM_CARD_WIDTH + GUTTER_SIZE)
        ));

        // Calculate the actual width each card will take up
        const totalGutterWidth = GUTTER_SIZE * (numColumns - 1);
        const cardWidth = (effectiveWidth - totalGutterWidth) / numColumns;

        // Define the item wrapper styles based on the new calculations
        const wrapperStyle = {
            width: cardWidth,
            marginHorizontal: GUTTER_SIZE / 2, 
            marginBottom: GUTTER_SIZE,
        };

        return { 
            DYNAMIC_COLUMN_COUNT: numColumns, 
            CARD_WIDTH: cardWidth, // Retained for clarity, though not strictly needed here
            cardWrapperStyle: wrapperStyle 
        };
    }, [screenWidth]); // <-- Dependency array ensures this runs on resize

    // TanStack Query logic (remains the same)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
    } = useInfiniteQuery({
        queryKey: ['images'],
        initialPageParam: 1, 
        queryFn: fetchImages,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const images = useMemo(
        () => data?.pages.flatMap((page) => page.images) || [],
        [data]
    );

    return (
        <View style={styles.container}>
            <FlashList
                data={images}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                
                // Set the calculated number of columns
                numColumns={DYNAMIC_COLUMN_COUNT} 
                contentContainerStyle={styles.listContent}

                ListHeaderComponent={ListHeaderComponent} 

                refreshControl={
                    <RefreshControl
                        tintColor={'blue'}
                        refreshing={isRefetching}
                        onRefresh={refetch}
                    />
                }
                renderItem={({ item }) => (
                    // 3. Apply the calculated style directly
                    <View style={cardWrapperStyle}>
                        <FoodCard 
                            id={parseInt(item.id.replace(/\D/g, ''))} 
                            name={`Food Item ${item.id}`} 
                            imageUrl={item.url} 
                            description="Delicious food item" 
                            price={9.99} 
                        />
                    </View>
                )}
                onEndReachedThreshold={0.2}
                onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()} 
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <ActivityIndicator
                            color="blue"
                            size="large"
                            style={styles.footer}
                        />
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