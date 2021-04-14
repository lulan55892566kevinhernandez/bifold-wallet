import React from 'react'

import { Image, Text, TouchableOpacity, View } from 'react-native'

import { Link } from 'react-router-native'

import Images from '../../assets/images'
import AppStyles from '../../assets/styles'
import Styles from './styles'

interface INavbar {
  authenticated: boolean
}

function Navbar(props: INavbar) {
  return (
    <>
      {props.authenticated ? (
        <View style={[Styles.navView, AppStyles.backgroundWhite]}>
          <Link style={Styles.navButton} component={TouchableOpacity} to="/home">
            <Image source={Images.navHome} style={{ width: 32, height: 28 }} />
            <Text style={Styles.textSmall}>Home</Text>
          </Link>
          <Link style={Styles.navButton} component={TouchableOpacity} to="/contacts">
            <Image source={Images.navContacts} style={{ width: 22, height: 28 }} />
            <Text style={Styles.textSmall}>Contacts</Text>
          </Link>
          <Link style={Styles.navButton} component={TouchableOpacity} to="/workflow/connect">
            <Image source={Images.navConnect} style={{ width: 38, height: 43, top: -7 }} />
          </Link>
          <Link style={Styles.navButton} component={TouchableOpacity} to="/credentials">
            <Image source={Images.navCredentials} style={{ width: 32, height: 28 }} />
            <Text style={Styles.textSmall}>Credentials</Text>
          </Link>
          <Link style={Styles.navButton} component={TouchableOpacity} to="/settings">
            <Image source={Images.navSettings} style={{ width: 28, height: 28 }} />
            <Text style={Styles.textSmall}>Settings</Text>
          </Link>
        </View>
      ) : null}
    </>
  )
}

export default Navbar
