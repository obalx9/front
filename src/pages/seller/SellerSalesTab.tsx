import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import {
  TrendingUp, ShoppingCart, DollarSign, BookOpen, Loader2,
  ChevronDown, ChevronUp, Wallet, ArrowDownToLine, Clock,
  CheckCircle2, XCircle, AlertCircle, X, CreditCard, Info
} from 'lucide-react';

interface Balance {
  earned: number;
  paid_out: number;
  reserved: number;
  available: number;
}

interface SellerStats {
  total_sales: string;
  total_revenue: string;
  total_fees: string;
  pending_count: string;
  courses_sold: string;
  by_course: { id: string; title: string; sales: number; revenue: number }[];
}

interface Order {
  id: string;
  amount: number;
  platform_fee: number;
  seller_amount: number;
  status: string;
  created_at: string;
  course: { id: string; title: string };
  buyer: { id: string; first_name: string | null; last_name: string | null; telegram_username: string | null; email: string | null };
}

interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  payment_details: Record<string, string>;
  admin_note: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  succeeded: { label: 'Оплачен', cls: 'bg-green-100 text-green-700' },
  pending: { label: 'Ожидает', cls: 'bg-amber-100 text-amber-700' },
  canceled: { label: 'Отменён', cls: 'bg-red-100 text-red-700' },
  refunded: { label: 'Возврат', cls: 'bg-gray-100 text-gray-600' },
};

