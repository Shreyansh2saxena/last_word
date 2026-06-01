import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import { health } from './controllers/authController.js'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
)

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
)

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

app.use(cookieParser())
app.use(express.json())

app.get('/health', health)
app.use(authRoutes)

app.use(errorHandler)

export default app
