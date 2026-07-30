import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';

import BooksScreen from "../screens/Bookscreen";
import SearchScreen from "../screens/Searchscreen";
import VersesScreen from "../screens/Versesscreen";
import HomeScreen from "../screens/Homescreen";
import ChaptersScreen from "../screens/Chapterscreen";
import BookmarksScreen from "../screens/BookmarksScreen";
import NotesScreen from "../screens/NotesScreen";
import SermonScreen from "../screens/SermonScreen";
import AddSermonScreen from "../screens/AddSermonScreen";
import SermonDetailScreen from "../screens/SermonDetailScreen";
import EditSermonScreen from "../screens/EditSermonScreen";


const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

function BibleStack() {

  return (

    <Stack.Navigator>

      <Stack.Screen name="Books" component={BooksScreen} />

      <Stack.Screen name="Chapters" component={ChaptersScreen} />

      <Stack.Screen name="Verses" component={VersesScreen} />

      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />

      <Stack.Screen
        name="Notes"
        component={NotesScreen}
      />

      <Stack.Screen
        name="Sermons"
        component={SermonScreen}
      />

      <Stack.Screen
        name="AddSermon"
        component={AddSermonScreen}
      />

      <Stack.Screen
        name="SermonDetail"
        component={SermonDetailScreen}
      />

      <Stack.Screen
        name="EditSermon"
        component={EditSermonScreen}
      />

    </Stack.Navigator>

  );

}

export default function AppNavigator() {

  return (

    <NavigationContainer>

      <Tab.Navigator

        screenOptions={({ route }) => ({

          tabBarIcon: ({ color, size }) => {

            let iconName = 'home';

            if (route.name === 'Home') iconName = 'home';

            if (route.name === 'Bible') iconName = 'book';

            if (route.name === 'Search') iconName = 'search';

            return <Ionicons name={iconName} size={size} color={color} />;

          },

          tabBarActiveTintColor: '#1f6f43',

          tabBarInactiveTintColor: 'gray',

        })}

      >

        <Tab.Screen name="Home" component={HomeScreen} />

        <Tab.Screen name="Bible" component={BibleStack} />

        <Tab.Screen name="Search" component={SearchScreen} />

      </Tab.Navigator>

    </NavigationContainer>

  );

}