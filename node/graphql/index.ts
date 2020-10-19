/* eslint-disable no-console */
import { Apps, ServiceContext } from '@vtex/api'

import {
  getCheckoutConfiguration,
  activateCheckoutConfiguration,
} from '../resources/checkout'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}

export const resolvers = {
  Routes: {
    orderTaxHandler: async (ctx: ServiceContext) => {
      ctx.set('Content-Type', 'application/vnd.vtex.checkout.minicart.v1+json')

      console.log('orderTaxHandler =>', ctx)

      ctx.response.body = JSON.stringify({
        itemTaxResponse: [],
        hooks: [],
      })
      ctx.response.status = 200
    },
  },
  Mutation: {
    saveAppSettings: async (_: any, params: any, ctx: any) => {
      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()
      const { clientId, clientToken, apiKey, apiPassword, force } = params
      const newSettings = { clientId, clientToken, apiKey, apiPassword }
      let ret = { status: 'success', message: '' }

      const config = await getCheckoutConfiguration(
        ctx.vtex.account,
        ctx.vtex.authToken
      )

      // If not forced and has a conflicted configuration
      if (!force && config?.taxConfiguration?.url.indexOf('vertex') === -1) {
        ret = {
          status: 'conflict',
          message: 'admin/vextex.alert.conflict',
        }
      } else {
        // If it's foced or there's no previous tax configuration
        if (force || !config?.taxConfiguration?.url) {
          activateCheckoutConfiguration(ctx.vtex.account, ctx.vtex.authToken)
        }
        await apps.saveAppSettings(app, newSettings)
      }
      return ret
    },
  },
  Query: {
    getAppSettings: async (_: any, __: any, ctx: any) => {
      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()
      const settings = await apps.getAppSettings(app)

      return settings
    },
  },
}
