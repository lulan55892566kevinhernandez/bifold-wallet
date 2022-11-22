import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StatusBar, Keyboard, StyleSheet, Text, Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button, ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import AlertModal from '../components/modals/AlertModal'
import PopupModal from '../components/modals/PopupModal'
import { attemptLockoutBaseRules, attemptLockoutThresholdRules } from '../constants'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { hashPIN } from '../utils/crypto'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

interface PinEnterProps {
  setAuthenticated: (status: boolean) => void
  pinEntryUsage?: PinEntryUsage
}

export enum PinEntryUsage {
  PinCheck,
  WalletUnlock,
}

const PinEnter: React.FC<PinEnterProps> = ({ setAuthenticated, pinEntryUsage = PinEntryUsage.WalletUnlock }) => {
  const { t } = useTranslation()
  const { checkPIN, getWalletCredentials, isBiometricsActive, disableBiometrics } = useAuth()
  const [store, dispatch] = useStore()
  const [pin, setPin] = useState<string>('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [displayLockoutWarning, setDisplayLockoutWarning] = useState(false)
  const navigation = useNavigation()
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false)
  const [biometricsEnrollmentChange, setBiometricsEnrollmentChange] = useState<boolean>(false)
  const { ColorPallet, TextTheme, Assets } = useTheme()

  const style = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
    notifyText: {
      ...TextTheme.normal,
      marginVertical: 5,
    },
  })

  // This method is used to notify the app that the user is able to receive another lockout penalty
  const unMarkServedPenalty = () => {
    dispatch({
      type: DispatchAction.ATTEMPT_UPDATED,
      payload: [
        {
          loginAttempts: store.loginAttempt.loginAttempts,
          lockoutDate: store.loginAttempt.lockoutDate,
          servedPenalty: false,
        },
      ],
    })
  }

  const attemptLockout = async (penalty: number) => {
    // set the attempt lockout time
    dispatch({
      type: DispatchAction.ATTEMPT_UPDATED,
      payload: [
        { loginAttempts: store.loginAttempt.loginAttempts, lockoutDate: Date.now() + penalty, servedPenalty: false },
      ],
    })
    navigation.navigate(Screens.AttemptLockout as never)
  }

  const getLockoutPenalty = (attempts: number): number | undefined => {
    let penalty = attemptLockoutBaseRules[attempts]
    if (
      !penalty &&
      attempts >= attemptLockoutThresholdRules.attemptThreshold &&
      !(attempts % attemptLockoutThresholdRules.attemptIncrement)
    ) {
      penalty = attemptLockoutThresholdRules.attemptPenalty
    }
    return penalty
  }

  const loadWalletCredentials = async () => {
    if (pinEntryUsage === PinEntryUsage.PinCheck) {
      return
    }

    const creds = await getWalletCredentials()
    if (creds && creds.key) {
      // remove lockout notification
      dispatch({
        type: DispatchAction.LOCKOUT_UPDATED,
        payload: [{ displayNotification: false }],
      })

      // reset login attempts if login is successful
      dispatch({
        type: DispatchAction.ATTEMPT_UPDATED,
        payload: [{ loginAttempts: 0 }],
      })

      setAuthenticated(true)
    }
  }

  useEffect(() => {
    if (!store.preferences.useBiometry) {
      return
    }

    isBiometricsActive().then((res) => {
      if (!res) {
        // biometry state has changed, display message and disable biometry
        setBiometricsEnrollmentChange(true)
        disableBiometrics()
        dispatch({
          type: DispatchAction.USE_BIOMETRY,
          payload: [false],
        })
      }
    })

    loadWalletCredentials().catch((error: unknown) => {
      // TODO:(jl) Handle error
    })
  }, [])

  useEffect(() => {
    // check number of login attempts and determine if app should apply lockout
    const attempts = store.loginAttempt.loginAttempts
    const penalty = getLockoutPenalty(attempts)
    if (penalty && !store.loginAttempt.servedPenalty) {
      // only apply lockout if user has not served their penalty
      attemptLockout(penalty)
    }

    // display warning if we are one away from a lockout
    const displayWarning = !!getLockoutPenalty(attempts + 1)
    setDisplayLockoutWarning(displayWarning)
  }, [store.loginAttempt.loginAttempts])

  const unlockWalletWithPIN = async (pin: string) => {
    try {
      setContinueEnabled(false)
      const result = await checkPIN(pin)

      if (store.loginAttempt.servedPenalty) {
        // once the user starts entering their PIN, unMark them as having served their lockout penalty
        unMarkServedPenalty()
      }

      if (!result) {
        const newAttempt = store.loginAttempt.loginAttempts + 1
        if (!getLockoutPenalty(newAttempt)) {
          // skip displaying modals if we are going to lockout
          setAlertModalVisible(true)
        }

        setContinueEnabled(true)

        // log incorrect login attempts
        dispatch({
          type: DispatchAction.ATTEMPT_UPDATED,
          payload: [{ loginAttempts: newAttempt }],
        })

        return
      }

      // reset login attempts if login is successful
      dispatch({
        type: DispatchAction.ATTEMPT_UPDATED,
        payload: [{ loginAttempts: 0 }],
      })

      setAuthenticated(true)
    } catch (error: unknown) {
      // TODO:(jl) process error
    }
  }

  const clearAlertModal = () => {
    switch (pinEntryUsage) {
      case PinEntryUsage.PinCheck:
        setAlertModalVisible(false)
        setAuthenticated(false)
        break

      default:
        setAlertModalVisible(false)

        break
    }

    setAlertModalVisible(false)
  }

  const verifyPIN = async (pin: string) => {
    try {
      const credentials = await getWalletCredentials()
      if (!credentials) {
        throw new Error('Problem')
      }

      const key = await hashPIN(pin, credentials.salt)

      if (credentials.key !== key) {
        setAlertModalVisible(true)

        return
      }

      setAuthenticated(true)
    } catch (error) {
      //TODO:(jl)
    }
  }

  const onPinInputCompleted = async (pin: string) => {
    try {
      setContinueEnabled(false)

      if (pinEntryUsage === PinEntryUsage.PinCheck) {
        await verifyPIN(pin)
      }

      if (pinEntryUsage === PinEntryUsage.WalletUnlock) {
        await unlockWalletWithPIN(pin)
      }
    } catch (error: unknown) {
      // TODO:(jl) process error
    }
  }

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={
          Platform.OS === 'android' || pinEntryUsage === PinEntryUsage.PinCheck
            ? StatusBarStyles.Light
            : statusBarStyleForColor(style.container.backgroundColor)
        }
      />
      <View style={[style.container]}>
        <Image
          source={Assets.img.logoSecondary.src}
          style={{
            height: Assets.img.logoSecondary.height,
            width: Assets.img.logoSecondary.width,
            resizeMode: Assets.img.logoSecondary.resizeMode,
            alignSelf: 'center',
            marginBottom: 20,
          }}
        />
        {biometricsEnrollmentChange ? (
          <>
            <Text style={[TextTheme.normal, { alignSelf: 'center', textAlign: 'center' }]}>
              {t('PinEnter.BiometricsChanged')}
            </Text>
            <Text style={[TextTheme.normal, { alignSelf: 'center', marginBottom: 16 }]}>
              {t('PinEnter.BiometricsChangedEnterPIN')}
            </Text>
          </>
        ) : (
          <Text style={[TextTheme.normal, { alignSelf: 'center', marginBottom: 16 }]}>{t('PinEnter.EnterPIN')}</Text>
        )}
        <PinInput
          onPinChanged={setPin}
          testID={testIdWithKey('EnterPIN')}
          accessibilityLabel={t('PinEnter.EnterPIN')}
          autoFocus={true}
        />
        {alertModalVisible && <AlertModal title={t('PinEnter.IncorrectPIN')} message="" submit={clearAlertModal} />}
        {store.lockout.displayNotification && (
          <PopupModal
            notificationType={InfoBoxType.Info}
            title={t('PinEnter.LoggedOut')}
            bodyContent={
              <View>
                <Text style={style.notifyText}>{t('PinEnter.LoggedOutDescription')}</Text>
              </View>
            }
            onCallToActionLabel={t('Global.Okay')}
            onCallToActionPressed={() => {
              dispatch({
                type: DispatchAction.LOCKOUT_UPDATED,
                payload: [{ displayNotification: false }],
              })
            }}
          />
        )}
      </View>
      <View style={{ marginTop: 'auto', margin: 20, marginBottom: 10 }}>
        <Button
          title={t('PinEnter.Unlock')}
          buttonType={ButtonType.Primary}
          testID={testIdWithKey('Enter')}
          disabled={!continueEnabled}
          accessibilityLabel={t('PinEnter.Unlock')}
          onPress={() => {
            Keyboard.dismiss()
            onPinInputCompleted(pin)
          }}
        />
      </View>

      {store.preferences.useBiometry && pinEntryUsage === PinEntryUsage.WalletUnlock && (
        <>
          <Text style={[TextTheme.normal, { alignSelf: 'center' }]}>{t('PinEnter.Or')}</Text>
          <View style={{ margin: 20, marginTop: 10 }}>
            <Button
              title={t('PinEnter.BiometricsUnlock')}
              buttonType={ButtonType.Secondary}
              testID={testIdWithKey('Enter')}
              disabled={!continueEnabled}
              accessibilityLabel={t('PinEnter.BiometricsUnlock')}
              onPress={loadWalletCredentials}
            />
          </View>
        </>
      )}

      {alertModalVisible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PinEnter.IncorrectPIN')}
          bodyContent={
            <View>
              <Text style={style.notifyText}>{t('PinEnter.RepeatPIN')}</Text>
              {displayLockoutWarning ? (
                <Text style={style.notifyText}>{t('PinEnter.AttemptLockoutWarning')}</Text>
              ) : null}
            </View>
          }
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={clearAlertModal}
        />
      )}
    </SafeAreaView>
  )
}

export default PinEnter
