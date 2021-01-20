import { IOClients } from '@vtex/api'

import RequestVertex from '../utils/Vertex'
import Checkout from '../utils/Checkout'
import { OMSClient } from '../utils/Oms'
import { LogicticsClient } from '../utils/Logistics'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get vertex() {
    return this.getOrSet('vertex', RequestVertex)
  }

  public get oms() {
    return this.getOrSet('oms', OMSClient)
  }

  public get dock() {
    return this.getOrSet('dock', LogicticsClient)
  }

  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }
}
