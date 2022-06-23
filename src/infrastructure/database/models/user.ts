import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

export type CheckPasswordFnType = (receivedPassword: string) => Promise<boolean>

export type UserType = mongoose.Model<any> & {
  email: string
  password: string
  checkPassword: CheckPasswordFnType
}

const { Schema } = mongoose

const userData = {
  email: {
    type: String,
    trim: true,
    required: true,
    index: {
      unique: true,
    },
  },
  password: {
    type: String,
    required: true,
  },
}

const userSchema = new Schema(userData)

userSchema.pre('save', function (next) {
  const user = this
  const salt = bcrypt.genSaltSync(15)
  bcrypt.hash(this.password, salt, (err, hash) => {
    if (err) return next(err)
    user.password = hash
    return next()
  })
})

export const User = mongoose.model<UserType>('User', userSchema, 'users')
