import { Context } from 'telegraf';
import { botService } from '../services/botService';

/**
 * Handle /start command
 */
export async function handleStart(ctx: Context) {
  try {
    const { text, keyboard } = await botService.getStartResponse();
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      ...keyboard,
    });
  } catch (error: any) {
    console.error('Error in /start handler:', error);
    await ctx.reply('⚠️ عذراً، حدث خطأ أثناء الاتصال بالنظام. يرجى إعادة المحاولة لاحقاً.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 إعادة المحاولة', callback_data: 'nav:colleges' }],
        ],
      },
    });
  }
}
