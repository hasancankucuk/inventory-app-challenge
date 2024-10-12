import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated, Easing, TouchableWithoutFeedback } from "react-native";
import { Inventory } from "./store/inventory";
import { Button, IconButton } from "react-native-paper";

type ProductItemProps = {
    product: Inventory
}

const sevenDays = 7 * 86_400_000 // in milliseconds

// To avoid re-creating this method on each render, the isDateWithin7Days method is coded here. 
// This method checks if the product date is within last 7 days so we can show 'NEW' icon.
const isDateWithin7Days = (posteDate: Date): boolean => {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate.getTime() - sevenDays);
    return posteDate >= sevenDaysAgo;
};

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [contentHeight, setContentHeight] = useState(0);
    const heightAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // useMemo used for performance optimization because product image might rarely change.
    const productImage = useMemo(
        () => product?.fields?.["Product Image"] || 'https://via.placeholder.com/100',
        [product]
    );

    const productCategories = useMemo(
        () => product.fields["Product Categories"]?.split(','),
        [product]
    )

    // To calculate expension height dynamically.
    const onContentLayout = (event: any) => {
        setContentHeight(event.nativeEvent.layout.height);
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(heightAnim, {
                toValue: selectedId === product?.id ? contentHeight : 0,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
                duration: 200,
            }),
            Animated.timing(opacityAnim, {
                toValue: selectedId === product?.id ? 1 : 0,
                duration: 75,
                useNativeDriver: false,
            }),
        ]).start();
    }, [selectedId, heightAnim, opacityAnim, contentHeight, product?.id]);

    const expensionSetter = (id: string) => {
        if (product.fields["Product Categories"]) {
            if (selectedId === id) {
                setSelectedId(null);
            } else {
                setSelectedId(id)
            }
        }
    }

    return (
        <View >
            <TouchableWithoutFeedback onPress={() => {
                expensionSetter(product.id);
            }}>
                <View style={styles.card}>
                    <Image
                        source={{
                            uri: productImage
                        }}
                        style={styles.cardImage}
                        resizeMode='contain'
                    />
                    <View style={styles.content}>
                        <View style={styles.cardHeader}>
                            <Text
                                style={styles.title}
                                // To show name truncated to 1 line. numberOfLines, limits the component to display only one line even if the content exceeds the available width
                                numberOfLines={1}
                                // Tail is for when the text overflows to show an ellipsis at the end of the text.
                                ellipsizeMode='tail'
                            >
                                {product.fields["Product Name"]}
                            </Text>
                            <View style={styles.actions}>
                                {isDateWithin7Days(new Date(product.fields["Posted"])) &&
                                    <View style={styles.newLabelContainer}>
                                        <Text style={styles.newLabel}>NEW</Text>
                                    </View>
                                }
                                <IconButton
                                    style={styles.expandIcon}
                                    icon={`${selectedId == product?.id ? "chevron-up" : "chevron-down"}`} />
                            </View>
                        </View>

                        <Text
                            style={styles.date}>
                            {product.fields["Posted"] ? new Date(product.fields["Posted"]).toLocaleDateString('de-DE') : ''}
                        </Text>
                        {
                            // To add easing curve animation I used animated view, and since the animation requires height change I added the animation to height style.
                            <Animated.View
                                style={[
                                    styles.animationContainer,
                                    { height: heightAnim, opacity: opacityAnim, overflow: 'hidden' }
                                ]}
                            >
                                {/* 
                                    Each product has different amount of tags, and with static height on animation would cause problems like the card can be too long or too short. 
                                    To improve user experience I used onLayout, thus I can calculate the height dynamically. 
                                */}
                                <View
                                    onLayout={onContentLayout}
                                    style={styles.tagContainer}
                                >
                                    {productCategories?.map((tag: string, index: number) => (
                                        <View key={index} style={styles.tag}>
                                            <Text key={index}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Animated.View>
                        }
                    </View>
                </View>
            </TouchableWithoutFeedback >
        </View >
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        marginTop: 10,
        marginHorizontal: 10,
        backgroundColor: '#F8F9FC',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        gap: 10,
    },
    cardImage: {
        marginVertical: 5,
        width: 100,
        height: 100,
        flex: 1,
    },
    content: {
        marginVertical: 5,
        flex: 3,
    },
    cardHeader: {
        alignItems: 'center',
        alignContent: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        color: '#1B2633',
        fontWeight: 'bold',
        flex: 2,
    },
    actions: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 1,
        maxHeight: 26,
    },
    newLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        borderRadius: 6,
        borderTopRightRadius: 0,
        backgroundColor: '#333',
        flex: 2,
        maxWidth: 50,
    },
    newLabel: {
        color: '#FFFFFF',
    },
    expandIcon: {
        color: '#5E646E',
        width: 20,
    },
    date: {
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        display: 'flex',
        alignItems: 'flex-end',
        color: '#1B2633',
    },
    animationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        minHeight: 100,
        marginVertical: 10,

    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    tag: {
        justifyContent: 'center',
        backgroundColor: '#D5E6FF',
        padding: 5,
        borderRadius: 24,
    }
})

export default ProductItem;