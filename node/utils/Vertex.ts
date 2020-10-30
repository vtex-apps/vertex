/* eslint-disable no-console */
import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'
import { stringify } from 'qs'

export default class RequestVertex extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(``, context, options)
  }

  public submitTax(token: any, data: any) {
    console.log('submitTax => ', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    return this.http.post(
      `https://restconnect.vertexsmb.com/vertex-restapi/v1/sale`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
  }

  public getToken(settings: any) {
    const credentials = {
      client_id: settings.clientId,
      client_secret: settings.clientToken,
      username: settings.apiKey,
      password: settings.apiPassword,
      scope: 'calc-rest-api',
      grant_type: 'password',
    }

    return this.http.post(
      `https://auth.vertexsmb.com/identity/connect/token`,
      stringify(credentials),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
  }
}
