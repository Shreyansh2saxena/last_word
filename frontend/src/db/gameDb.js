import Dexie from 'dexie'

class LastMessageDb extends Dexie {
  constructor() {
    super('last-message-db')

    this.version(1).stores({
      meta: 'key',
      saves: 'username',
      actionLog: '++id, username, action, createdAt',
    })

    this.version(2).stores({
      meta: 'key',
      saves: 'username',
      actionLog: '++id, username, action, createdAt',
      generatedMessages: '++id, messageId',
    })

    this.version(3).stores({
      meta: 'key',
      saves: 'username',
      actionLog: '++id, username, action, createdAt',
      generatedMessages: '++id, messageId',
      worldAnalysis: '++id, username',
    })
  }
}

export const gameDb = new LastMessageDb()

export const loadLastProfile = async () => {
  const lastProfile = await gameDb.meta.get('last-profile')
  return lastProfile?.value ?? null
}

export const saveLastProfile = async (username) => {
  await gameDb.meta.put({ key: 'last-profile', value: username })
}

export const loadSnapshot = async (username) => {
  if (!username) return null
  const snapshot = await gameDb.saves.get(username)
  return snapshot?.data ?? null
}

export const saveSnapshot = async (username, data) => {
  await gameDb.saves.put({
    username,
    data,
    updatedAt: new Date().toISOString(),
  })
}

export const appendActionLog = async (entry) => {
  await gameDb.actionLog.add(entry)
}

export const storeGeneratedMessage = async (messageId) => {
  await gameDb.generatedMessages.add({
    messageId,
    createdAt: new Date().toISOString(),
  })
}

export const removeGeneratedMessage = async (messageId) => {
  await gameDb.generatedMessages.where('messageId').equals(messageId).delete()
}

export const loadWorldAnalysis = async (username) => {
  if (!username) return null
  return gameDb.worldAnalysis.where('username').equals(username).first()
}

export const saveWorldAnalysis = async (username, data) => {
  if (!username) return
  await gameDb.worldAnalysis.where('username').equals(username).delete()
  await gameDb.worldAnalysis.add({ username, ...data, createdAt: new Date().toISOString() })
}
