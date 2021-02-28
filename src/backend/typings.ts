import { LineClient } from './client'

export interface MountedBot {
  botId: string
  client: LineClient
}
