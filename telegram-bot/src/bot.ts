import { Telegraf, Context } from 'telegraf';
import { handleStart } from './handlers/startHandler';
import { registerCallbackHandlers } from './handlers/callbackHandlers';

/**
 * Initialize and configure Telegraf Bot instance
 */
export function createBot(token?: string): Telegraf<Context> {
  const botToken = token || process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error(
      'TELEGRAM_BOT_TOKEN is missing from Environment Variables. Please set TELEGRAM_BOT_TOKEN before starting the bot engine.'
    );
  }

  const bot = new Telegraf(botToken);

  // Register /start and /help commands
  bot.start(handleStart);
  bot.help(handleStart);

  // Register inline keyboard navigation handlers
  registerCallbackHandlers(bot);

  // Catch-all error handler
  bot.catch((err: any, ctx: Context) => {
    console.error(`Telegram Bot encountered error for ${ctx.updateType}:`, err);
  });

  return bot;
}

/**
 * Helper to launch bot safely in long polling mode
 */
export async function launchBot(bot: Telegraf<Context>) {
  console.log('🤖 Starting Telegram Bot Engine...');
  await bot.launch();
  console.log('✅ Telegram Bot is online and listening for messages!');

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
