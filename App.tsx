import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import TabNavigator from './src/navigation/TabNavigator'

// O App só monta a navegação. Cada tela cuida do que é dela.
export default function App() {
    return (
        <NavigationContainer>
            <StatusBar style="dark" />
            <TabNavigator />
        </NavigationContainer>
    )
}
