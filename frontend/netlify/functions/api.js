import express from 'express'
import serverless from 'serverless-http'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret'
const ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? '15m'
const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '7d'
const IS_PROD = process.env.NODE_ENV === 'production'

// In-memory store — persists across warm invocations of the same container
const usersByUsername = new Map()
const usersById = new Map()

const signAccess = (user) =>
  jwt.sign({ sub: user.id, username: user.username, role: 'relay-operator' }, ACCESS_SECRET, { expiresIn: ACCESS_TTL })

const signRefresh = (user) =>
  jwt.sign({ sub: user.id, username: user.username, type: 'refresh' }, REFRESH_SECRET, { expiresIn: REFRESH_TTL })

const setCookie = (res, token) =>
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: IS_PROD ? 'none' : 'lax',
    secure: IS_PROD,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

const clearCookie = (res) =>
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: IS_PROD ? 'none' : 'lax',
    secure: IS_PROD,
  })

const authPayload = (user) => ({
  accessToken: signAccess(user),
  user: { id: user.id, username: user.username, createdAt: user.createdAt },
  source: 'backend',
})

const validate = (username, password) => {
  if (!username || username.trim().length < 3) return 'Username must be at least 3 characters.'
  if (!password || password.length < 6) return 'Password must be at least 6 characters.'
  return null
}

const app = express()

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }))
app.use(cookieParser())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'last-message-backend', users: usersById.size, time: new Date().toISOString() })
})

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body ?? {}
  const err = validate(username, password)
  if (err) return res.status(400).json({ message: err })

  const name = username.trim().toLowerCase()
  if (usersByUsername.has(name)) return res.status(409).json({ message: 'Username already exists.' })

  const user = {
    id: uuid(),
    username: name,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
    refreshToken: null,
  }
  usersByUsername.set(name, user)
  usersById.set(user.id, user)

  const refresh = signRefresh(user)
  user.refreshToken = refresh
  setCookie(res, refresh)

  return res.status(201).json(authPayload(user))
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body ?? {}
  const err = validate(username, password)
  if (err) return res.status(400).json({ message: err })

  const user = usersByUsername.get(username.trim().toLowerCase())
  if (!user) return res.status(401).json({ message: 'Invalid username or password.' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid username or password.' })

  const refresh = signRefresh(user)
  user.refreshToken = refresh
  setCookie(res, refresh)

  return res.json(authPayload(user))
})

app.post('/api/refresh', (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ message: 'Missing refresh token.' })

  try {
    const payload = jwt.verify(token, REFRESH_SECRET)
    const user = usersById.get(payload.sub)
    if (!user || user.refreshToken !== token) return res.status(401).json({ message: 'Refresh token is not valid.' })

    const refresh = signRefresh(user)
    user.refreshToken = refresh
    setCookie(res, refresh)

    return res.json(authPayload(user))
  } catch {
    return res.status(401).json({ message: 'Refresh token expired or invalid.' })
  }
})

app.post('/api/logout', (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) {
    try {
      const payload = jwt.verify(token, REFRESH_SECRET)
      const user = usersById.get(payload.sub)
      if (user) user.refreshToken = null
    } catch {}
  }
  clearCookie(res)
  return res.json({ ok: true })
})

export const handler = serverless(app)
