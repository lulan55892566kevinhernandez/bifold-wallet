import { useNavigation } from '@react-navigation/core'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TouchableOpacity, View } from 'react-native'

import Arrow from '../assets/icons/large-arrow.svg'
import Onboarding from '../screens/Onboarding'
import { pages, carousel } from '../screens/OnboardingPages'
import PinCreate from '../screens/PinCreate'
import PinEnter from '../screens/PinEnter'
import Splash from '../screens/Splash'
import Terms from '../screens/Terms'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { Colors } from '../theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'

import ContactStack from './ContactStack'
import ScanStack from './ScanStack'
import SettingStack from './SettingStack'
import TabStack from './TabStack'
import defaultStackOptions from './defaultStackOptions'

import { GenericFn, StateFn } from 'types/fn'

const RootStack: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [state, dispatch] = useContext(Context)
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const { t } = useTranslation()

  const authStack = (setAuthenticated: StateFn) => {
    const Stack = createStackNavigator()

    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.EnterPin}>
          {(props) => <PinEnter {...props} setAuthenticated={setAuthenticated} />}
        </Stack.Screen>
      </Stack.Navigator>
    )
  }

  const mainStack = () => {
    const Stack = createStackNavigator()

    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Tabs} component={TabStack} />
        <Stack.Screen name={Screens.Connect} component={ScanStack} options={{ presentation: 'modal' }} />
        <Stack.Screen name={Screens.Settings} component={SettingStack} />
        <Stack.Screen name={Screens.Contacts} component={ContactStack} />
      </Stack.Navigator>
    )
  }

  const onboardingStack = (onSkipTouched: GenericFn, setAuthenticated: StateFn) => {
    const Stack = createStackNavigator()

    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Splash} component={Splash} />
        <Stack.Screen
          name={Screens.Onboarding}
          options={() => ({
            title: 'Onboarding',
            headerTintColor: Colors.white,
            headerShown: true,
            gestureEnabled: false,
            headerLeft: () => false,
            headerRight: () => {
              return (
                // TODO:(jl) Create new type of button component
                <TouchableOpacity
                  accessibilityLabel={t('Global.Skip')}
                  onPress={onSkipTouched}
                  style={{ marginRight: 14 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: Colors.white, fontWeight: 'bold', marginRight: 4 }}>Skip</Text>
                    <Arrow height={15} width={15} fill={Colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
                  </View>
                </TouchableOpacity>
              )
            },
          })}
        >
          {(props) => (
            <Onboarding
              {...props}
              nextButtonText={'Next'}
              previousButtonText={'Back'}
              pages={pages(onSkipTouched)}
              style={carousel}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={Screens.Terms}
          options={() => ({
            title: 'Terms & Conditions',
            headerTintColor: Colors.white,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={Terms}
        />
        <Stack.Screen name={Screens.CreatePin}>
          {(props) => <PinCreate {...props} setAuthenticated={setAuthenticated} />}
        </Stack.Screen>
      </Stack.Navigator>
    )
  }

  const onSkipTouched = () => {
    dispatch({
      type: DispatchAction.SetTutorialCompletionStatus,
      payload: [{ DidCompleteTutorial: true }],
    })

    navigation.navigate(Screens.Terms)
  }

  if (state.onboarding.DidAgreeToTerms && state.onboarding.DidCompleteTutorial && state.onboarding.DidCreatePIN) {
    return authenticated ? mainStack() : authStack(setAuthenticated)
  }

  return onboardingStack(onSkipTouched, setAuthenticated)
}

export default RootStack
