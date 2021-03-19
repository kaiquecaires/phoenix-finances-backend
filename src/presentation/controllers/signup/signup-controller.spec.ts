import { Controller, HttpRequest, HttpResponse, badRequest, MissignParamError, InvalidParamError, EmailValidator } from './signup-protocols'
import { SignupController } from './signup-controller'

describe('Signup Controller', () => {
  const makeEmailValidatorStub = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
      validate (email: string): boolean {
        return true
      }
    }

    return new EmailValidatorStub()
  }

  interface SutTypes {
    sut: Controller
    emailValidatorStub: EmailValidator
  }

  const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidatorStub()
    const sut = new SignupController(emailValidatorStub)
    return {
      sut,
      emailValidatorStub
    }
  }

  test('should return 400 if name is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest: HttpRequest = {
      body: {
        email: 'any_mail@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse: HttpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissignParamError('name')))
  })

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
    expect(httpResponse).toEqual(badRequest(new MissignParamError('email')))
  })

  test('should return 400 if password is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'any_mail@mail.com',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse: HttpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissignParamError('password')))
  })

  test('should return 400 if passwordConfirmation is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'any_mail@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse: HttpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissignParamError('passwordConfirmation')))
  })

  test('should return 400 if passwordConfirmation is not equal to password', async () => {
    const { sut } = makeSut()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'any_mail@mail.com',
        password: 'any_password',
        passwordConfirmation: 'different_password'
      }
    }
    const httpResponse: HttpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('passwordConfirmation')))
  })

  test('should return 400 if invalid email is provided', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'validate').mockReturnValueOnce(false)
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_mail@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse: HttpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')))
  })

  test('should return 500 if emailValidator throws', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'validate').mockImplementationOnce(() => { throw new Error() })
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'any_mail@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse: HttpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
