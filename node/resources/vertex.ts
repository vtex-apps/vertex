interface Item {
  id: string
  itemPrice: number
  listPrice: number
  quantity: number
  discountPrice: number
  address: Address
}

interface Address {
  taxAreaId: number
}
interface Settings {
  companyCode: string
}
export function toVertex(
  orderForm: any,
  saleMessageType: string,
  settings: Settings
) {
  const seller = {
    company: settings.companyCode,
  }
  const [date] = new Date().toISOString().split('T')
  const destination: any = {
    postalCode: orderForm?.shippingDestination?.postalCode ?? '',
    streetAddress1: orderForm?.shippingDestination?.street,
    city: orderForm?.shippingDestination?.city,
    mainDivision: orderForm?.shippingDestination?.state,
    country: orderForm?.shippingDestination?.country,
  }

  const transactionId = orderForm?.orderId ?? ''
  const [paymentDate] = orderForm?.invoicedDate?.split('T') ?? ''

  const lineItems = orderForm?.items.map((item: Item, index: number) => {
    const ret: any = {
      customer: {
        destination,
      },
      quantity: {
        value: item.quantity,
      },
      unitPrice:
        saleMessageType !== 'INVOICE'
          ? ((item.itemPrice + item.discountPrice) / item.quantity).toFixed(2)
          : parseInt((item.listPrice / 100).toFixed(2), 10),
      lineItemNumber:
        saleMessageType !== 'INVOICE' ? parseInt(item.id, 10) + 1 : index + 1,
    }

    if (item?.address?.taxAreaId) {
      ret.seller = {
        physicalOrigin: {
          taxAreaId: item.address.taxAreaId,
        },
      }
    }

    return ret
  })

  lineItems.push({
    customer: {
      destination,
    },
    product: {
      productClass: 'SHIPPINGCLASS',
      value: 'SHIPPING',
    },
    quantity: {
      value: 1,
    },
    unitPrice:
      orderForm.totals.find((item: any) => {
        return item.id === 'Shipping'
      }).value / 100,
    lineItemNumber: parseInt(lineItems.length, 10) + 1,
  })

  return {
    seller,
    saleMessageType,
    lineItems,
    documentDate: date,
    transactionType: 'SALE',
    transactionId,
    paymentDate,
  }
}

export function fromVertex(vertexObj: any) {
  const shippingItems = vertexObj.data.lineItems.filter((item: any) => {
    return String(item.product?.value).toUpperCase() === 'SHIPPING'
  })

  const totalShippingTax = shippingItems.length ? shippingItems[0].totalTax : 0

  const itemTaxResponse = vertexObj.data.lineItems
    .filter((item: any) => {
      return String(item.product?.value).toUpperCase() !== 'SHIPPING'
    })
    .map((item: any) => {
      return {
        id: String(item.lineItemNumber - 1),
        taxes: item.taxes.map((tax: any) => {
          return {
            name: tax.jurisdiction.jurisdictionLevel,
            description: tax.impositionType?.value,
            value: tax.calculatedTax,
          }
        }),
      }
    })

  if (totalShippingTax) {
    itemTaxResponse.forEach((_: any, index: number) => {
      itemTaxResponse[index].taxes.push({
        name: 'SHIPPING',
        description: '',
        value: (totalShippingTax / itemTaxResponse.length).toFixed(2),
      })
    })
  }

  return {
    itemTaxResponse,
    hooks: [],
  }
}
