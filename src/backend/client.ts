import * as line from '@line/bot-sdk'
import * as sdk from 'botpress/sdk'
import _ from 'lodash'

import { Config } from '../config'

import { MountedBot } from './typings'

const debug = DEBUG('channel-line')
const debugIncoming = debug.sub('incoming')
const debugOutgoing = debug.sub('outgoing')

export const MIDDLEWARE_NAME = 'line.sendMessage'

export class LineClient {
  private logger: sdk.Logger
  private lineClient: line.Client
  private webhookUrl: string
  private kvs: sdk.KvsService

  constructor(
    private bp: typeof sdk,
    private botId: string,
    private config: Config,
    private router: sdk.http.RouterExtension,
    private route: string
  ) {
    this.logger = bp.logger.forBot(botId)
  }

  async initialize() {
    if (!this.config.channelAccessToken || !this.config.channelSecret) {
      return this.logger.error(`[${this.botId}] channelAccessToken, channelSecret must be configured to use this channel.`)
    }

    const url = (await this.router.getPublicPath()) + this.route
    this.webhookUrl = url.replace('BOT_ID', this.botId)

    this.lineClient = new line.Client(this.config)
    this.kvs = this.bp.kvs.forBot(this.botId)

    this.logger.info(`Line webhook listening at ${this.webhookUrl}`)
  }

  auth(req): boolean {
    const signature = req.headers['x-line-signature']
    return line.validateSignature(JSON.stringify(req.body), this.config.channelSecret, signature)
  }

  getKvsKey(target: string, threadId: string) {
    return `${target}_${threadId}`
  }

  async handleWebhookRequest(body: any, bot: MountedBot) {
    debugIncoming('Received message', body)

    for (const event of body.events) {
      if (event.type === 'message') {
        const message: line.EventMessage = event.message
        if (message.type === 'text') {
          await this.sendIncomingEvent(bot.botId, 'text', message, event.source.userId)
        } else {
          // TODO: implement handlers for other types of message
        }
      } else {
        // TODO: implement handlers for other types of event
      }
    }
  }

  async sendIncomingEvent(botId, type, payload, target) {
    await this.bp.events.sendEvent(
      this.bp.IO.Event({
        botId,
        channel: 'line',
        direction: 'incoming',
        type,
        payload,
        target
      })
    )
  }

  async handleOutgoingEvent(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback) {
    const payload = event.payload

    if (payload.type === 'text') {
      await this.sendMessage(event, {
        type: 'text',
        text: payload.text
      })
    }
    next(undefined, false)
  }

  async sendMessage(event: sdk.IO.Event, args: any) {

    const message: any = {
      ...args
    }

    debugOutgoing('Sending message', message)

    return this.lineClient.pushMessage(event.target, message)
  }
}

export async function setupMiddleware(bp: typeof sdk, mountedBots: MountedBot[]) {
  bp.events.registerMiddleware({
    description:
      'Sends out messages that targets platform = LINE.' +
      ' This middleware should be placed at the end as it swallows events once sent.',
    direction: 'outgoing',
    handler: outgoingHandler,
    name: MIDDLEWARE_NAME,
    order: 100
  })

  async function outgoingHandler(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback) {
    if (event.channel !== 'line') {
      return next()
    }

    const bot = _.find(mountedBots, { botId: event.botId })
    if (!bot) {
      return next()
    }

    const client: LineClient = bot.client
    return client.handleOutgoingEvent(event, next)
  }
}
