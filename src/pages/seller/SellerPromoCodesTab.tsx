import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check,
  ChevronDown, ChevronUp, Loader2, X, Calendar, Users, Percent, Banknote
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  course_id: string | null;
  course_title: string | null;
  max_uses: number | null;
  uses_count: number;
  total_uses: number;
  total_discount_given: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const formatPrice = (kopecks: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(kopecks / 100);

export default function SellerPromoCodesTab() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '',
    course_id: '',
    max_uses: '',
    expires_at: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [codesData, coursesData] = await Promise.all([
        api.get<PromoCode[]>('/api/payments/promo/seller'),
        api.get<Course[]>('/api/sellers/me/courses'),
      ]);
      setCodes(codesData);
      setCourses(coursesData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setFormError(null);
    if (!form.code.trim()) return setFormError('Введите код');
    if (!form.discount_value || Number(form.discount_value) <= 0) return setFormError('Введите размер скидки');
    if (form.discount_type === 'percent' && Number(form.discount_value) > 100) return setFormError('Процент не может быть больше 100');

    setSaving(true);
    try {
      await api.post('/api/payments/promo/seller', {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_type === 'fixed'
          ? Math.round(Number(form.discount_value) * 100)
          : Number(form.discount_value),
        course_id: form.course_id || undefined,
        max_uses: form.max_uses ? Number(form.max_uses) : undefined,
        expires_at: form.expires_at || undefined,
      });
      setForm({ code: '', discount_type: 'percent', discount_value: '', course_id: '', max_uses: '', expires_at: '' });
      setShowCreate(false);
      load();
    } catch (err: any) {
      setFormError(err.message || 'Ошибка при создании промокода');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (code: PromoCode) => {
    try {
      await api.patch(`/api/payments/promo/seller/${code.id}`, { is_active: !code.is_active });
      setCodes(prev => prev.map(c => c.id === code.id ? { ...c, is_active: !c.is_active } : c));
    } catch {
      // ignore
    }
  };

  const handleDelete = async (code: PromoCode) => {
    if (!confirm(`Удалить промокод «${code.code}»?`)) return;
    try {
      await api.delete(`/api/payments/promo/seller/${code.id}`);
      setCodes(prev => prev.filter(c => c.id !== code.id));
    } catch (err: any) {
      alert(err.message || 'Не удалось удалить промокод');
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Промокоды</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Создавайте скидочные коды для ваших курсов
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setFormError(null); }}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Создать промокод
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Новый промокод</h3>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Code */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Код промокода</label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                placeholder="SUMMER20"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono tracking-wider"
                maxLength={30}
              />
            </div>

            {/* Discount type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Тип скидки</label>
              <div className="flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setForm(p => ({ ...p, discount_type: 'percent' }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                    form.discount_type === 'percent'
                      ? 'bg-teal-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  Процент
                </button>
                <button
                  onClick={() => setForm(p => ({ ...p, discount_type: 'fixed' }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-600 ${
                    form.discount_type === 'fixed'
                      ? 'bg-teal-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  Фиксированная
                </button>
              </div>
            </div>

            {/* Discount value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {form.discount_type === 'percent' ? 'Размер скидки (%)' : 'Сумма скидки (₽)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.discount_value}
                  onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))}
                  placeholder={form.discount_type === 'percent' ? '20' : '500'}
                  min={1}
                  max={form.discount_type === 'percent' ? 100 : undefined}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {form.discount_type === 'percent' ? '%' : '₽'}
                </span>
              </div>
            </div>

            {/* Course (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Применять к курсу <span className="text-gray-400 font-normal">(необязательно)</span>
              </label>
              <select
                value={form.course_id}
                onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Все курсы</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Max uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Лимит использований <span className="text-gray-400 font-normal">(необязательно)</span>
              </label>
              <input
                type="number"
                value={form.max_uses}
                onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                placeholder="Без ограничений"
                min={1}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Expires at */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Срок действия <span className="text-gray-400 font-normal">(необязательно)</span>
              </label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {formError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError}</p>
          )}

          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Создать
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {codes.length === 0 && !showCreate && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-4">
            <Tag className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Промокодов пока нет</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Создайте первый промокод, чтобы привлечь покупателей
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Создать промокод
          </button>
        </div>
      )}

      {/* Promo code list */}
      {codes.length > 0 && (
        <div className="space-y-3">
          {codes.map(code => (
            <div
              key={code.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl border transition-colors ${
                code.is_active
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-100 dark:border-gray-800 opacity-60'
              } shadow-sm overflow-hidden`}
            >
              <div className="px-5 py-4 flex items-center gap-4">
                {/* Code badge */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-lg px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
                    <Tag className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-300 tracking-wider text-sm">
                      {code.code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyCode(code.code, code.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                    title="Скопировать"
                  >
                    {copiedId === code.id ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {code.discount_type === 'percent'
                          ? `−${code.discount_value}%`
                          : `−${formatPrice(code.discount_value)}`
                        }
                      </span>
                      {code.course_title && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full truncate max-w-[160px]">
                          {code.course_title}
                        </span>
                      )}
                      {!code.course_id && (
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          Все курсы
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {code.uses_count}{code.max_uses ? `/${code.max_uses}` : ''} использований
                      </span>
                      {code.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          до {new Date(code.expires_at).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(code)}
                    className={`transition-colors ${code.is_active ? 'text-teal-500 hover:text-teal-700' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500'}`}
                    title={code.is_active ? 'Отключить' : 'Включить'}
                  >
                    {code.is_active
                      ? <ToggleRight className="w-7 h-7" />
                      : <ToggleLeft className="w-7 h-7" />
                    }
                  </button>

                  <button
                    onClick={() => setExpandedId(expandedId === code.id ? null : code.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {expandedId === code.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {code.uses_count === 0 && (
                    <button
                      onClick={() => handleDelete(code)}
                      className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded stats */}
              {expandedId === code.id && (
                <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 bg-gray-50 dark:bg-gray-900/30">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Использований</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {code.total_uses}
                        {code.max_uses ? <span className="text-gray-400 font-normal"> / {code.max_uses}</span> : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Скидок выдано</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(Number(code.total_discount_given))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Создан</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(code.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    {code.expires_at && (
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Действует до</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {new Date(code.expires_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Статус</p>
                      <p className={`font-semibold ${code.is_active ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}>
                        {code.is_active ? 'Активен' : 'Отключён'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
