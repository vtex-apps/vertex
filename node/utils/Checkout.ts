import { path, toString } from 'ramda'
import { ExternalClient, IOContext } from '@vtex/api'

const taxCalculationUrlRegExp = (account: string) =>
  new RegExp(
    `http://(master--)?${account}.myvtex.com/vertex/checkout/order-tax/?`
  )

const taxCalculationUrl = (account: string) =>
  `http://master--${account}.myvtex.com/vertex/checkout/order-tax/`

export default class Checkout extends ExternalClient {
  constructor(context: IOContext) {
    super(
      `http://${context.account}.vtexcommercestable.com.br/api/checkout/pvt/configuration/orderForm`,
      context,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          VtexIdclientAutCookie: context.authToken,
        },
      }
    )
  }

  public async getCheckoutConfiguration() {
    const configuration = await this.http.get('')

    return configuration
  }

  public async checkConfiguration() {
    const config = await this.getCheckoutConfiguration()
    return taxCalculationUrlRegExp(this.context.account).test(
      toString(path(['taxConfiguration', 'url'], config))
    )
  }

  public async activateCheckoutConfiguration() {
    const config = await this.getCheckoutConfiguration()

    config.taxConfiguration = {
      allowExecutionAfterErrors: false,
      authorizationHeader: '',
      integratedAuthentication: false,
      url: taxCalculationUrl(this.context.account),
    }

    return this.http.post('', config)
  }

  public async deactivateCheckoutConfiguration() {
    const config = await this.getCheckoutConfiguration()

    if (!(await this.checkConfiguration())) return
    config.taxConfiguration.url = null

    return this.http.post('', config)
  }
}
