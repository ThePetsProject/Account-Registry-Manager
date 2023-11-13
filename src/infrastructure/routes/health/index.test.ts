import supertest from 'supertest'
import app from '../../../app'
import * as healthMethods from '.'
import projectProperties from '@utils/project_properties'
import { Response } from 'express'

const baseRoute = '/api/v1/account/register'
const { formatTime, healthHandler } = healthMethods

describe('Health route', () => {
  let request: supertest.SuperTest<supertest.Test>

  beforeAll(() => {
    request = supertest(app)
  })

  it('Should call route with /health path', (done) => {
    jest.spyOn(healthMethods, 'healthHandler')

    request
      .get(`${baseRoute}/health`)
      .expect(200)
      .then((response) => {
        const { body } = response
        expect(body).toMatchObject({
          status: 'UP',
          up_time: expect.any(String),
          info: {
            name: projectProperties.name,
            version: projectProperties.version,
          },
        })
        done()
        expect(healthMethods.healthHandler).toHaveBeenCalled()
      })
  })

  it('Should return health info', () => {
    const res = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as any as Response

    const expectedHealthResponse = {
      status: 'UP',
      up_time: expect.any(String),
      info: {
        name: projectProperties.name,
        version: projectProperties.version,
      },
    }

    const healthResponse = healthHandler(res)
    expect(healthResponse.status).toHaveBeenCalledWith(200)
    expect(healthResponse.send).toHaveBeenCalledWith(expectedHealthResponse)
  })
})

describe('Format time', (): void => {
  let timeFormat: string
  const timeLessOptions = [
    { value: 3600, expected: '01:00:00' },
    { value: 60, expected: '00:01:00' },
    { value: 1, expected: '00:00:01' },
  ]
  const timeGreaterOptions = [
    { value: 36000, expected: '10:00:00' },
    { value: 600, expected: '00:10:00' },
    { value: 10, expected: '00:00:10' },
  ]

  it('When time is less than 10 in hours, minutes and seconds', (): void => {
    for (let index = 0; index < timeLessOptions.length; index++) {
      const element = timeLessOptions[index]
      timeFormat = formatTime(element.value)
      expect(element.expected).toBe(timeFormat)
    }
  })

  it('When time greater than 10 in hours, minutes and seconds', (): void => {
    for (let index = 0; index < timeGreaterOptions.length; index++) {
      const element = timeGreaterOptions[index]
      timeFormat = formatTime(element.value)
      expect(element.expected).toBe(timeFormat)
    }
  })
})
