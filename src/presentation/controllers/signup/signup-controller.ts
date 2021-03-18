import { Controller, HttpRequest, HttpResponse, MissignParamError, badRequest } from './signup-protocols'

export class SignupController implements Controller {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const { email, name } = httpRequest.body
    if (!email) {
      return badRequest(new MissignParamError('email'))
    }

    if (!name) {
      return badRequest(new MissignParamError('name'))
    }
  }
}
