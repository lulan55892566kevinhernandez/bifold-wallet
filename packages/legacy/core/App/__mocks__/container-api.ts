import { BrandingOverlayType, DefaultOCABundleResolver } from '@hyperledger/aries-oca/build/legacy'

const { TOKENS: T } = jest.requireActual('../../App/container-api')

export { T as TOKENS }

const resolver = new DefaultOCABundleResolver(require('../../App/assets/oca-bundles.json'), {
  brandingOverlayType: BrandingOverlayType.Branding10,
})

export const useContainer = jest.fn().mockReturnValue({
  resolve: jest.fn().mockReturnValue(resolver),
})

// export const useContainer = jest.fn().mockReturnValue({
//   resolve: jest.fn().mockReturnValue({
//     resolve: jest.fn().mockImplementation(() => Promise.resolve({})),
//     resolveAllBundles: jest.fn().mockImplementation(() => Promise.resolve({})),
//   }),
// })
