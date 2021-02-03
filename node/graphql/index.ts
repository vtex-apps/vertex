/* eslint-disable no-console */
import { json } from 'co-body'

import { fromVertex, toVertex } from '../resources/vertex'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}

export const resolvers = {
  Routes: {
    orderTaxHandler: async (ctx: Context) => {
      console.log('orderTaxHandler')
      const {
        clients: { vertex, apps, dock },
      } = ctx
      const checkoutItems: any = await json(ctx.req)
      console.log('checkoutItems =>', checkoutItems)
      let response = JSON.stringify({
        itemTaxResponse: [],
        hooks: [],
      })
      const app: string = getAppId()
      const settings = await apps.getAppSettings(app)
      // eslint-disable-next-line @typescript-eslint/camelcase
      const { access_token }: any = await vertex.getToken(settings)

      console.log('Vertex access_token', access_token)
      const dockAddress: any = {}
      const dockPromise: any = []
      const lookupPromise: any = []
      let itemsWithAddress = []

      if (checkoutItems?.items?.length) {
        checkoutItems.items.map(async (item: any) => {
          if (!dockAddress[item.dockId]) {
            dockPromise.push(
              dock.get(item.dockId).then((ret: any) => {
                dockAddress[item.dockId] = ret.address
              })
            )
          }
        })
      }

      await Promise.all(dockPromise)

      checkoutItems.items.map(async (item: any) => {
        // eslint-disable-next-line vtex/prefer-early-return
        if (dockAddress[item.dockId] && !dockAddress[item.dockId].taxAreaId) {
          const {
            postalCode,
            city,
            state,
            street,
            complement,
            number,
            country: { acronym: countryName },
          } = dockAddress[item.dockId]
          const [asOfDate] = new Date().toISOString().split('T')
          lookupPromise.push(
            vertex
              .addressLookup(access_token, {
                postalAddress: {
                  streetAddress1: `${number} ${street}`,
                  streetAddress2: complement,
                  city,
                  mainDivision: state,
                  subDivision: city,
                  postalCode,
                  country: countryName,
                },
                asOfDate,
              })
              .then((result: any) => {
                const [data] = result.data.lookupResults
                dockAddress[item.dockId].taxAreaId = data.taxAreaId
              })
          )
        }
      })

      await Promise.all(lookupPromise).then(() => {
        itemsWithAddress = checkoutItems.items.map((item: any) => {
          return { ...item, address: dockAddress[item.dockId] }
        })
        checkoutItems.items = itemsWithAddress
      })

      if (checkoutItems?.shippingDestination?.postalCode) {
        const vertexJson = toVertex(checkoutItems, 'QUOTATION', settings)

        console.log('vertexJson =>', vertexJson)
        const quote = await vertex.submitTax(access_token, vertexJson)

        response = JSON.stringify(fromVertex(quote))
        console.log('fromVertex =>', response)
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
