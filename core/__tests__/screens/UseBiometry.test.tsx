import { render, fireEvent, waitFor } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import UseBiometry from '../../App/screens/UseBiometry'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

jest.mock('react-native-device-info', () => {
  return {
    isEmulatorSync: () => {
      return true
    },
  }
})

describe('UseBiometry Screen', () => {
  test.skip('Renders correctly when biometry available', () => {
    // const tree = render(
    //   <AuthContext.Provider
    //     value={{
    //       checkPIN: jest.fn(),
    //       commitPIN: jest.fn(),
    //       getWalletCredentials: jest.fn(),
    //       setPIN: jest.fn(),
    //       isBiometricsActive: jest.fn().mockReturnValue(Promise.resolve(true)),
    //     }}
    //   >
    //     <UseBiometry />
    //   </AuthContext.Provider>
    // )
    expect(tree).toMatchSnapshot()
  })

  test.skip('Renders correctly when biometry not available', () => {
    // const tree = render(
    //   <AuthContext.Provider
    //     value={{
    //       checkPIN: jest.fn(),
    //       commitPIN: jest.fn(),
    //       getWalletCredentials: jest.fn(),
    //       setPIN: jest.fn(),
    //       isBiometricsActive: jest.fn().mockReturnValue(Promise.resolve(false)),
    //     }}
    //   >
    //     <UseBiometry />
    //   </AuthContext.Provider>
    // )
    expect(tree).toMatchSnapshot()
  })

  test.skip('Toggles use biometrics ok', async () => {
    const commitPIN = jest.fn()
    // const tree = render(
    //   <AuthContext.Provider
    //     value={{
    //       checkPIN: jest.fn(),
    //       commitPIN,
    //       getWalletCredentials: jest.fn(),
    //       setPIN: jest.fn(),
    //       isBiometricsActive: jest.fn().mockReturnValue(Promise.resolve(true)),
    //     }}
    //   >
    //     <UseBiometry />
    //   </AuthContext.Provider>
    // )

    // const useBiometryToggle = await tree.getByTestId(testIdWithKey('ToggleBiometrics'))
    // await waitFor(async () => {
    //   await fireEvent(useBiometryToggle, 'valueChange', true)
    // })

    // const continueButton = await tree.getByTestId(testIdWithKey('Continue'))
    // await waitFor(async () => {
    //   await fireEvent(continueButton, 'press')
    // })

    // expect(useBiometryToggle).not.toBeNull()
    // expect(continueButton).not.toBeNull()
    // expect(commitPIN).toBeCalledTimes(1)
    expect(tree).toMatchSnapshot()
  })
})