const WITHDRAWAL_STATUS: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: 'На рассмотрении', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  approved: { label: 'Одобрена', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
  rejected: { label: 'Отклонена', cls: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  paid: { label: 'Выплачена', cls: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
};

type OrderStatusFilter = 'all' | 'succeeded' | 'pending' | 'canceled';

function formatRub(kopecks: number | string) {
  const n = typeof kopecks === 'string' ? parseInt(kopecks) : kopecks;
  if (!n) return '0 ₽';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(n / 100);
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function SellerSalesTab() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showByCourse, setShowByCourse] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showOrdersSection, setShowOrdersSection] = useState(true);

  const loadBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const data = await api.get<Balance>('/api/payments/balance');
      setBalance(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await api.get<SellerStats>('/api/payments/orders/stats');
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadWithdrawals = useCallback(async () => {
    setLoadingWithdrawals(true);
    try {
      const data = await api.get<Withdrawal[]>('/api/payments/withdrawals');
      setWithdrawals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWithdrawals(false);
    }
  }, []);

  useEffect(() => {
    loadBalance();
    loadStats();
    loadWithdrawals();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const qs = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const data = await api.get<{ orders: Order[]; total: number }>(`/api/payments/orders?page=${page}&limit=20${qs}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleWithdrawalSuccess = () => {
    setShowWithdrawModal(false);
    loadBalance();
    loadWithdrawals();
  };

  const totalPages = Math.ceil(total / 20);
  const hasPendingWithdrawal = withdrawals.some(w => w.status === 'pending');

  return (
    <div className="space-y-6">

      {/* Balance card */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-teal-200 text-sm font-medium mb-1">Доступный баланс</p>
            {loadingBalance ? (
              <div className="h-10 w-40 bg-white/20 rounded-xl animate-pulse" />
            ) : (
              <p className="text-4xl font-bold tracking-tight">
                {formatRub(balance?.available ?? 0)}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {!loadingBalance && balance && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-teal-200 text-xs mb-1">Заработано</p>
              <p className="font-semibold text-sm">{formatRub(balance.earned)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-teal-200 text-xs mb-1">Выплачено</p>
              <p className="font-semibold text-sm">{formatRub(balance.paid_out)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-teal-200 text-xs mb-1">В заявках</p>
              <p className="font-semibold text-sm">{formatRub(balance.reserved)}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={loadingBalance || !balance || balance.available <= 0 || hasPendingWithdrawal}
          className="flex items-center gap-2 bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <ArrowDownToLine className="w-4 h-4" />
          {hasPendingWithdrawal ? 'Заявка на рассмотрении' : 'Вывести средства'}
        </button>

        {balance && balance.available <= 0 && !hasPendingWithdrawal && (
          <p className="text-teal-300 text-xs mt-3 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Средства появятся после подтверждения оплат
          </p>
        )}
      </div>

      {/* Withdrawal history */}
      {!loadingWithdrawals && withdrawals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Заявки на вывод</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {withdrawals.map(w => {
              const st = WITHDRAWAL_STATUS[w.status];
              const Icon = st.icon;
              return (
                <div key={w.id} className="px-6 py-4 flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${st.cls}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {st.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{formatRub(w.amount)}</p>
                    <p className="text-xs text-gray-400">{new Date(w.created_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                  {w.admin_note && (
                    <p className="text-xs text-gray-500 max-w-[200px] truncate" title={w.admin_note}>
                      {w.admin_note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      {loadingStats ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={ShoppingCart} label="Продаж" value={stats.total_sales} color="bg-teal-50 text-teal-600" />
            <StatCard icon={DollarSign} label="Ваш доход" value={formatRub(stats.total_revenue)} sub="после комиссии 10%" color="bg-green-50 text-green-600" />
            <StatCard icon={TrendingUp} label="Комиссия" value={formatRub(stats.total_fees)} color="bg-gray-50 text-gray-500" />
            <StatCard icon={BookOpen} label="Курсов продано" value={stats.courses_sold} sub={`${stats.pending_count} ожидают`} color="bg-blue-50 text-blue-600" />
          </div>

          {stats.by_course && stats.by_course.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowByCourse(p => !p)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-semibold text-gray-900">По курсам</span>
                {showByCourse ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showByCourse && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {stats.by_course.map(c => (
                    <div key={c.id} className="flex items-center gap-4 px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{c.title}</p>
                        <p className="text-xs text-gray-400">{c.sales} продаж</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatRub(c.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : null}

      {/* Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowOrdersSection(p => !p)}
          className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 text-left"
        >
          <h3 className="font-semibold text-gray-900">История платежей</h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              {(['all', 'succeeded', 'pending', 'canceled'] as OrderStatusFilter[]).map(s => (
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
            {showOrdersSection ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          </div>
        </button>

        {showOrdersSection && (
          loadingOrders ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Платежей пока нет</p>
              <p className="text-gray-300 text-xs mt-1">Включите оплату в настройках курса и поделитесь ссылкой</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-6 py-3 font-medium">Дата</th>
                      <th className="text-left px-4 py-3 font-medium">Покупатель</th>
                      <th className="text-left px-4 py-3 font-medium">Курс</th>
                      <th className="text-right px-4 py-3 font-medium">Сумма</th>
                      <th className="text-right px-4 py-3 font-medium">Ваш доход</th>
                      <th className="text-center px-4 py-3 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(o => {
                      const buyerName = [o.buyer.first_name, o.buyer.last_name].filter(Boolean).join(' ') || o.buyer.telegram_username || o.buyer.email || '—';
                      const st = STATUS_LABELS[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600' };
                      return (
                        <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                            {new Date(o.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </td>
                          <td className="px-4 py-3 text-gray-900 max-w-[140px] truncate">{buyerName}</td>
                          <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">{o.course.title}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-700 whitespace-nowrap">{formatRub(o.amount)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600 whitespace-nowrap">{formatRub(o.seller_amount)}</td>
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Страница {page} из {totalPages} ({total} записей)</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Назад
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Вперёд
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && balance && (
        <WithdrawalModal
          available={balance.available}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={handleWithdrawalSuccess}
        />
      )}
    </div>
  );
}

interface WithdrawalModalProps {
  available: number;
  onClose: () => void;
  onSuccess: () => void;
}

function WithdrawalModal({ available, onClose, onSuccess }: WithdrawalModalProps) {
  const [amount, setAmount] = useState(String(Math.floor(available / 100)));
  const [method, setMethod] = useState<'card' | 'account'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankBic, setBankBic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountKopecks = Math.round(parseFloat(amount || '0') * 100);
  const isAmountValid = amountKopecks > 0 && amountKopecks <= available;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAmountValid) return;

    setSubmitting(true);
    setError(null);
    try {
      const paymentDetails = method === 'card'
        ? { method: 'card', card_number: cardNumber, card_holder: cardHolder }
        : { method: 'account', bank_account: bankAccount, bank_bic: bankBic };

      await api.post('/api/payments/withdrawals', {
        amount: amountKopecks,
        payment_details: paymentDetails,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка при отправке заявки');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Вывод средств</h2>
            <p className="text-sm text-gray-400 mt-0.5">Доступно: <span className="font-semibold text-teal-600">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(available / 100)}</span></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Сумма вывода</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={Math.floor(available / 100)}
                step="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg font-semibold transition-all"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₽</span>
            </div>
            {!isAmountValid && amount !== '' && parseFloat(amount) > 0 && (
              <p className="text-red-500 text-xs mt-1">Превышает доступный баланс</p>
            )}
            <div className="flex gap-2 mt-2">
              {[25, 50, 100].map(pct => {
                const val = Math.floor(available * pct / 100 / 100);
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className="text-xs px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors font-medium"
                  >
                    {pct}%
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setAmount(String(Math.floor(available / 100)))}
                className="text-xs px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors font-medium"
              >
                Всё
              </button>
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Способ получения</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  method === 'card'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Карта
              </button>
              <button
                type="button"
                onClick={() => setMethod('account')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  method === 'account'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Р/С
              </button>
            </div>
          </div>

          {/* Card details */}
          {method === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Номер карты</label>
                <input
                  required
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Держатель карты</label>
                <input
                  required
                  type="text"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="IVAN PETROV"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all font-mono"
                />
              </div>
            </div>
          )}

          {/* Account details */}
          {method === 'account' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Расчётный счёт</label>
                <input
                  required
                  type="text"
                  maxLength={20}
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value.replace(/\D/g, ''))}
                  placeholder="40817810000000000000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">БИК банка</label>
                <input
                  required
                  type="text"
                  maxLength={9}
                  value={bankBic}
                  onChange={e => setBankBic(e.target.value.replace(/\D/g, ''))}
                  placeholder="044525225"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all font-mono"
                />
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-xs text-amber-700">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            Заявка обрабатывается в течение 1–3 рабочих дней. После одобрения администратором средства будут переведены на указанные реквизиты.
          </div>

          <button
            type="submit"
            disabled={submitting || !isAmountValid}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
            {submitting ? 'Отправка...' : 'Подать заявку'}
          </button>
        </form>
      </div>
    </div>
  );
}
