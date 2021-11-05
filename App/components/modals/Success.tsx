import React from 'react'

import { mainColor } from '../../globalStyles'

import Message from './Message'

interface Props {
  visible: boolean
  banner?: string
  message?: string
  onPress?: () => void
}

const Success: React.FC<Props> = ({ visible, banner, message, onPress }) => {
  return (
    <Message
      visible={visible}
      banner={banner || 'Success'}
      message={message}
      icon="check-circle"
      backgroundColor={mainColor}
      onPress={onPress}
    />
  )
}

export default Success
