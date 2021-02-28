# Channel-Line

### Prerequisite

- An HTTPS Endpoint to your bot
  - Set the externalUrl field in botpress.config.json
  - Create an HTTPS tunnel to your machine using Ngrok.
  - Using Nginx and Let's Encrypt.

- Create a LINE account and [create a channel with Messaging API](https://developers.line.biz/)

### Steps

#### Get your API credentials

1. Go to LINE Developers console of your channel
2. Go to the Basic settings tab
3. Scroll down and copy your Channel secret
4. Go to the Messaging API tab
5. Scroll down and issue your Channel access token

#### Configure your bot

1. Edit data/bots/YOUR_BOT_ID/config/channel-line.json (or create it) and set
- enabled: Set to true
- channelAccessToken: Paste your Channel access token
- channelSecret: Paste your Channel secret
2. Restart Botpress
3. You should see your webhook endpoint in the console on startup

#### Configure webhook

1. Go to LINE Developers console of your channel
2. Go to the Messaging API tab
3. Scroll down to the webhook settings section
4. Click Edit button and set it to `EXTERNAL_URL/api/v1/bots/YOUR_BOT_ID/mod/channel-line/webhook`
