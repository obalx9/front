import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import {
  TrendingUp, DollarSign, ShoppingCart, Users, Store,
  ChevronDown, ChevronUp, Loader2, ArrowDownToLine,
  Clock, CheckCircle2, XCircle, AlertCircle, X, Check
} from 'lucide-react';

interface AdminStats {
  total_sales: string;
  total_gmv: string;
  total_platform_revenue: string;
  total_seller_payouts: string;
  pending_count: string;
  canceled_count: string;
  unique_buyers: string;
  courses_with_sales: string;
  monthly: { month: string; sales: number; gmv: number; platform_revenue: number }[];
  top_sellers: { id: string; business_name: string; sales: number; gmv: number; platform_fee: number }[];
}

interface Order {
  id: string;
  amount: number;
  platform_fee: number;
  seller_amount: number;
  status: string;
  yookassa_payment_id: string | null;
  created_at: string;
  course: { id: string; title: string };
  seller: { id: string; business_name: string };
  buyer: { id: string; first_name: string | null; last_name: string | null; telegram_username: string | null; email: string | null };
}

interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  payment_details: Record<string, string>;
  admin_note: string | null;
  created_at: string;
  seller: { id: string; business_name: string };
  user: { id: string; first_name: string | null; last_name: string | null; telegram_username: string | null; email: string | null };
}

type StatusFilter = 'all' | 'succeeded' | 'pending' | 'canceled';
type WithdrawalFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'paid';

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  succeeded: { label: 'Оплачен', cls: 'bg-green-100 text-green-700' },
  pending: { label: 'Ожидает', cls: 'bg-amber-100 text-amber-700' },
  canceled: { label: 'Отменён', cls: 'bg-red-100 text-red-700' },
  refunded: { label: 'Возврат', cls: 'bg-gray-100 text-gray-600' },
};

