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
    clients: { vertex, oms, checkout, apps },
  } = ctx

  const config = await checkout.getCheckoutConfiguration()

  const app: string = getAppId()
  const settings = await apps.getAppSettings(app)

  if (
    !!config?.taxConfiguration?.url &&
    config.taxConfiguration.url.indexOf('vertex') !== -1 &&
    body.currentState === 'invoiced' &&
    settings.submit
  ) {
    const order = await oms.order(body.orderId)

    if (order) {
      const vertexObj = toVertex(order, 'INVOICE', settings)

      // eslint-disable-next-line @typescript-eslint/camelcase
      const token: any = await vertex.getToken(settings)

      await vertex.submitTax(token.access_token, vertexObj)
    }
  }

  await next()
}
