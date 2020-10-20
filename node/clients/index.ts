import { IOClients } from '@vtex/api'

import RequestVertex from '../utils/Vertex'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get vertex() {
    return this.getOrSet('vertex', RequestVertex)
  }
}
