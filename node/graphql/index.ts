/* eslint-disable no-console */
import { Apps } from '@vtex/api'

import {
  getCheckoutConfiguration,
  activateCheckoutConfiguration,
  deactivateCheckoutConfiguration,
  checkConfiguration,
} from '../resources/checkout'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}

export const resolvers = {
  Routes: {
    orderTaxHandler: async (ctx: any) => {
      const {
        clients: { vertex },
      } = ctx
      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()
      const settings = await apps.getAppSettings(app)

      // eslint-disable-next-line @typescript-eslint/camelcase
      const { access_token } = await vertex.getToken(settings)

      const dummyData = {
        saleMessageType: 'QUOTATION',
        seller: {
          company: 'COMPANY',
        },
        lineItems: [
          {
            seller: {
              physicalOrigin: {
                taxAreaId: 391013000,
              },
            },
            customer: {
              customerCode: {
                classCode: 'custclass',
                value: 'cust',
              },
              destination: {
                streetAddress1: '2301 Renaissance Blvd',
                streetAddress2: 'Suite 100',
                city: 'King of Prussia',
                mainDivision: 'PA',
                postalCode: '19406',
                country: 'UNITED STATES',
              },
            },
            product: {
              productClass: 'PRODCLASS',
              value: 'PRODCODE',
            },
            quantity: {
              value: 10,
            },
            unitPrice: 10,
            flexibleFields: {
              flexibleCodeFields: [
                {
                  fieldId: 1,
                  value: 'FLEXCodeField1',
                },
              ],
              flexibleNumericFields: [
                {
                  fieldId: 1,
                  value: 111,
                },
              ],
              flexibleDateFields: [
                {
                  fieldId: 1,
                  value: '2020-04-18',
                },
              ],
            },
            lineItemNumber: 1,
            deliveryTerm: 'FOB',
          },
          {
            seller: {
              physicalOrigin: {
                taxAreaId: 391013000,
              },
            },
            customer: {
              customerCode: {
                classCode: 'custclass',
                value: 'cust',
              },
              destination: {
                streetAddress1: '2301 Renaissance Blvd',
                streetAddress2: 'Suite 100',
                city: 'King of Prussia',
                mainDivision: 'PA',
                postalCode: '19406',
                country: 'UNITED STATES',
              },
            },
            product: {
              productClass: 'SHIPPINGCLASS',
              value: 'SHIPPING',
            },
            quantity: {
              value: 1,
            },
            extendedPrice: 20,
            lineItemNumber: 2,
          },
        ],
        documentNumber: 'billtest',
        documentDate: '2020-04-18',
        transactionType: 'SALE',
      }

      const quote = await vertex.simulateTax(access_token, dummyData)

      console.log('Token =>', access_token)

      ctx.set('Content-Type', 'application/vnd.vtex.checkout.minicart.v1+json')

      console.log('orderTaxHandler =>', ctx)

      // ctx.response.body = JSON.stringify({
      //   itemTaxResponse: [],
      //   hooks: [],
      // })
      ctx.response.body = JSON.stringify(quote)

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
    deactivate: async (_: any, __: any, ctx: any) => {
      deactivateCheckoutConfiguration(ctx.vtex.account, ctx.vtex.authToken)
      return true
    },
  },
  Query: {
    checkConfiguration: async (_: any, __: any, ctx: any) => {
      return checkConfiguration(ctx.vtex.account, ctx.vtex.authToken)
    },
    getAppSettings: async (_: any, __: any, ctx: any) => {
      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()
      const settings = await apps.getAppSettings(app)

      return settings
    },
  },
}
