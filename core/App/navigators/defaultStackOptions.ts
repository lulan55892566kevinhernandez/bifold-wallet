import { Theme } from '../theme'

export function createDefaultStackOptions({ ColorPallet, TextTheme }: Theme) {
  return {
    headerTintColor: ColorPallet.grayscale.white,
    headerShown: true,
    headerBackTitleVisible: false,
    headerStyle: {
      elevation: 0,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 6,
      shadowColor: ColorPallet.grayscale.black,
      shadowOpacity: 0.15,
      borderBottomWidth: 0,
    },
    headerTitleStyle: {
      ...TextTheme.title,
      color: ColorPallet.grayscale.white,
    },
    headerTitleAlign: 'center' as 'center' | 'left',
  }
}
