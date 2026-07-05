import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { mailProvider } from './lib/mailer'
import productsRouter from './routes/products'
import categoriesRouter from './routes/categories'
import ordersRouter from './routes/orders'
import payfastRouter from './routes/payfast'
import landingRouter from './routes/landing'
import authRouter from './routes/auth'
import meRouter from './routes/me'

const app = express()

// Allowed browser origins. The frontends mostly call this API server-to-server
// (no CORS), but this keeps any browser-side calls safe in production.
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. https://araish.vercel.app
  process.env.ADMIN_URL, // e.g. https://araish-admin.vercel.app
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
].filter(Boolean) as string[]

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, server-to-server — no Origin header).
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error(`Not allowed by CORS: ${origin}`))
    }
  })
)

app.use(express.json())
// PayFast posts its IPN callback as form-urlencoded, so parse that too.
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  // `mail` tells you at a glance whether email is configured in THIS environment:
  // "resend" or "smtp" = good; "none" = no email will send (set the env vars).
  res.json({ ok: true, service: 'a-backend', time: new Date().toISOString(), mail: mailProvider })
})

app.use('/v1/products', productsRouter)
app.use('/v1/categories', categoriesRouter)
app.use('/v1/orders', ordersRouter)
app.use('/v1/payfast', payfastRouter)
app.use('/v1/landing', landingRouter)
app.use('/v1/auth', authRouter)
app.use('/v1/me', meRouter)

const PORT = Number(process.env.PORT ?? 4000)
app.listen(PORT, () => {
  console.log(`A-Backend API listening on port ${PORT}`)
})
