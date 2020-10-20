/* eslint-disable no-console */
import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'
import { stringify } from 'qs'

export default class RequestVertex extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(``, context, options)
  }

  public authToken() {
    return this.context.authToken
  }

  public account() {
    return this.context.account
  }

  public currentWorkspace() {
    return this.context.workspace
  }

  public simulateTax(token: any, data: any) {
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

  public getToken() {
    const credentials = {
      client_id: 'VTEX-REST-API-PROD',
      client_secret: '05ebd2da4390e5783caf85d20fef4f2e',
      username: 'c3376bd13e1445b7a832f7587193b35e',
      password: 'Zp4}7E&t',
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
