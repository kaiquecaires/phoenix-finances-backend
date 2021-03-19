import { EmailValidator } from '../../protocols/email-validator'
import { Controller, HttpRequest, HttpResponse, MissignParamError, badRequest, InvalidParamError, serverError } from './signup-protocols'

export class SignupController implements Controller {
  constructor (private readonly emailValidator: EmailValidator) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { password, passwordConfirmation, email } = httpRequest.body
      const fields = httpRequest.body
      const requiredFields = ['email', 'name', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!fields[field]) {
          return badRequest(new MissignParamError(field))
        }
      }
      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      if (!this.emailValidator.validate(email)) {
        return badRequest(new InvalidParamError('email'))
      }
    } catch (error) {
      return serverError(error)
    }
  }
}
