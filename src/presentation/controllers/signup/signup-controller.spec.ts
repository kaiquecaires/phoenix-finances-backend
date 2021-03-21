import { Controller, HttpRequest, HttpResponse, badRequest, MissignParamError, InvalidParamError, EmailValidator } from './signup-protocols'
import { SignupController } from './signup-controller'
import { AccountModel } from '../../../domain/models/account'
import { AddAccount, AddAccountModel } from '../../../domain/useCases/add-account'

describe('Signup Controller', () => {
  const makeEmailValidatorStub = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
      validate (email: string): boolean {
        return true
      }
    }

    return new EmailValidatorStub()
  }

  const makeFakeHttpRequest = (): HttpRequest => ({
    body: {
      email: 'valid_email@mail.com',
      name: 'valid_name',
      password: 'valid_password',
      passwordConfirmation: 'valid_password'
    }
  })

  const makeAddAccountStub = (): AddAccount => {
    class AddAccountStub implements AddAccount {
      async add (account: AddAccountModel): Promise<AccountModel> {
        return makeFakeAccount()
      }
    }

    return new AddAccountStub()
  }

  const makeFakeAccount = (): AccountModel => ({
    email: 'valid_email@mail.com',
    password: 'valid_password@password.com',
    id: 'valid_id',
    name: 'valid_name'
  })

  interface SutTypes {
    sut: Controller
    emailValidatorStub: EmailValidator
    addAccountStub: AddAccount
  }

  const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidatorStub()
    const addAccountStub = makeAddAccountStub()
    const sut = new SignupController(emailValidatorStub, addAccountStub)
    return {
      sut,
      emailValidatorStub,
      addAccountStub
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

  test('should call emailValidator with correct email', async () => {
    const { sut, emailValidatorStub } = makeSut()
    const emailSpy = jest.spyOn(emailValidatorStub, 'validate')
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'any_mail@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    await sut.handle(httpRequest)
    expect(emailSpy).toHaveBeenCalledWith(httpRequest.body.email)
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

  test('should return an Account if correct values is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeHttpRequest())
    expect(httpResponse.body.id).toBeTruthy()
  })

  test('should call addAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSut()
    const addSpy = jest.spyOn(addAccountStub, 'add')
    await sut.handle(makeFakeHttpRequest())
    expect(addSpy).toHaveBeenLastCalledWith({
      email: 'valid_email@mail.com',
      name: 'valid_name',
      password: 'valid_password',
      passwordConfirmation: 'valid_password'
    })
  })
})
