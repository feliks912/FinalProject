import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { IonIcon } from "react-native-vector-icons/Ionicons";

// Screens
import FeedScreen from './screens/FeedScreen.js'
import PetScreen from './screens/PetScreen.js'
import SettingsScreen from './screens/SettingsScreen.js'
import { useReducer } from 'react'

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

                        //  It ought to be route.name not route.route.name but I think defining params in the MainContainer declaration
                        //  opened it up to navigation and route prop, from which I must read one level further.
                        let rn = route.route.name;

                        if (rn === feedScreenName) {
                            iconName = focused ? 'fast-food' : 'fast-food-outline'
                        } else if (rn === petScreenName) {
                            iconName = focused ? 'paw' : 'paw-outline'
                        } else if (rn === settingsScreenName) {
                            iconName = focused ? 'settings' : 'settings-outline'
                        }

                        return <IonIcon name={iconName} size={size} color={color} />
                    },
                    tabBarActiveTintColor: 'tomato',
                    tabBarInactiveTintColor: 'grey',
                    tabBarLabelStyle: { paddingBottom: 10, fontSize: 10 },
                    tabBarstyle: { padding: 10, height: 70 }
                }
            )}>

                <Tab.Screen name={petScreenName} 
                            component={PetScreen} 
                            options={{
                                title: 'Edit pets'
                            }}
                            />
                <Tab.Screen name={feedScreenName} 
                            component={FeedScreen}
                            options={{
                                title: 'Past feeds'
                            }}
                            initialParams={params}
                            />
                <Tab.Screen name={settingsScreenName} 
                            component={SettingsScreen} 
                            options={{
                                title: 'Global settings'
                            }}
                            />

            </Tab.Navigator>

        </NavigationContainer>
    )
}