import supertest from 'supertest'
import app from '../../../app'
import * as registerModules from '.'
import { CheckPasswordFnType, User, UserType } from '../../database/models/user'
import { Request, Response } from 'express'

const baseRoute = '/api/v1/account/register'
const { registerHandler } = registerModules

jest.spyOn(global.console, 'error').mockImplementation(() => {})
jest.spyOn(global.console, 'info').mockImplementation(() => {})

const responseTokens = {
  accToken: 'fakeacctoken',
  refToken: 'fakereftoken',
}

describe('Login route', () => {
  let request: supertest.SuperTest<supertest.Test>

  beforeAll(() => {
    request = supertest(app)
  })

  beforeEach(() => {
    User.findOne = jest.fn().mockResolvedValueOnce(undefined)

    jest.spyOn(User, 'create').mockImplementation((): Promise<any> => {
      const mockUserDocument = {
        email: 'test@example.com',
        password: 'password',
        checkPassword: jest.fn() as CheckPasswordFnType,
      }
      return Promise.resolve(mockUserDocument as any)
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Should call method when root path', (done) => {
    const spy = jest.spyOn(registerModules, 'registerHandler')

    request
      .post(`${baseRoute}/`)
      .send({
        email: 'fake@email.com',
        password: 'fakepwd',
      })
      .expect(201)
      .then(() => {
        expect(spy).toHaveBeenCalled()
        done()
      })
  })

  it('Should return 201 when user is created', async () => {
    const req = {
      body: {
        email: 'fake@email.com',
        password: 'fakepwd',
      },
    } as Request

    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as any as Response

    const registerResponse = await registerHandler(User, req, res)
    expect(registerResponse.status).toHaveBeenCalledWith(201)
  })

  it('Should return 400 if Joi fails', async () => {
    const req = {
      body: {
        email: 'fakeemail.com',
        password: 'fakepwd',
      },
    } as Request

    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as any as Response

    const registerResponse = await registerHandler(User, req, res)
    expect(registerResponse.status).toHaveBeenCalledWith(400)
    expect(registerResponse.send).toHaveBeenCalledWith({
      success: false,
      message: '"email" must be a valid email',
    })
  })

  it('Should return 409 if user exists', async () => {
    User.findOne = jest.fn().mockResolvedValueOnce(new User({}))
    const req = {
      body: {
        email: 'fakee@mail.com',
        password: 'fakepwd',
      },
    } as Request

    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as any as Response

    const registerResponse = await registerHandler(User, req, res)
    expect(registerResponse.status).toHaveBeenCalledWith(409)
    expect(registerResponse.send).toHaveBeenCalledWith({
      success: false,
      message: 'User exists',
    })
  })

  it('Should return 500 if save user throws error', async () => {
    const errorMessage = 'Creation failed'
    jest.spyOn(User, 'create').mockRejectedValue(new Error(errorMessage))
    const req = {
      body: {
        email: 'fakee@mail.com',
        password: 'fakepwd',
      },
    } as Request

    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as any as Response

    const registerResponse = await registerHandler(User, req, res)
    expect(registerResponse.status).toHaveBeenCalledWith(500)
    expect(registerResponse.send).toHaveBeenCalledWith({
      success: false,
      message: errorMessage,
    })
  })
  it('Should return 500 if save user fails', async () => {
    jest.spyOn(User, 'create').mockResolvedValue(null as any)
    const req = {
      body: {
        email: 'fakee@mail.com',
        password: 'fakepwd',
      },
    } as Request

    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as any as Response

    const registerResponse = await registerHandler(User, req, res)
    expect(registerResponse.status).toHaveBeenCalledWith(500)
    expect(registerResponse.send).toHaveBeenCalledWith({
      success: false,
      message: 'User could not be created',
    })
  })
})
