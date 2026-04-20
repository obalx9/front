import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  BookOpen, ExternalLink, Eye, EyeOff, Search, Users,
  ChevronDown, ChevronUp, RefreshCw, Store
} from 'lucide-react';

interface AdminCourse {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  price: number;
  payment_enabled: boolean;
  thumbnail_url: string | null;
  seller_id: string;
  seller_name: string | null;
  first_name: string | null;
  last_name: string | null;
  telegram_username: string | null;
  enrollment_count: number;
  post_count: number;
  created_at: string;
}

type SortKey = 'created_at' | 'title' | 'enrollment_count' | 'post_count';

export default function CoursesTab() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'hidden'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDesc, setSortDesc] = useState(true);
  const [moderating, setModerating] = useState<string | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await api.get<AdminCourse[]>('/api/admin/courses');
      setCourses(data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleTogglePublished = async (course: AdminCourse) => {
    setModerating(course.id);
    try {
      const updated = await api.patch<AdminCourse>(`/api/admin/courses/${course.id}/moderate`, {
        is_published: !course.is_published,
      });
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_published: updated.is_published } : c));
    } catch (err) {
      console.error('Failed to moderate course:', err);
      alert('Не удалось изменить статус курса');
    } finally {
      setModerating(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(d => !d);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const filtered = courses
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        (c.seller_name || '').toLowerCase().includes(q) ||
        (c.telegram_username || '').toLowerCase().includes(q);
      const matchFilter =
        filterPublished === 'all' ||
        (filterPublished === 'published' && c.is_published) ||
        (filterPublished === 'hidden' && !c.is_published);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];
      if (sortKey === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB as string).toLowerCase();
      }
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDesc
      ? <ChevronDown className="w-3.5 h-3.5 inline ml-1" />
      : <ChevronUp className="w-3.5 h-3.5 inline ml-1" />;
  };

  const formatPrice = (kopecks: number) =>
    kopecks > 0
      ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(kopecks / 100)
      : 'Бесплатно';

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию, селлеру..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'hidden'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterPublished(f)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterPublished === f
                  ? 'bg-teal-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'published' ? 'Опубликованные' : 'Скрытые'}
            </button>
          ))}
          <button
            onClick={loadCourses}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Обновить"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>Всего: <span className="font-semibold text-gray-800 dark:text-gray-200">{courses.length}</span></span>
        <span>Опубликованных: <span className="font-semibold text-green-700 dark:text-green-400">{courses.filter(c => c.is_published).length}</span></span>
        <span>Скрытых: <span className="font-semibold text-gray-600 dark:text-gray-400">{courses.filter(c => !c.is_published).length}</span></span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Курсы не найдены</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <button onClick={() => handleSort('title')} className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                      Курс <SortIcon col="title" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Селлер
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <button onClick={() => handleSort('post_count')} className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                      Уроки <SortIcon col="post_count" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <button onClick={() => handleSort('enrollment_count')} className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                      Студентов <SortIcon col="enrollment_count" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Цена
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-teal-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[220px]">{course.title}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(course.created_at).toLocaleDateString('ru-RU')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{course.seller_name || '—'}</p>
                      {course.telegram_username && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">@{course.telegram_username}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{course.post_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {course.enrollment_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {course.payment_enabled ? formatPrice(course.price) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {course.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                          <Eye className="w-3 h-3" /> Опубликован
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-medium">
                          <EyeOff className="w-3 h-3" /> Скрыт
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* View course */}
                        <a
                          href={`/course/${course.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                          title="Просмотреть курс"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {/* Go to seller dashboard */}
                        <a
                          href={`/seller/course/${course.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Открыть ЛК селлера"
                        >
                          <Store className="w-4 h-4" />
                        </a>
                        {/* Toggle publish */}
                        <button
                          onClick={() => handleTogglePublished(course)}
                          disabled={moderating === course.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            course.is_published
                              ? 'text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          } disabled:opacity-40`}
                          title={course.is_published ? 'Снять с публикации' : 'Опубликовать'}
                        >
                          {course.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(course => (
              <div key={course.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-teal-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{course.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{course.seller_name || '—'}</p>
                  </div>
                  {course.is_published ? (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium whitespace-nowrap">
                      Опубликован
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-medium whitespace-nowrap">
                      Скрыт
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{course.post_count} уроков</span>
                  <span>{course.enrollment_count} студентов</span>
                  {course.payment_enabled && <span>{formatPrice(course.price)}</span>}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`/course/${course.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Просмотр
                  </a>
                  <a
                    href={`/seller/course/${course.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <Store className="w-3.5 h-3.5" /> ЛК селлера
                  </a>
                  <button
                    onClick={() => handleTogglePublished(course)}
                    disabled={moderating === course.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 ${
                      course.is_published
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40'
                        : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40'
                    }`}
                  >
                    {course.is_published ? <><EyeOff className="w-3.5 h-3.5" /> Скрыть</> : <><Eye className="w-3.5 h-3.5" /> Опубликовать</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
