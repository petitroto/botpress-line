import * as sdk from 'botpress/sdk'
import _ from 'lodash'

import { MountedBot } from './typings'

export async function setupRouter(bp: typeof sdk, mountedBots: MountedBot[], route: string): Promise<sdk.http.RouterExtension> {
  const router = bp.http.createRouterForBot('channel-line', {
    checkAuthentication: false
  })

  router.post(route, async (req, res) => {

    const botId = req.params.botId

    const bot: MountedBot = _.find(mountedBots, { botId })
    if (!bot) {
      return res.status(404).send('botId invalid')
    }

    const client = bot.client
    if (client.auth(req)) {
      await client.handleWebhookRequest(req.body, bot)
      res.sendStatus(204)
    } else {
      res.status(401).send('channelSecret invalid')
    }
  })

  return router
}
