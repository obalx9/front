import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  Users, Search, RefreshCw, ShieldBan, ShieldCheck, ChevronDown, ChevronUp
} from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  oauth_provider: string | null;
  photo_url: string | null;
  is_blocked: boolean;
  created_at: string;
  roles: string[] | null;
}

type SortKey = 'created_at' | 'first_name';

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBlocked, setFilterBlocked] = useState<'all' | 'active' | 'blocked'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDesc, setSortDesc] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<AdminUser | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get<AdminUser[]>('/api/admin/users');
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleBlock = async (user: AdminUser) => {
    if (!user.is_blocked) {
      setConfirmBlock(user);
      return;
    }
    await doToggle(user, false);
  };

  const doToggle = async (user: AdminUser, is_blocked: boolean) => {
    setToggling(user.id);
    setConfirmBlock(null);
    try {
      const updated = await api.patch<AdminUser>(`/api/admin/users/${user.id}/block`, { is_blocked });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_blocked: updated.is_blocked } : u));
    } catch (err: any) {
      alert(err.message || 'Не удалось изменить статус пользователя');
    } finally {
      setToggling(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(d => !d);
    else { setSortKey(key); setSortDesc(true); }
  };

  const displayName = (u: AdminUser) => {
    if (u.first_name || u.last_name) return [u.first_name, u.last_name].filter(Boolean).join(' ');
    if (u.telegram_username) return `@${u.telegram_username}`;
    if (u.email) return u.email;
    return 'Без имени';
  };

  const authLabel = (u: AdminUser) => {
    if (u.oauth_provider === 'yandex') return 'Яндекс';
    if (u.oauth_provider === 'vk') return 'ВКонтакте';
    return 'Telegram';
  };

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        displayName(u).toLowerCase().includes(q) ||
        (u.telegram_username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q);
      const matchFilter =
        filterBlocked === 'all' ||
        (filterBlocked === 'active' && !u.is_blocked) ||
        (filterBlocked === 'blocked' && u.is_blocked);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let valA: any = sortKey === 'first_name' ? displayName(a).toLowerCase() : new Date(a.created_at).getTime();
      let valB: any = sortKey === 'first_name' ? displayName(b).toLowerCase() : new Date(b.created_at).getTime();
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDesc ? <ChevronDown className="w-3.5 h-3.5 inline ml-1" /> : <ChevronUp className="w-3.5 h-3.5 inline ml-1" />;
  };

  const isSuperAdmin = (u: AdminUser) => (u.roles || []).includes('super_admin');

  return (
    <div className="space-y-5">
      {/* Confirm dialog */}
      {confirmBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmBlock(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <ShieldBan className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-center font-bold text-gray-900 dark:text-gray-100 mb-2">Заблокировать аккаунт?</h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="font-medium text-gray-700 dark:text-gray-300">{displayName(confirmBlock)}</span> не сможет войти на платформу.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBlock(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => doToggle(confirmBlock, true)}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Заблокировать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по имени, username, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'blocked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterBlocked(f)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterBlocked === f
                  ? 'bg-teal-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Заблокированные'}
            </button>
          ))}
          <button
            onClick={loadUsers}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Обновить"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>Всего: <span className="font-semibold text-gray-800 dark:text-gray-200">{users.length}</span></span>
        <span>Активных: <span className="font-semibold text-green-700 dark:text-green-400">{users.filter(u => !u.is_blocked).length}</span></span>
        <span>Заблокированных: <span className="font-semibold text-red-600 dark:text-red-400">{users.filter(u => u.is_blocked).length}</span></span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Пользователи не найдены</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <button onClick={() => handleSort('first_name')} className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                      Пользователь <SortIcon col="first_name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Авторизация</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Роли</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <button onClick={() => handleSort('created_at')} className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                      Регистрация <SortIcon col="created_at" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Статус</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map(user => (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${user.is_blocked ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.photo_url ? (
                          <img src={user.photo_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                              {displayName(user).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{displayName(user)}</p>
                          {user.telegram_username && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">@{user.telegram_username}</p>
                          )}
                          {user.email && !user.telegram_username && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{authLabel(user)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(user.roles || []).map(role => (
                          <span
                            key={role}
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              role === 'super_admin'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                : role === 'seller'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {role === 'super_admin' ? 'Админ' : role === 'seller' ? 'Селлер' : 'Студент'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.is_blocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                          <ShieldBan className="w-3 h-3" /> Заблокирован
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                          <ShieldCheck className="w-3 h-3" /> Активен
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isSuperAdmin(user) ? (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">защищён</span>
                      ) : (
                        <button
                          onClick={() => handleToggleBlock(user)}
                          disabled={toggling === user.id}
                          title={user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                            user.is_blocked
                              ? 'text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                        >
                          {user.is_blocked
                            ? <ShieldCheck className="w-4 h-4" />
                            : <ShieldBan className="w-4 h-4" />
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(user => (
              <div key={user.id} className={`p-4 space-y-3 ${user.is_blocked ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3">
                  {user.photo_url ? (
                    <img src={user.photo_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        {displayName(user).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{displayName(user)}</p>
                    {user.telegram_username && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{user.telegram_username}</p>
                    )}
                  </div>
                  {user.is_blocked ? (
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium whitespace-nowrap">
                      Заблокирован
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium whitespace-nowrap">
                      Активен
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(user.roles || []).map(role => (
                    <span
                      key={role}
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        role === 'super_admin'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : role === 'seller'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {role === 'super_admin' ? 'Админ' : role === 'seller' ? 'Селлер' : 'Студент'}
                    </span>
                  ))}
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                    {authLabel(user)} · {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                {!isSuperAdmin(user) && (
                  <button
                    onClick={() => handleToggleBlock(user)}
                    disabled={toggling === user.id}
                    className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 ${
                      user.is_blocked
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40'
                        : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40'
                    }`}
                  >
                    {user.is_blocked
                      ? <><ShieldCheck className="w-3.5 h-3.5" /> Разблокировать</>
                      : <><ShieldBan className="w-3.5 h-3.5" /> Заблокировать</>
                    }
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
