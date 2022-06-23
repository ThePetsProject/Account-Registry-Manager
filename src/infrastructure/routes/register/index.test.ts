import supertest from 'supertest'
import app from '../../../app'
import * as registerModules from '.'
import { User, UserType } from '../../database/models/user'
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
    jest.spyOn(User, 'create').mockImplementation((): UserType => {
      return new User({})
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
    expect(registerResponse.status).toBeCalledWith(201)
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
    expect(registerResponse.status).toBeCalledWith(400)
    expect(registerResponse.send).toBeCalledWith({
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
    expect(registerResponse.status).toBeCalledWith(409)
    expect(registerResponse.send).toBeCalledWith({
      success: false,
      message: 'User exists',
    })
  })

  it('Should return 500 if save user fails', async () => {
    const createErrorResponse = null
    jest.spyOn(User, 'create').mockImplementation(() => createErrorResponse)
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
    expect(registerResponse.status).toBeCalledWith(500)
    expect(registerResponse.send).toBeCalledWith({
      success: false,
      message: createErrorResponse,
    })
  })
})
