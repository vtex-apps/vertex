import { IOClients } from '@vtex/api'

import RequestVertex from '../utils/Vertex'
import { OMSClient } from '../utils/Oms'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get vertex() {
    return this.getOrSet('vertex', RequestVertex)
  }

  public get oms() {
    return this.getOrSet('oms', OMSClient)
  }
}
