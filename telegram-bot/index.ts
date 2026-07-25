import { createBot, launchBot } from './src/bot';

/**
 * Main launcher script for the Telegram Bot standalone engine.
 */
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token.trim() === '') {
    console.log('------------------------------------------------------------');
    console.log('ℹ️ TELEGRAM BOT ENGINE INITIALIZED');
    console.log('------------------------------------------------------------');
    console.log('The Telegram Bot structure and API integration are fully prepared!');
    console.log('To start polling and running the bot:');
    console.log('1. Obtain a Bot Token from @BotFather on Telegram.');
    console.log('2. Set TELEGRAM_BOT_TOKEN="your_bot_token_here" in your .env or environment variables.');
    console.log('3. Run the bot script via: tsx telegram-bot/index.ts');
    console.log('------------------------------------------------------------');
    return;
  }

  try {
    const bot = createBot(token);
    await launchBot(bot);
  } catch (error: any) {
    console.error('❌ Failed to start Telegram Bot:', error.message || error);
  }
}

main();
