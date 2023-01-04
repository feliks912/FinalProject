import { View, Text } from 'react-native'

import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator, createNativeStackNavigator } from '@react-navigation/bottom-tabs'
import IonIcons from 'react-native-vector-icons/Ionicons'

// Screens
import FeedScreen from './screens/FeedScreen.js'
import PetScreen from './screens/PetScreen.js'
import SettingsScreen from './screens/SettingsScreen.js'

// Screen names
const feedScreenName = 'Feed'
const settingsScreenName = 'Settings'
const petScreenName = 'Pets'

const Tab = createBottomTabNavigator();

export default function MainContainer(params) {
    return (
        <NavigationContainer>
            <Tab.Navigator
                initialRouteName={petScreenName}
                screenOptions={(route) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        let rn = route.name;

                        if (rn == feedScreenName) {
                            iconName = focused ? 'fish' : 'fish-outline'
                        } else if (rn == petScreenName) {
                            iconName = focused ? 'paw' : 'paw-outline'
                        } else if (rn == settingsScreenName) {
                            iconName = focused ? 'settings' : 'settings-outline'
                        }

                        return <IonIcons name={iconName} size={size} color={color} />
                    },
                    tabBarActiveTintColor: 'tomato',
                    tabBarInactiveTintColor: 'grey',
                    tabBarLabelStyle: { paddingBottom: 10, fontSize: 10 },
                    tabBarstyle: { padding: 10, height: 70 }
                })}
            >

                <Tab.Screen name={petScreenName} component={PetScreen} />
                <Tab.Screen name={feedScreenName} component={FeedScreen} initialParams={params}/>
                <Tab.Screen name={settingsScreenName} component={SettingsScreen} />

            </Tab.Navigator>

        </NavigationContainer>
    )
}