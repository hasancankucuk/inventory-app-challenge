import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, DataTable, FAB } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { selectors, actions } from "./store/inventory";
import { RootState } from "./store";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { StackParamList } from "./App";
import ProductItem from "./ProductItem";

export default (props: StackScreenProps<StackParamList, "Home">) => {
  const fetching = useSelector((state: RootState) => state.inventory.fetching);
  const inventory = useSelector(selectors.selectInventory);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      dispatch(actions.fetchInventory());
    });
    return unsubscribe;
  }, [props.navigation]);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Inventory" />
      </Appbar.Header>

      {/* 
        Since FlatList doesn't work with ScrollView we directly used FlatList.
        This also minimizes the workload of rendering many components at once and keeps the memory footprint low.
        To ensure React identifies each list item uniquely, I used keyExtractor.
        Setted initialNumToRender to 5 to see clearly the improvement on visuals when scrolling.
      */}

      <FlatList
        style={{backgroundColor: '#FFF'}}
        data={inventory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductItem product={item} />}

        // refreshControl added to improve user experience and add pull-to-refresh functionality.
        refreshControl={
          <RefreshControl
            refreshing={fetching}
            onRefresh={() => dispatch(actions.fetchInventory())}
          />
        }
        initialNumToRender={5}
        windowSize={5}
        maxToRenderPerBatch={5}
        removeClippedSubviews={true} // For memory optimization. With this, component automatically unmounts items of the viewport memory.
        contentContainerStyle={{ paddingBottom: 80 }} // To give space for FAB button.
      />

      {/* <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={fetching}
            onRefresh={() => dispatch(actions.fetchInventory())}
          />
        }
      >
        <SafeAreaView edges={["left", "bottom", "right"]}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Product Code</DataTable.Title>
              <DataTable.Title numeric>Scan Date</DataTable.Title>
            </DataTable.Header>
            {inventory.map((record, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{record.fields["Product Code"]}</DataTable.Cell>
                <DataTable.Cell numeric>
                  {new Date(record.fields.Posted).toLocaleDateString()}{" "}
                  {new Date(record.fields.Posted).toLocaleTimeString()}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>

          {
            // If we didn't care about the performance issues and we ignore user experience while scrolling with a large number of produtcs we could use the ProductItem component like this.
            inventory.map((record, index) => (
              <ProductItem key={record?.id} product={record} />
            ))}

        </SafeAreaView>
      </ScrollView> */}

      <SafeAreaView style={styles.fab}>
        <FAB
          icon={() => (
            <MaterialCommunityIcons name="barcode" size={24} color="#0B5549" />
          )}
          label="Scan Product"
          onPress={() => props.navigation.navigate("Camera")}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 16,
    width: "100%",
    flex: 1,
    alignItems: "center"
  }
});
