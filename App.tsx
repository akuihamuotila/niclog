import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';
import './global.css';
import { NicotineProvider, useNicotine } from './src/contexts/NicotineContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StatsScreen } from './src/screens/StatsScreen';

export type RootTabParamList = {
  Settings: undefined;
  Home: undefined;
  Stats: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const nicLogTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0f7a94',
    background: '#f5f1e8',
    card: '#1abc9c',
    text: '#1b3a4b',
    border: '#0f7a94',
    notification: '#0f7a94',
  },
};

const AppTabs = () => {
  const { isLoading } = useNicotine();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-sand">
        <Text className="text-lg font-semibold text-night">Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={nicLogTheme}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTitle: '💀 NicLog',
          tabBarActiveTintColor: '#0f7a94',
          tabBarInactiveTintColor: '#e7f7f3',
          tabBarStyle: {
            paddingHorizontal: 24,
            backgroundColor: '#1abc9c',
            borderTopColor: '#0f7a94',
            height: 68,
            paddingBottom: 12,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            textTransform: 'uppercase',
            fontSize: 13,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#1abc9c',
          },
          headerTitleStyle: {
            fontWeight: '600',
            color: '#f5f1e8',
          },
          headerTintColor: '#f5f1e8',
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ tabBarLabel: 'Settings' }}
        />
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{ tabBarLabel: 'Stats' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <NicotineProvider>
      <AppTabs />
    </NicotineProvider>
  );
};

export default App;
