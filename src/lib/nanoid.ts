import { customAlphabet } from 'nanoid'

export function newPubId() {
  const alphabet = '123456789abcdefghijklmnopqrstuvwxyz'
  return customAlphabet(alphabet, 12)
}
