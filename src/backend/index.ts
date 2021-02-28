import * as sdk from 'botpress/sdk'
import _ from 'lodash'
import { Config } from 'src/config'

import { setupRouter } from './api'
import { MIDDLEWARE_NAME, setupMiddleware, LineClient } from './client'
import { MountedBot } from './typings'

let router: sdk.http.RouterExtension
const route = '/webhook'
const state: { mountedBots: MountedBot[] } = { mountedBots: [] }

const onServerStarted = async (bp: typeof sdk) => {
  await setupMiddleware(bp, state.mountedBots)
}

const onServerReady = async (bp: typeof sdk) => {
  router = await setupRouter(bp, state.mountedBots, route)
}

const onBotMount = async (bp: typeof sdk, botId: string) => {
  const config = (await bp.config.getModuleConfigForBot('channel-line', botId, true)) as Config

  if (config.enabled) {
    const client = new LineClient(bp, botId, config, router, route)
    await client.initialize()

    state.mountedBots.push({ botId, client })
  }
}

const onBotUnmount = async (bp: typeof sdk, botId: string) => {
  state.mountedBots = _.remove(state.mountedBots, { botId })
}

const onModuleUnmount = async (bp: typeof sdk) => {
  bp.events.removeMiddleware(MIDDLEWARE_NAME)
}

const entryPoint: sdk.ModuleEntryPoint = {
  onServerStarted,
  onServerReady,
  onBotMount,
  onBotUnmount,
  onModuleUnmount,
  definition: {
    name: 'channel-line',
    menuIcon: 'none',
    fullName: 'LINE',
    homepage: 'https://chatbot.today',
    noInterface: true,
    plugins: [],
    experimental: true
  }
}

export default entryPoint
