import { Telegraf, Context } from 'telegraf';
import { botService } from '../services/botService';

/**
 * Register all callback query handlers for inline keyboard navigation
 */
export function registerCallbackHandlers(bot: Telegraf<Context>) {
  // 1. Browse / Back to Colleges
  bot.action('nav:colleges', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const { text, keyboard } = await botService.getCollegesResponse();
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      await handleCallbackError(ctx, 'فشل تحميل الكليات');
    }
  });

  // 2. Select College -> Show Levels (col:<collegeId>)
  bot.action(/^col:(.+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const match = ctx.match[1];
      const collegeId = match.split(':')[0];

      const { text, keyboard } = await botService.getLevelsResponse(collegeId);
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      await handleCallbackError(ctx, 'فشل تحميل المستويات الدراسية');
    }
  });

  // 3. Select Level -> Show Courses (lvl:<levelId>:<collegeId>)
  bot.action(/^lvl:(.+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const parts = ctx.match[1].split(':');
      const levelId = parts[0];
      const collegeId = parts[1] || '';

      const { text, keyboard } = await botService.getCoursesResponse(levelId, collegeId);
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      await handleCallbackError(ctx, 'فشل تحميل المواد الدراسية');
    }
  });

  // 4. Select Course -> Show Lectures (crs:<courseId>:<levelId>)
  bot.action(/^crs:(.+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const parts = ctx.match[1].split(':');
      const courseId = parts[0];
      const levelId = parts[1] || '';

      const { text, keyboard } = await botService.getLecturesResponse(courseId, levelId);
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      await handleCallbackError(ctx, 'فشل تحميل المحاضرات');
    }
  });

  // 5. Select Lecture -> Show Files (lec:<lectureId>:<courseId>)
  bot.action(/^lec:(.+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const parts = ctx.match[1].split(':');
      const lectureId = parts[0];
      const courseId = parts[1] || '';

      const { text, keyboard } = await botService.getFilesResponse(lectureId, courseId);
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      await handleCallbackError(ctx, 'فشل تحميل ملحقات المحاضرة');
    }
  });

  // 6. Select File -> Send PDF/Video/Link (file:<fileId>:<lectureId>)
  bot.action(/^file:(.+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery('جاري تجهيز الملف...');
      const parts = ctx.match[1].split(':');
      const fileId = parts[0];
      const lectureId = parts[1] || '';

      const { file, caption, keyboard } = await botService.getFileDetail(fileId, lectureId);

      const fileUrl = file.downloadUrl || file.url;
      const fileType = file.type?.toUpperCase();

      if (fileType === 'PDF') {
        // Send document directly inside Telegram
        try {
          await ctx.replyWithDocument(
            { url: fileUrl, filename: file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf` },
            { caption, parse_mode: 'Markdown', ...keyboard }
          );
        } catch {
          // Fallback if URL cannot be fetched directly by Telegram bot server
          await ctx.reply(caption, { parse_mode: 'Markdown', ...keyboard });
        }
      } else if (fileType === 'VIDEO') {
        // Send video directly
        try {
          await ctx.replyWithVideo(
            { url: fileUrl },
            { caption, parse_mode: 'Markdown', ...keyboard }
          );
        } catch {
          await ctx.reply(caption, { parse_mode: 'Markdown', ...keyboard });
        }
      } else {
        // Other types (ZIP, DOCX, External links): send message with download button link
        await ctx.reply(caption, {
          parse_mode: 'Markdown',
          ...keyboard,
        });
      }
    } catch (error: any) {
      await handleCallbackError(ctx, error.message || 'فشل إرسال الملف');
    }
  });
}

/**
 * Helper to show graceful error popups / alerts
 */
async function handleCallbackError(ctx: Context, message: string) {
  try {
    await ctx.answerCbQuery(`⚠️ ${message}`, { show_alert: true });
  } catch {
    await ctx.reply(`⚠️ ${message}\n\nيرجى العودة إلى القائمة الرئيسية.`, {
      reply_markup: {
        inline_keyboard: [[{ text: '🏠 القائمة الرئيسية', callback_data: 'nav:colleges' }]],
      },
    });
  }
}
