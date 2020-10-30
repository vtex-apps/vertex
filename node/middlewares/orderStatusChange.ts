/* eslint-disable no-console */
import { Apps } from '@vtex/api'

import { getCheckoutConfiguration } from '../resources/checkout'
import { toVertex } from '../resources/vertex'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}

export async function orderStatusChange(
  ctx: StatusChangeContext,
  next: () => Promise<any>
) {
  const {
    body,
    vtex,
    clients: { vertex, oms },
  } = ctx

  const config = await getCheckoutConfiguration(vtex.account, vtex.authToken)

  const apps = new Apps(ctx.vtex)
  const app: string = getAppId()
  const settings = await apps.getAppSettings(app)

  if (
    !!config?.taxConfiguration?.url &&
    config.taxConfiguration.url.indexOf('vertex') !== -1 &&
    body.currentState === 'invoiced'
  ) {
    const order = await oms.order(body.orderId)

    if (order) {
      const vertexObj = toVertex(order, 'INVOICE', settings)
      console.log('VERTEX =>', JSON.stringify(vertexObj))

      // eslint-disable-next-line @typescript-eslint/camelcase
      const token: any = await vertex.getToken(settings)

      console.log('Settings =>', settings)

      console.log('Token =>', token)

      console.log('Submit tax')
      await vertex
        .submitTax(token.access_token, vertexObj)
        .then((res: any) => {
          console.log('Vertex response =>', res)
        })
        .catch((err: any) => {
          console.log('Vertex response ERROR =>', err.response.data)
        })
    }
  }

  await next()
}
