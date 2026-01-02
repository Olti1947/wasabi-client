import { FlashList } from '@shopify/flash-list';
// import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
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
}

// const fetchImages = async ({ pageParam = 1 }): Promise<Page> => {
//     try{
//         const response = await axios.get('/api/foods', {

//         })
//     }

//     // const images = Array.from({ length: 10 }, (_, index) => ({
//     //     id: `img-${pageParam}-${index}-${Date.now()}`, 
//     //     url: `https://picsum.photos/300/200?random=${pageParam * 10 + index}`, 
//     // }));
    
//     const nextPage = pageParam < 5 ? pageParam + 1 : 0; 
//     return { images, nextPage: nextPage };
// };

export default function MenuScroll({ ListHeaderComponent }: MenuScrollProps) {
     const { width: screenWidth } = useWindowDimensions();
const dispatch = useDispatch<AppDispatch>();

const foodState = useSelector((state: any) => state.food) ?? {
  items: [],
  loading: false,
  page: 0,
  totalPages: 1,
};

const {items, loading, page, totalPages} = foodState;

console.log("Food Items:", items);

useEffect(()=>{
    dispatch(fetchFoodItems({page: 0, size: 10}));
},[dispatch])

const loadMore = () => {
    if(!loading && page < totalPages){
        dispatch(fetchFoodItems({page, size: 10}));
    }
}

const onRefresh = () => {
  dispatch(resetFoodItems());
  dispatch(fetchFoodItems({ page: 0, size: 10 }));
};

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
    // const {
    //     data,
    //     fetchNextPage,
    //     hasNextPage,
    //     isFetchingNextPage,
    //     refetch,
    //     isRefetching,
    // } = useInfiniteQuery({
    //     queryKey: ['images'],
    //     initialPageParam: 1, 
    //     queryFn: fetchImages,
    //     getNextPageParam: (lastPage) => lastPage.nextPage,
    // });

    // const images = useMemo(
    //     () => data?.pages.flatMap((page) => page.images) || [],
    //     [data]
    // );

    return (
        <View style={styles.container}>
            <FlashList
                data={items}
                keyExtractor={(item: FoodItem) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                
                // Set the calculated number of columns
                numColumns={DYNAMIC_COLUMN_COUNT} 
                contentContainerStyle={styles.listContent}

                ListHeaderComponent={ListHeaderComponent} 

                refreshControl={
                    <RefreshControl
                        tintColor={'green'}
                        refreshing={loading}
                        onRefresh={onRefresh}
                    />
                }
                renderItem={({ item }) => (
                    // 3. Apply the calculated style directly
                    <View style={cardWrapperStyle}>
                        <FoodCard 
                            id={parseInt(item.id.toString())} 
                            name={item.name} 
                            imageUrl={item.imageUrl} 
                            description={item.description} 
                            price={item.price} 
                        />
                    </View>
                )}
                onEndReachedThreshold={0.2}
                onEndReached={loadMore} 
                ListFooterComponent={
                    loading ? (
                        <ActivityIndicator
                            color="green"
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