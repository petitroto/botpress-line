export interface Config {
  /**
   * Enable or disable this channel for this bot
   * @default false
   */
  enabled: boolean
  /**
   * channelAccessToken https://developers.line.biz/en/docs/messaging-api/channel-access-tokens/
   * @default "your channel access token here"
   */
  channelAccessToken: string
  /**
   * channelSecret
   * @default "your channel secret here"
   */
  channelSecret: string
}
