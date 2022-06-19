import supertest from 'supertest'
import app from '../../../app'
import * as loginModules from '.'
import { User } from '../../database/models/user'
import { Request, Response } from 'express'

const baseRoute = '/api/v1/account/login'
const { loginHandler } = loginModules

describe('Login route', () => {
  let request: supertest.SuperTest<supertest.Test>

  beforeAll(() => {
    request = supertest(app)
  })

  beforeEach(() => {
    User.findOne = jest.fn().mockResolvedValueOnce({
      checkPassword: jest.fn().mockResolvedValueOnce(true),
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Should call method when root path', (done) => {
    jest.spyOn(loginModules, 'loginHandler')
    request
      .post(`${baseRoute}/`)
      .send({
        email: 'fake@email.com',
        password: 'fakepwd',
      })
      .expect(200)
      .then(() => {
        expect(loginModules.loginHandler).toHaveBeenCalled()
        done()
      })
  })

  it('Should respond 200 when password match', async () => {
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

    const loginResponse = await loginHandler(User, req, res)
    expect(loginResponse.status).toBeCalledWith(200)
    expect(loginResponse.send).toBeCalledWith()
  })

  it('Should respond 400 when no user found', async () => {
    User.findOne = jest.fn().mockResolvedValueOnce(undefined)

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

    const loginResponse = await loginHandler(User, req, res)
    expect(loginResponse.status).toBeCalledWith(400)
    expect(loginResponse.send).toBeCalledWith()
  })

  it('Should respond 400 when passwords wont match', async () => {
    User.findOne = jest.fn().mockResolvedValueOnce({
      checkPassword: jest.fn().mockResolvedValueOnce(false),
    })

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

    const loginResponse = await loginHandler(User, req, res)
    expect(loginResponse.status).toBeCalledWith(400)
    expect(loginResponse.send).toBeCalledWith()
  })
})