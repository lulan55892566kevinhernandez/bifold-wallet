import { ConnectionRecord, CredentialRecord, ProofRecord, RequestedAttribute } from '@aries-framework/core'
import { useConnectionById, useCredentialById, useProofById } from '@aries-framework/react-hooks'
import startCase from 'lodash.startcase'
import { parseUrl } from 'query-string'

import { indyCredentialKey, IndexedIndyCredentialMetadata } from '../constants'

export function parseSchema(schemaId?: string): { name: string; version: string } {
  let name = 'Credential'
  let version = ''
  if (schemaId) {
    const schemaIdRegex = /(.*?):([0-9]):([a-zA-Z .\-_0-9]+):([a-z0-9._-]+)$/
    const schemaIdParts = schemaId.match(schemaIdRegex)
    if (schemaIdParts?.length === 5) {
      name = `${schemaIdParts?.[3].replace(/_|-/g, ' ')}`
        .split(' ')
        .map((schemaIdPart) => schemaIdPart.charAt(0).toUpperCase() + schemaIdPart.substring(1))
        .join(' ')
      version = schemaIdParts?.[4]
    }
  }
  return { name, version }
}

export function credentialSchema(credential: CredentialRecord): string | undefined {
  return credential.metadata.get<IndexedIndyCredentialMetadata>(indyCredentialKey)?.schemaId
}

export function parsedSchema(credential: CredentialRecord): { name: string; version: string } {
  return parseSchema(credentialSchema(credential))
}

/**
 * Adapted from https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
 */
export function hashCode(s: string): number {
  return s.split('').reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0)
}

export function hashToRGBA(i: number) {
  const colour = (i & 0x00ffffff).toString(16).toUpperCase()
  return '#' + '00000'.substring(0, 6 - colour.length) + colour
}

export function credentialRecordFromId(credentialId?: string): CredentialRecord | void {
  if (credentialId) {
    return useCredentialById(credentialId)
  }
}

export function connectionRecordFromId(connectionId?: string): ConnectionRecord | void {
  if (connectionId) {
    return useConnectionById(connectionId)
  }
}

export function proofRecordFromId(proofId?: string): ProofRecord | void {
  if (proofId) {
    return useProofById(proofId)
  }
}

export function getConnectionName(connection: ConnectionRecord | void): string | void {
  if (!connection) {
    return
  }
  return connection?.alias || connection?.invitation?.label
}

export function firstMatchingCredentialAttributeValue(attributeName: string, attributes: RequestedAttribute[]): string {
  if (!attributes.length) {
    return ''
  }
  const firstMatchingCredential = attributes[0].credentialInfo
  if (!firstMatchingCredential) {
    return ''
  }
  const match = Object.entries(firstMatchingCredential.attributes).find(
    ([n]) => startCase(n) === startCase(attributeName)
  )
  return match?.length ? match[1] : ''
}

export const isRedirection = (url: string): boolean => {
  const queryParams = parseUrl(url).query
  return !(queryParams['c_i'] || queryParams['d_m'])
}
