import { Howler } from 'howler'

export const primeAudioSystem = () => {
  Howler.autoUnlock = true
  Howler.volume(0.55)
}
