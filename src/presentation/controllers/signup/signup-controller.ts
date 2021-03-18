import { InvalidParamError } from '../../errors/invalid-param-error'
import { Controller, HttpRequest, HttpResponse, MissignParamError, badRequest } from './signup-protocols'

export class SignupController implements Controller {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const { password, passwordConfirmation } = httpRequest.body
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
  }
}
