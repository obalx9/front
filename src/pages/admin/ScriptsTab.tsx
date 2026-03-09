import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Save, AlertCircle, CheckCircle, Code, ToggleLeft, ToggleRight, ChevronUp, ChevronDown } from 'lucide-react';

interface SiteScript {
  id: string;
  name: string;
  code: string;
  position: 'head' | 'body_end';
  is_active: boolean;
  order_index: number;
}

const EMPTY_SCRIPT: Omit<SiteScript, 'id'> = {
  name: '',
  code: '',
  position: 'body_end',
  is_active: true,
  order_index: 0,
};

export default function ScriptsTab() {
  const [scripts, setScripts] = useState<SiteScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<SiteScript, 'id'>>(EMPTY_SCRIPT);
  const [showForm, setShowForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    setLoading(true);
    try {
      const data = await api.get<SiteScript[]>('/api/scripts/all');
      setScripts(data || []);
    } catch {
      setScripts([]);
    } finally {
      setLoading(false);
    }
  };

  const showSaveStatus = (status: 'success' | 'error') => {
    setSaveStatus(status);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleAdd = () => {
    setEditingId(null);
    setEditForm({ ...EMPTY_SCRIPT, order_index: scripts.length });
    setShowForm(true);
  };

  const handleEdit = (script: SiteScript) => {
    setEditingId(script.id);
    setEditForm({
      name: script.name,
      code: script.code,
      position: script.position,
      is_active: script.is_active,
      order_index: script.order_index,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setEditForm(EMPTY_SCRIPT);
  };

  const handleSave = async () => {
    if (!editForm.name.trim() || !editForm.code.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/api/scripts/${editingId}`, editForm);
      } else {
        await api.post('/api/scripts', editForm);
      }
      await loadScripts();
      setShowForm(false);
      setEditingId(null);
      setEditForm(EMPTY_SCRIPT);
      showSaveStatus('success');
    } catch {
      showSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить скрипт?')) return;
    try {
      await api.delete(`/api/scripts/${id}`);
      setScripts(scripts.filter(s => s.id !== id));
    } catch {
      showSaveStatus('error');
    }
  };

  const handleToggle = async (script: SiteScript) => {
    try {
      await api.put(`/api/scripts/${script.id}`, { ...script, is_active: !script.is_active });
      setScripts(scripts.map(s => s.id === script.id ? { ...s, is_active: !s.is_active } : s));
    } catch {
      showSaveStatus('error');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newScripts = [...scripts];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newScripts.length) return;
    [newScripts[index], newScripts[swapIndex]] = [newScripts[swapIndex], newScripts[index]];
    const updated = newScripts.map((s, i) => ({ ...s, order_index: i }));
    setScripts(updated);
    for (const s of updated) {
      await api.put(`/api/scripts/${s.id}`, s);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">HTML / Скрипты сайта</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Добавляйте коды счётчиков, виджетов поддержки, Google Tag Manager и других сервисов
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" /> Сохранено
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" /> Ошибка
            </div>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить скрипт
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingId ? 'Редактировать скрипт' : 'Новый скрипт'}
          </h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Название <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Google Tag Manager"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Позиция вставки
                </label>
                <select
                  value={editForm.position}
                  onChange={e => setEditForm(f => ({ ...f, position: e.target.value as 'head' | 'body_end' }))}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="head">&lt;head&gt; — аналитика, GTM, мета-теги</option>
                  <option value="body_end">Конец &lt;body&gt; — виджеты, чаты поддержки</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                HTML / JavaScript код <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editForm.code}
                onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))}
                placeholder={'<!-- Google Tag Manager -->\n<script>\n  (function(w,d,s,l,i){...})(window,document,\'script\',\'dataLayer\',\'GTM-XXXX\');\n</script>'}
                rows={10}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-y"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Вставьте полный код включая теги &lt;script&gt; или &lt;noscript&gt;
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Активен</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving || !editForm.name.trim() || !editForm.code.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {scripts.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Нет добавленных скриптов</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Нажмите «Добавить скрипт» чтобы вставить код стороннего сервиса
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map((script, index) => (
            <div
              key={script.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border transition-colors ${
                script.is_active
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-100 dark:border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 p-4">
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === scripts.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{script.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      script.position === 'head'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {script.position === 'head' ? '<head>' : '<body>'}
                    </span>
                    {!script.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                        Отключён
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono truncate">
                    {script.code.slice(0, 80)}{script.code.length > 80 ? '...' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(script)}
                    className={`p-2 rounded-lg transition-colors ${
                      script.is_active
                        ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={script.is_active ? 'Отключить' : 'Включить'}
                  >
                    {script.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(script)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(script.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