const WITHDRAWAL_STATUS: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: 'На рассмотрении', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Одобрена', cls: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  rejected: { label: 'Отклонена', cls: 'bg-red-100 text-red-700', icon: XCircle },
  paid: { label: 'Выплачена', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

function formatRub(kopecks: number | string) {
  const n = typeof kopecks === 'string' ? parseInt(kopecks) : kopecks;
  if (!n) return '0 ₽';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(n / 100);
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function SalesTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [withdrawalFilter, setWithdrawalFilter] = useState<WithdrawalFilter>('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showTopSellers, setShowTopSellers] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: 'approved' | 'rejected' | 'paid' } | null>(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  useEffect(() => {
    loadWithdrawals();
  }, [withdrawalFilter]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await api.get<AdminStats>('/api/payments/admin/stats');
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const qs = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const data = await api.get<{ orders: Order[]; total: number }>(`/api/payments/admin/orders?page=${page}&limit=20${qs}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadWithdrawals = useCallback(async () => {
    setLoadingWithdrawals(true);
    try {
      const qs = withdrawalFilter !== 'all' ? `?status=${withdrawalFilter}` : '';
      const data = await api.get<Withdrawal[]>(`/api/payments/admin/withdrawals${qs}`);
      setWithdrawals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWithdrawals(false);
    }
  }, [withdrawalFilter]);

  const handleWithdrawalAction = async (id: string, action: 'approved' | 'rejected' | 'paid') => {
    setNoteModal({ id, action });
    setAdminNote('');
  };

  const confirmAction = async () => {
    if (!noteModal) return;
    setProcessingId(noteModal.id);
    try {
      await api.patch(`/api/payments/admin/withdrawals/${noteModal.id}`, {
        status: noteModal.action,
        admin_note: adminNote || null,
      });
      setNoteModal(null);
      loadWithdrawals();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const totalPages = Math.ceil(total / 20);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {loadingStats ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={ShoppingCart} label="Продаж" value={stats.total_sales} color="bg-teal-50 text-teal-600" />
            <StatCard icon={DollarSign} label="Оборот (GMV)" value={formatRub(stats.total_gmv)} color="bg-blue-50 text-blue-600" />
            <StatCard icon={TrendingUp} label="Выручка платформы" value={formatRub(stats.total_platform_revenue)} color="bg-green-50 text-green-600" />
            <StatCard icon={Users} label="Покупателей" value={stats.unique_buyers} sub={`${stats.courses_with_sales} курсов продано`} color="bg-amber-50 text-amber-600" />
          </div>

          {/* Top sellers */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowTopSellers(p => !p)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Топ продавцов</span>
              </div>
              {showTopSellers ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showTopSellers && (
              <div className="border-t border-gray-100">
                {stats.top_sellers.length === 0 ? (
                  <p className="text-center py-6 text-gray-400 text-sm">Нет данных</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {stats.top_sellers.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-4 px-6 py-3">
                        <span className="text-lg font-bold text-gray-200 w-6 text-center">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{s.business_name}</p>
                          <p className="text-xs text-gray-400">{s.sales} продаж</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{formatRub(s.gmv)}</p>
                          <p className="text-xs text-teal-600">→ {formatRub(s.platform_fee)} платформе</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Withdrawal requests */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Заявки на вывод</h3>
            {pendingWithdrawals > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingWithdrawals}</span>
            )}
          </div>
          <div className="flex gap-1">
            {(['pending', 'approved', 'paid', 'rejected', 'all'] as WithdrawalFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setWithdrawalFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  withdrawalFilter === f
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Все' : WITHDRAWAL_STATUS[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        {loadingWithdrawals ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          </div>
        ) : withdrawals.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">Заявок нет</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {withdrawals.map(w => {
              const st = WITHDRAWAL_STATUS[w.status];
              const Icon = st.icon;
              const userName = [w.user.first_name, w.user.last_name].filter(Boolean).join(' ') || w.user.telegram_username || w.user.email || '—';
              const details = w.payment_details || {};
              return (
                <div key={w.id} className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{formatRub(w.amount)}</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">{w.seller.business_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{userName} · {new Date(w.created_at).toLocaleDateString('ru-RU')}</p>

                      {/* Payment details */}
                      {Object.keys(details).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {details.method === 'card' && (
                            <>
                              <span className="text-xs text-gray-500">Карта: <span className="font-mono font-medium text-gray-700">{details.card_number}</span></span>
                              {details.card_holder && <span className="text-xs text-gray-500">Держатель: <span className="font-medium text-gray-700">{details.card_holder}</span></span>}
                            </>
                          )}
                          {details.method === 'account' && (
                            <>
                              <span className="text-xs text-gray-500">Р/С: <span className="font-mono font-medium text-gray-700">{details.bank_account}</span></span>
                              <span className="text-xs text-gray-500">БИК: <span className="font-mono font-medium text-gray-700">{details.bank_bic}</span></span>
                            </>
                          )}
                        </div>
                      )}

                      {w.admin_note && (
                        <p className="text-xs text-gray-500 mt-1 italic">Комментарий: {w.admin_note}</p>
                      )}
                    </div>

                    {/* Actions */}
                    {w.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'approved')}
                          disabled={processingId === w.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'rejected')}
                          disabled={processingId === w.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Отклонить
                        </button>
                      </div>
                    )}
                    {w.status === 'approved' && (
                      <button
                        onClick={() => handleWithdrawalAction(w.id, 'paid')}
                        disabled={processingId === w.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Отметить выплаченной
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Orders list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Все платежи</h3>
          <div className="flex gap-1">
            {(['all', 'succeeded', 'pending', 'canceled'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'all' ? 'Все' : STATUS_LABELS[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {loadingOrders ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center py-10 text-gray-400">Платежей нет</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    <th className="text-left px-6 py-3 font-medium">Дата</th>
                    <th className="text-left px-4 py-3 font-medium">Покупатель</th>
                    <th className="text-left px-4 py-3 font-medium">Курс</th>
                    <th className="text-left px-4 py-3 font-medium">Продавец</th>
                    <th className="text-right px-4 py-3 font-medium">Сумма</th>
                    <th className="text-right px-4 py-3 font-medium">Платформа</th>
                    <th className="text-center px-4 py-3 font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map(o => {
                    const buyer = o.buyer;
                    const buyerName = [buyer.first_name, buyer.last_name].filter(Boolean).join(' ') || buyer.telegram_username || buyer.email || '—';
                    const st = STATUS_LABELS[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600' };
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(o.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100 max-w-[130px] truncate">{buyerName}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[160px] truncate">{o.course.title}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[120px] truncate">{o.seller.business_name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatRub(o.amount)}</td>
                        <td className="px-4 py-3 text-right text-teal-600 whitespace-nowrap">{formatRub(o.platform_fee)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Страница {page} из {totalPages} ({total} записей)</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Вперёд
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Note modal for approve/reject/paid */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNoteModal(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
              {noteModal.action === 'approved' ? 'Одобрить заявку' : noteModal.action === 'rejected' ? 'Отклонить заявку' : 'Отметить выплаченной'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Можно оставить комментарий для продавца (необязательно)</p>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Комментарий..."
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4 transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmAction}
                disabled={processingId !== null}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                  noteModal.action === 'rejected'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
