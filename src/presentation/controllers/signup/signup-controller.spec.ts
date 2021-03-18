import { Controller, HttpRequest } from './signup-protocols'
import { SignupController } from './signup-controller'
import { HttpResponse } from '../../protocols/http'

describe('Signup Controller', () => {
  interface SutTypes {
    sut: Controller
  }

  const makeSut = (): SutTypes => {
    const sut = new SignupController()
    return {
      sut
    }
  }

  test('should return 400 if email is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse: HttpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })
})
