import { Controller, HttpRequest, HttpResponse } from './signup-protocols'

export class SignupController implements Controller {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const { email } = httpRequest.body
    if (!email) {
      return {
        statusCode: 400,
        body: 'No email is provided'
      }
    }
  }
}
