
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const refreshCookieName = 'refreshToken'

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: 'relay-operator',
    },
    env.accessSecret,
    { expiresIn: env.accessTtl },
  )

export const signRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      username: user.username,
      type: 'refresh',
    },
    env.refreshSecret,
    { expiresIn: env.refreshTtl },
  )

export const verifyRefreshToken = (token) => jwt.verify(token, env.refreshSecret)

export const setRefreshCookie = (response, token) => {
  response.cookie(refreshCookieName, token, {
    httpOnly: true,
    sameSite: env.isProduction ? 'none' : 'lax',
    secure: env.isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export const clearRefreshCookie = (response) => {
  response.clearCookie(refreshCookieName, {
    httpOnly: true,
    sameSite: env.isProduction ? 'none' : 'lax',
    secure: env.isProduction,
  })
}

export const buildAuthPayload = (user) => ({
  accessToken: signAccessToken(user),
  user: {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  },
  source: 'backend',
})
