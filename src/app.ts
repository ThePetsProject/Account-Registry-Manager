import express from 'express'
import cors from 'cors'
import { routesArray } from './infrastructure/routes'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const router = express.Router()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api/v1/account/register', routesArray(router))

export default app
