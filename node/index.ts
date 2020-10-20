import {
  ClientsConfig,
  Service,
  ServiceContext,
  ParamsContext,
  RecorderState,
  AuthType,
  LRUCache,
} from '@vtex/api'

import { Clients } from './clients'
import { resolvers } from './graphql'

const TIMEOUT_MS = 2000

const defaultClientOptions = {
  retries: 1,
  timeout: TIMEOUT_MS,
}

const memoryCache = new LRUCache<string, any>({ max: 1000 })

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: defaultClientOptions,
    vertex: {
      authType: AuthType.bearer,
      memoryCache,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients>

  interface State {
    code: number
  }
}

export default new Service<Clients, RecorderState, ParamsContext>({
  clients,
  graphql: {
    resolvers: {
      Query: resolvers.Query,
      Mutation: resolvers.Mutation,
    },
  },
  routes: resolvers.Routes,
})
