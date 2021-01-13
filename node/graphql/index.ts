import { json } from 'co-body'

import { fromVertex, toVertex } from '../resources/vertex'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}

export const resolvers = {
  Routes: {
    orderTaxHandler: async (ctx: Context) => {
      const {
        clients: { vertex, apps },
      } = ctx
      const checkoutItens = await json(ctx.req)
      let response = JSON.stringify({
        itemTaxResponse: [],
        hooks: [],
      })

      if (checkoutItens?.shippingDestination?.postalCode) {
        const app: string = getAppId()
        const settings = await apps.getAppSettings(app)

        // eslint-disable-next-line @typescript-eslint/camelcase
        const { access_token }: any = await vertex.getToken(settings)

        const vertexJson = toVertex(checkoutItens, 'QUOTATION', settings)

        const quote = await vertex.submitTax(access_token, vertexJson)

        response = JSON.stringify(fromVertex(quote))
      }

      ctx.set('Content-Type', 'application/vnd.vtex.checkout.minicart.v1+json')

      ctx.response.body = response

      ctx.response.status = 200
    },
  },
  Mutation: {
    saveAppSettings: async (_: any, params: any, ctx: Context) => {
      const {
        clients: { checkout, apps },
      } = ctx
      const app: string = getAppId()
      const {
        clientId,
        companyCode,
        clientToken,
        apiKey,
        apiPassword,
        force,
        submit,
      } = params

      const newSettings = {
        clientId,
        companyCode,
        clientToken,
        apiKey,
        apiPassword,
        submit,
      }
      let ret = { status: 'success', message: '' }

      const config = await checkout.getCheckoutConfiguration()

      // If not forced and has a conflicted configuration
      if (
        !force &&
        !!config?.taxConfiguration?.url &&
        config?.taxConfiguration?.url.indexOf('vertex') === -1
      ) {
        ret = {
          status: 'conflict',
          message: 'admin/vextex.alert.conflict',
        }
      } else {
        // If it's foced or there's no previous tax configuration
        // eslint-disable-next-line no-lonely-if
        if (force || !config?.taxConfiguration?.url) {
          checkout.activateCheckoutConfiguration()
        }
      }
      await apps.saveAppSettings(app, newSettings)
      return ret
    },
    deactivate: async (_: any, __: any, ctx: Context) => {
      const {
        clients: { checkout },
      } = ctx
      checkout.deactivateCheckoutConfiguration()
      return true
    },
  },
  Query: {
    checkConfiguration: async (_: any, __: any, ctx: Context) => {
      const {
        clients: { checkout },
      } = ctx
      return checkout.checkConfiguration()
    },
    getAppSettings: async (_: any, __: any, ctx: Context) => {
      const {
        clients: { apps },
      } = ctx
      const app: string = getAppId()
      const settings = await apps.getAppSettings(app)
      return settings
    },
  },
}
