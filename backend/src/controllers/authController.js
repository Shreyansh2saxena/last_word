import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import {
  buildAuthPayload,
  clearRefreshCookie,
  setRefreshCookie,
  signRefreshToken,
  verifyRefreshToken,
} from '../services/tokenService.js'
import { createUser, findUserById, findUserByUsername, updateUser, userCount } from '../utils/userStore.js'

const normalizeUsername = (username = '') => username.trim().toLowerCase()

const ensureCredentials = (username, password) => {
  if (typeof username !== 'string' || username.trim().length < 3) {
    return 'Username must be at least 3 characters.'
  }

  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters.'
  }

  return null
}

const attachRefreshToken = (response, user) => {
  const refreshToken = signRefreshToken(user)
  user.refreshToken = refreshToken
  updateUser(user)
  setRefreshCookie(response, refreshToken)
}

export const register = async (request, response) => {
  const { username, password } = request.body ?? {}
  const validationError = ensureCredentials(username, password)

  if (validationError) {
    return response.status(400).json({ message: validationError })
  }

  const normalizedUsername = normalizeUsername(username)

  if (findUserByUsername(normalizedUsername)) {
    return response.status(409).json({ message: 'Username already exists.' })
  }

  const user = createUser({
    id: uuid(),
    username: normalizedUsername,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
    refreshToken: null,
  })

  attachRefreshToken(response, user)

  return response.status(201).json(buildAuthPayload(user))
}

export const login = async (request, response) => {
  const { username, password } = request.body ?? {}
  const validationError = ensureCredentials(username, password)

  if (validationError) {
    return response.status(400).json({ message: validationError })
  }

  const user = findUserByUsername(normalizeUsername(username))

  if (!user) {
    return response.status(401).json({ message: 'Invalid username or password.' })
  }

  const matches = await bcrypt.compare(password, user.passwordHash)

  if (!matches) {
    return response.status(401).json({ message: 'Invalid username or password.' })
  }

  attachRefreshToken(response, user)

  return response.json(buildAuthPayload(user))
}

export const refresh = async (request, response) => {
  const refreshToken = request.cookies?.refreshToken

  if (!refreshToken) {
    return response.status(401).json({ message: 'Missing refresh token.' })
  }

  try {
    const payload = verifyRefreshToken(refreshToken)
    const user = findUserById(payload.sub)

    if (!user || user.refreshToken !== refreshToken) {
      return response.status(401).json({ message: 'Refresh token is not valid.' })
    }

    attachRefreshToken(response, user)

    return response.json(buildAuthPayload(user))
  } catch {
    return response.status(401).json({ message: 'Refresh token expired or invalid.' })
  }
}

export const logout = async (request, response) => {
  const refreshToken = request.cookies?.refreshToken

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken)
      const user = findUserById(payload.sub)

      if (user) {
        user.refreshToken = null
        updateUser(user)
      }
    } catch {
      // Ignore invalid tokens during logout.
    }
  }

  clearRefreshCookie(response)
  return response.json({ ok: true })
}

export const health = async (_request, response) => {
  return response.json({
    status: 'ok',
    service: 'last-message-backend',
    users: userCount(),
    time: new Date().toISOString(),
  })
}
