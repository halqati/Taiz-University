import React, { useState, useEffect } from 'react';
import { Bot, Save, CheckCircle, RefreshCw, MessageSquare, ShieldAlert, PhoneCall, Radio } from 'lucide-react';
import { api } from '../services/api';
import { TelegramSettings } from '../types';

export const TelegramSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<TelegramSettings>({
    botUsername: '@UniLibraryBot',
    welcomeMessage: 'مرحباً بك في بوت المكتبة الجامعية الرقمية. اختر الكلية للبدء:',
    requiredChannels: ['@UniLibraryNews'],
    mainMenu: '📚 الكليات\n🔍 بحث\n📞 الدعم والمساندة',
    supportContact: '@UniSupportAdmin',
    updatedAt: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [channelInput, setChannelInput] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getTelegramSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading telegram settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await api.updateTelegramSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving telegram settings:', err);
      alert('فشل حفظ إعدادات البوت');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChannel = () => {
    if (!channelInput.trim()) return;
    const formatted = channelInput.trim().startsWith('@') ? channelInput.trim() : `@${channelInput.trim()}`;
    if (!settings.requiredChannels.includes(formatted)) {
      setSettings({
        ...settings,
        requiredChannels: [...settings.requiredChannels, formatted],
      });
    }
    setChannelInput('');
  };

  const handleRemoveChannel = (channel: string) => {
    setSettings({
      ...settings,
      requiredChannels: settings.requiredChannels.filter((c) => c !== channel),
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-600">جاري تحميل إعدادات بوت تليجرام من Firestore...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-lg text-xs font-bold border border-sky-500/20">
            <Bot className="w-4 h-4" />
            <span>إعدادات البوت الخارجية (Telegram Bot)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">إدارة إعدادات بوت تليجرام</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            يتم حفظ هذه البيانات مباشرة داخل Firestore في كولكشن <code className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-xs">telegram_settings</code> ليتمكن بوت تليجرام من القراءة الفورية دون تعديل قاعدة البيانات مستقبلاً.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold p-4 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>تم حفظ إعدادات بوت تليجرام بنجاح في Firestore!</span>
            </div>
          )}

          {/* Bot Username */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-sky-600" />
              <span>معرف البوت الرسمى (Bot Username)</span>
            </label>
            <input
              type="text"
              value={settings.botUsername}
              onChange={(e) => setSettings({ ...settings, botUsername: e.target.value })}
              placeholder="@UniLibraryBot"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono text-left dir-ltr"
              required
            />
            <p className="text-[11px] text-slate-500">اسم المستخدم للفيسبوك/تليجرام للبوت لتوجيه الطلاب.</p>
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>رسالة الترحيب الأولى (/start)</span>
            </label>
            <textarea
              rows={3}
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              placeholder="أهلاً بك في البوت الرسمي للمكتبة..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Main Menu Shortcuts */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-purple-600" />
              <span>عناوين القائمة الرئيسية (Main Menu Buttons)</span>
            </label>
            <textarea
              rows={3}
              value={settings.mainMenu}
              onChange={(e) => setSettings({ ...settings, mainMenu: e.target.value })}
              placeholder="📚 الكليات&#10;🔍 بحث&#10;📞 الدعم"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Required Subscribed Channels */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>القنوات الإجبارية للاشتراك (Force Subscribe Channels)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                placeholder="@ChannelUsername"
                className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono text-left dir-ltr"
              />
              <button
                type="button"
                onClick={handleAddChannel}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-extrabold rounded-xl hover:bg-slate-800 transition-all"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {settings.requiredChannels.map((channel) => (
                <span
                  key={channel}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-mono font-bold"
                >
                  <span>{channel}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChannel(channel)}
                    className="text-amber-600 hover:text-rose-600 font-black text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
              {settings.requiredChannels.length === 0 && (
                <p className="text-xs text-slate-400">لا يوجد قنوات إجبارية حالياً.</p>
              )}
            </div>
          </div>

          {/* Support Contact */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-blue-600" />
              <span>حساب أو رابط الدعم الفني (Support Contact)</span>
            </label>
            <input
              type="text"
              value={settings.supportContact}
              onChange={(e) => setSettings({ ...settings, supportContact: e.target.value })}
              placeholder="@UniSupportAdmin"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-left dir-ltr"
            />
          </div>

          {/* Security Note */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <p className="font-extrabold text-slate-800">ملاحظة أمان هامة 🔒</p>
            <p>
              رمز البوت الخاص بـ Telegram (Telegram Bot Token) مخزن بأمان تام داخل متغيرات البيئة (Environment Variables) ولن يتم كشفه مطلقاً في Firestore لحماية أمان البوت.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-900/20 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ في Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ إعدادات البوت</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Telegram Live Preview Simulator */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-sm self-start">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center font-black text-xs text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white">{settings.botUsername || '@Bot'}</h3>
                <p className="text-[10px] text-sky-400 font-medium">معاينة استجابة البوت للطلاب</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/80 space-y-2">
              <span className="text-[10px] text-slate-400 block font-mono">الطلاب ← /start</span>
              <p className="text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                {settings.welcomeMessage}
              </p>
            </div>

            {settings.requiredChannels.length > 0 && (
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/60 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold">⚠️ القنوات المطلوبة للربط:</span>
                <p className="text-amber-200 font-mono text-[11px]">
                  {settings.requiredChannels.join(', ')}
                </p>
              </div>
            )}

            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-2">
              <span className="text-[10px] text-slate-400 block font-mono">القائمة الرئيسية المتصلة بالـ Firestore:</span>
              <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
                <div className="bg-sky-600/30 text-sky-300 py-1.5 px-2 rounded-lg border border-sky-500/30">
                  🏛️ الكليات
                </div>
                <div className="bg-sky-600/30 text-sky-300 py-1.5 px-2 rounded-lg border border-sky-500/30">
                  🔍 بحث شامل
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center pt-2 border-t border-slate-800">
              آخر تحديث في Firestore: {new Date(settings.updatedAt).toLocaleString('ar-SA')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
