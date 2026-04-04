import 'fake-indexeddb/auto'
import '@testing-library/jest-dom'

// Polyfill crypto.randomUUID for jsdom
if (typeof globalThis.crypto?.randomUUID !== 'function') {
  globalThis.crypto = {
    ...globalThis.crypto,
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }
  }
}
