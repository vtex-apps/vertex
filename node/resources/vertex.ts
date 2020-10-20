import axios from 'axios'
import { path, prop, toString } from 'ramda'

const client = axios.create({
  timeout: 6000,
})

const checkoutUrl = (account: string) =>
  `http://${account}.vtexcommercestable.com.br/api/checkout/pvt/configuration/orderForm`

const taxCalculationUrlRegExp = (account: string) =>
  new RegExp(
    `https://(master--)?${account}.myvtex.com/vertex/checkout/order-tax/?`
  )

const taxCalculationUrl = (account: string) =>
  `https://master--${account}.myvtex.com/vertex/checkout/order-tax/`

const checkoutHeaders = (adminToken: string) => ({
  Accept: 'application/json',
  Authorization: `bearer ${adminToken}`,
  'Content-Type': 'application/json',
  'X-Vtex-Use-Https': 'true',
})

export async function getCheckoutConfiguration(
  account: string,
  adminToken: string
) {
  const headers = checkoutHeaders(adminToken)
  const configuration = await client
    .get(checkoutUrl(account), { headers })
    .then(prop('data'))

  return configuration
}

export async function checkConfiguration(account: string, adminToken: string) {
  const config = await getCheckoutConfiguration(account, adminToken)
  return taxCalculationUrlRegExp(account).test(
    toString(path(['taxConfiguration', 'url'], config))
  )
}

export async function activateCheckoutConfiguration(
  account: string,
  adminToken: string
) {
  const config = await getCheckoutConfiguration(account, adminToken)

  const headers = checkoutHeaders(adminToken)

  config.taxConfiguration = {
    allowExecutionAfterErrors: false,
    authorizationHeader: '',
    integratedAuthentication: false,
    url: taxCalculationUrl(account),
  }

  return client.post(checkoutUrl(account), config, { headers })
}

export async function deactivateCheckoutConfiguration(
  account: string,
  adminToken: string
) {
  const config = await getCheckoutConfiguration(account, adminToken)

  if (!(await checkConfiguration(account, adminToken))) return
  config.taxConfiguration.url = null
  const headers = checkoutHeaders(adminToken)

  return client.post(checkoutUrl(account), config, { headers })
}
