import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Mail,
  Send,
  Globe,
  Phone,
  MapPin,
  MessageCircle,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  BarChart2,
  CheckCircle,
  AlertCircle,
  GripVertical,
} from 'lucide-react';

interface SiteContact {
  id: string;
  label: string;
  value: string;
  icon: string;
  url: string | null;
  order_index: number;
  is_active: boolean;
}

interface SiteMetric {
  id: string;
  label: string;
  value: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

const CONTACT_ICONS = ['Mail', 'Send', 'Globe', 'Phone', 'MapPin', 'MessageCircle'];
const METRIC_ICONS = ['BookOpen', 'Users', 'Award', 'TrendingUp', 'BarChart2'];

const ICON_MAP: Record<string, React.ElementType> = {
  Mail, Send, Globe, Phone, MapPin, MessageCircle,
  BookOpen, Users, Award, TrendingUp, BarChart2,
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Mail;
  return <Icon className={className} />;
}

const emptyContact = { label: '', value: '', icon: 'Mail', url: '', order_index: 0, is_active: true };
const emptyMetric = { label: '', value: '', icon: 'BookOpen', order_index: 0, is_active: true };

type SaveStatus = 'idle' | 'success' | 'error';

export default function ContactsMetricsTab() {
  const [contacts, setContacts] = useState<SiteContact[]>([]);
  const [metrics, setMetrics] = useState<SiteMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const [editContactId, setEditContactId] = useState<string | null>(null);
  const [creatingContact, setCreatingContact] = useState(false);
  const [contactForm, setContactForm] = useState(emptyContact);

  const [editMetricId, setEditMetricId] = useState<string | null>(null);
  const [creatingMetric, setCreatingMetric] = useState(false);
  const [metricForm, setMetricForm] = useState(emptyMetric);

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cData, mData] = await Promise.all([
        api.getSiteContacts(),
        api.getSiteMetrics(),
      ]);
      setContacts(cData || []);
      setMetrics(mData || []);
    } catch (error) {
      console.error('Error loading contacts/metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (status: SaveStatus) => {
    setSaveStatus(status);
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleSaveContact = async () => {
    setSaving(true);
    try {
      const payload = {
        label: contactForm.label.trim(),
        value: contactForm.value.trim(),
        icon: contactForm.icon,
        url: contactForm.url?.trim() || null,
        order_index: Number(contactForm.order_index),
        is_active: contactForm.is_active,
      };
      if (creatingContact) {
        await api.createSiteContact(payload);
      } else if (editContactId) {
        await api.updateSiteContact(editContactId, payload);
      }
      setCreatingContact(false);
      setEditContactId(null);
      setContactForm(emptyContact);
      showStatus('success');
      loadAll();
    } catch {
      showStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Удалить этот контакт?')) return;
    try {
      await api.deleteSiteContact(id);
      setContacts(contacts.filter(c => c.id !== id));
    } catch {
      showStatus('error');
    }
  };

  const handleSaveMetric = async () => {
    setSaving(true);
    try {
      const payload = {
        label: metricForm.label.trim(),
        value: metricForm.value.trim(),
        icon: metricForm.icon,
        order_index: Number(metricForm.order_index),
        is_active: metricForm.is_active,
      };
      if (creatingMetric) {
        await api.createSiteMetric(payload);
      } else if (editMetricId) {
        await api.updateSiteMetric(editMetricId, payload);
      }
      setCreatingMetric(false);
      setEditMetricId(null);
      setMetricForm(emptyMetric);
      showStatus('success');
      loadAll();
    } catch {
      showStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMetric = async (id: string) => {
    if (!confirm('Удалить этот показатель?')) return;
    try {
      await api.deleteSiteMetric(id);
      setMetrics(metrics.filter(m => m.id !== id));
    } catch {
      showStatus('error');
    }
  };

  const startEditContact = (c: SiteContact) => {
    setCreatingContact(false);
    setEditContactId(c.id);
    setContactForm({ label: c.label, value: c.value, icon: c.icon, url: c.url || '', order_index: c.order_index, is_active: c.is_active });
  };

  const startEditMetric = (m: SiteMetric) => {
    setCreatingMetric(false);
    setEditMetricId(m.id);
    setMetricForm({ label: m.label, value: m.value, icon: m.icon, order_index: m.order_index, is_active: m.is_active });
  };

  const cancelContact = () => { setCreatingContact(false); setEditContactId(null); setContactForm(emptyContact); };
  const cancelMetric = () => { setCreatingMetric(false); setEditMetricId(null); setMetricForm(emptyMetric); };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEditingContact = creatingContact || !!editContactId;
  const isEditingMetric = creatingMetric || !!editMetricId;

  return (
    <div className="space-y-8">
      {saveStatus !== 'idle' && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${saveStatus === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'}`}>
          {saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {saveStatus === 'success' ? 'Сохранено' : 'Ошибка сохранения'}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Контакты</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Отображаются на странице «Контакты»</p>
            </div>
          </div>
          {!isEditingContact && (
            <button
              onClick={() => { setCreatingContact(true); setEditContactId(null); setContactForm(emptyContact); }}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          )}
        </div>

        {isEditingContact && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {creatingContact ? 'Новый контакт' : 'Редактировать контакт'}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Название</label>
                <input
                  type="text"
                  value={contactForm.label}
                  onChange={e => setContactForm({ ...contactForm, label: e.target.value })}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Значение</label>
                <input
                  type="text"
                  value={contactForm.value}
                  onChange={e => setContactForm({ ...contactForm, value: e.target.value })}
                  placeholder="info@keykurs.ru"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ссылка (необязательно)</label>
                <input
                  type="text"
                  value={contactForm.url}
                  onChange={e => setContactForm({ ...contactForm, url: e.target.value })}
                  placeholder="mailto:info@keykurs.ru"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Порядок</label>
                <input
                  type="number"
                  value={contactForm.order_index}
                  onChange={e => setContactForm({ ...contactForm, order_index: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Иконка</label>
                <div className="flex flex-wrap gap-2">
                  {CONTACT_ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setContactForm({ ...contactForm, icon: ic })}
                      className={`p-2 rounded-lg border transition-colors ${contactForm.icon === ic ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}
                      title={ic}
                    >
                      <DynamicIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="contact-active"
                  checked={contactForm.is_active}
                  onChange={e => setContactForm({ ...contactForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="contact-active" className="text-sm text-gray-700 dark:text-gray-300">Активен</label>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleSaveContact}
                disabled={saving || !contactForm.label.trim() || !contactForm.value.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={cancelContact} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                <X className="w-4 h-4" />
                Отмена
              </button>
            </div>
          </div>
        )}

        {contacts.length === 0 && !isEditingContact ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">Контакты не добавлены</p>
        ) : (
          <div className="space-y-3">
            {contacts.map(c => (
              <div
                key={c.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${c.is_active ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'}`}
              >
                <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <DynamicIcon name={c.icon} className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.value}</p>
                </div>
                {!c.is_active && <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">скрыт</span>}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEditContact(c)}
                    className="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Метрики / Счётчики</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Блок статистики на главной странице</p>
            </div>
          </div>
          {!isEditingMetric && (
            <button
              onClick={() => { setCreatingMetric(true); setEditMetricId(null); setMetricForm(emptyMetric); }}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          )}
        </div>

        {isEditingMetric && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {creatingMetric ? 'Новый показатель' : 'Редактировать показатель'}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Подпись</label>
                <input
                  type="text"
                  value={metricForm.label}
                  onChange={e => setMetricForm({ ...metricForm, label: e.target.value })}
                  placeholder="Курсов"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Значение</label>
                <input
                  type="text"
                  value={metricForm.value}
                  onChange={e => setMetricForm({ ...metricForm, value: e.target.value })}
                  placeholder="500+"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Порядок</label>
                <input
                  type="number"
                  value={metricForm.order_index}
                  onChange={e => setMetricForm({ ...metricForm, order_index: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Иконка</label>
                <div className="flex flex-wrap gap-2">
                  {METRIC_ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setMetricForm({ ...metricForm, icon: ic })}
                      className={`p-2 rounded-lg border transition-colors ${metricForm.icon === ic ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}
                      title={ic}
                    >
                      <DynamicIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="metric-active"
                  checked={metricForm.is_active}
                  onChange={e => setMetricForm({ ...metricForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="metric-active" className="text-sm text-gray-700 dark:text-gray-300">Активен</label>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleSaveMetric}
                disabled={saving || !metricForm.label.trim() || !metricForm.value.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={cancelMetric} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                <X className="w-4 h-4" />
                Отмена
              </button>
            </div>
          </div>
        )}

        {metrics.length === 0 && !isEditingMetric ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">Метрики не добавлены</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map(m => (
              <div
                key={m.id}
                className={`relative p-4 rounded-xl border transition-colors ${m.is_active ? 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10' : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                    <DynamicIcon name={m.icon} className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    {!m.is_active && <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">скрыт</span>}
                    <button onClick={() => startEditMetric(m)} className="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteMetric(m.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{m.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
