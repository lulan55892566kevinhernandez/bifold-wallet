import React, {useState, useEffect, useContext} from 'react'

import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import AppHeader from '../../AppHeader/index'
import BackButton from '../../BackButton/index'
import CurrentContact from '../../CurrentContact/index'
import CurrentCredential from '../../CurrentCredential/index'
import LoadingOverlay from '../../LoadingOverlay/index'

import {ErrorsContext} from '../../Errors/index'
import {NotificationsContext} from '../../Notifications/index'

import Images from '../../../assets/images'
import Styles from '../styles'
import AppStyles from '../../../assets/styles'
import { IContact, ICredential } from '../../../types'

interface ICredentialOffered {
  contact: IContact
  credential: ICredential
}

function CredentialOffered(props: ICredentialOffered) {
  let history = useHistory()

  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  const [viewContact, setViewContact] = useState(true)
  const [viewCredential, setViewCredential] = useState(true)

  return (
    <>
      <BackButton backPath={'/workflow/connect'} />
      {!viewContact ? (
        <CurrentContact
          contact={props.contact}
          setViewContact={setViewContact}
        />
      ) : (
        <>
          {!viewCredential ? (
            <CurrentCredential
              credential={props.credential}
              setViewCredential={setViewCredential}
            />
          ) : (
            <View style={AppStyles.viewFull}>
              <View style={AppStyles.header}>
                <AppHeader headerText={'CREDENTIALS'} />
              </View>
              <View style={[AppStyles.tab, Styles.tabView]}>
                <Text
                  style={[
                    AppStyles.h3,
                    AppStyles.textSecondary,
                    AppStyles.textUpper,
                    AppStyles.textBold,
                  ]}>
                  Connected to:
                </Text>
                <View style={AppStyles.tableItem}>
                  <View>
                    <Text
                      style={[
                        {fontSize: 18},
                        AppStyles.textSecondary,
                        AppStyles.textUpper,
                        AppStyles.textBold,
                      ]}>
                      {props.contact.label}
                    </Text>
                    <Text style={[{fontSize: 14}, AppStyles.textSecondary]}>
                      {props.contact.sublabel}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setViewContact(!viewContact)
                    }}>
                    <Image
                      source={Images.infoGray}
                      style={[AppStyles.info, {marginRight: 0, top: 10}]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={AppStyles.tableItem}>
                  <View>
                    <Text
                      style={[
                        {fontSize: 18},
                        AppStyles.textSecondary,
                        AppStyles.textUpper,
                        AppStyles.textBold,
                      ]}>
                      {props.credential.label}
                    </Text>
                    <Text style={[{fontSize: 14}, AppStyles.textSecondary]}>
                      {props.credential.sublabel}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setViewCredential(!viewCredential)
                    }}>
                    <Image
                      source={Images.infoGray}
                      style={[AppStyles.info, {marginRight: 0, top: 10}]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={Styles.buttonWrap}>
                  <Text
                    style={[
                      {fontSize: 18},
                      AppStyles.textSecondary,
                      AppStyles.textUpper,
                      Styles.buttonText,
                      AppStyles.textBold,
                    ]}>
                    ACCEPT CREDENTIALS
                  </Text>
                  <TouchableOpacity
                    style={[Styles.button, AppStyles.backgroundPrimary]}>
                    <Image source={Images.receive} style={Styles.buttonIcon} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{top: 60}}
                  onPress={() => history.push('/home')}>
                  <Text
                    style={[
                      {fontSize: 14},
                      AppStyles.textGray,
                      AppStyles.textCenter,
                    ]}>
                    Decline{'\n'}Offer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </>
  )
}

export default CredentialOffered
