import { User, UserType } from '@src/infrastructure/database/models/user'
import { Router } from 'express'
import mongoose from 'mongoose'
import { Request, Response } from 'express'
import Joi from 'joi'

export type RegisterRouteFnType = (
  router: Router,
  user: mongoose.Model<UserType>
) => Router

export const registerHandler = async (
  user: mongoose.Model<UserType>,
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body

  console.info(`[ACC-REGISTRY-MANAGER] Trying registry for ${email}`)

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })

  const { error, value } = schema.validate({ email, password })

  if (error) {
    console.error(
      `[ACC-REGISTRY-MANAGER][SCHEMA_ERROR][ERROR_MESSAGE] ${error.message}`
    )
    return res.status(400).send({
      success: false,
      message: error.message,
    })
  }

  const userExists = await user.findOne({
    email: email.toLowerCase().trim(),
  })

  if (userExists) {
    console.error(
      `[ACC-REGISTRY-MANAGER][USER_ERROR][USER_EXISTS] User ${email} already exists`
    )
    return res.status(409).send({
      success: false,
      message: 'User exists',
    })
  }

  const savedUser = await User.create({ email, password })

  if (!savedUser) {
    console.error(
      `[ACC-REGISTRY-MANAGER][USER_ERROR][CANT_CREATE] User ${email} could not be created: ${savedUser}`
    )
    return res.status(500).send({
      success: false,
      message: savedUser,
    })
  }

  console.info(`[ACC-REGISTRY-MANAGER][USER_CREATED]User ${email} created`)

  return res.status(201).send({
    success: true,
  })
}

export const registerRoute: RegisterRouteFnType = (
  router: Router,
  user: mongoose.Model<UserType>
): Router => {
  return router.post('/', (req, res) => registerHandler(user, req, res))
}
