import { View, Text } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import IonIcons from "react-native-vector-icons/Ionicons";

// Screens
import FeedScreen from "./screens/FeedScreen.js";
import PetScreen from "./screens/PetScreen.js";
import SettingsScreen from "./screens/SettingsScreen.js";
import { useReducer } from "react";

// Screen names
const feedScreenName = "Feed";
const settingsScreenName = "Settings";
const petScreenName = "Pets";

const Tab = createBottomTabNavigator();

export default function MainContainer() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={petScreenName}
        screenOptions={(params) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let rn = params.route.name;

            if (rn == feedScreenName) {
              iconName = focused ? "fast-food" : "fast-food-outline";
            } else if (rn == petScreenName) {
              iconName = focused ? "paw" : "paw-outline";
            } else if (rn == settingsScreenName) {
              iconName = focused ? "settings" : "settings-outline";
            }

            return <IonIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "grey",
          tabBarLabelStyle: { paddingBottom: 10, fontSize: 10 },
          tabBarstyle: { padding: 10, height: 70 },
        })}
      >
        <Tab.Screen name={petScreenName} component={PetScreen} />
        <Tab.Screen name={feedScreenName} component={FeedScreen} />
        <Tab.Screen name={settingsScreenName} component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
