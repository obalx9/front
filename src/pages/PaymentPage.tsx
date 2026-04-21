import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, BookOpen, Star, ArrowRight, X, CheckCircle2,
  Lock, Users, Loader2, ChevronRight, Play, CreditCard, Mail
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import TelegramLogin from '../components/TelegramLogin';
import OAuthButtons from '../components/OAuthButtons';
import KeyKursLogo from '../components/KeyKursLogo';

interface CoursePublic {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  seller_name: string;
  post_count: number;
}

export default function PaymentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [course, setCourse] = useState<CoursePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  const status = searchParams.get('status');
  const isSuccess = status === 'success';

  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      const data = await api.get<CoursePublic>(`/api/payments/course/${courseId}/public`, { skipAuth: true });
      setCourse(data);
    } catch (err: any) {
      setError(err.message || 'Курс не найден');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const checkEnrollment = useCallback(async () => {
    if (!user || !courseId) return;
    setCheckingEnrollment(true);
    try {
      const data = await api.get<{ enrolled: boolean }>(`/api/payments/check/${courseId}`);
      setEnrolled(data.enrolled);
    } catch {
      // ignore
    } finally {
      setCheckingEnrollment(false);
    }
  }, [user, courseId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (!authLoading && user) {
      checkEnrollment();
    }
  }, [authLoading, user, checkEnrollment]);

  const handleBuyClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!user.email) {
      setShowEmailModal(true);
      return;
    }
    initiatePayment();
  };

  const handleEmailSaved = async () => {
    await refreshUser();
    setShowEmailModal(false);
    await initiatePayment();
  };

  const initiatePayment = async () => {
    if (!courseId) return;
    setPaying(true);
    setPayError(null);
    try {
      const data = await api.post<{ payment_url: string }>('/api/payments/create', { course_id: courseId });
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (err: any) {
      setPayError(err.message || 'Ошибка при создании платежа');
    } finally {
      setPaying(false);
    }
  };

  const handleAuthSuccess = async () => {
    await refreshUser();
    setShowAuthModal(false);
    // automatically proceed to payment after login
    await initiatePayment();
  };

  const formatPrice = (kopecks: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(kopecks / 100);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Страница не найдена</h2>
          <p className="text-gray-500 dark:text-gray-400">{error || 'Курс недоступен для покупки'}</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-teal-950 dark:via-gray-900 dark:to-cyan-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10">
            <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Оплата прошла успешно!</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Вы получили доступ к курсу</p>
            <p className="text-lg font-semibold text-teal-700 dark:text-teal-400 mb-8">«{course.title}»</p>
            {user ? (
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-2xl transition-colors"
              >
                Перейти к курсу
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-2xl transition-colors"
              >
                Войти и открыть курс
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={async () => {
              await refreshUser();
              setShowAuthModal(false);
              navigate(`/course/${courseId}`);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <KeyKursLogo size={28} color="#0d9488" />
          <span className="font-bold text-teal-700 dark:text-teal-400 text-lg">КейКурс</span>
          <div className="ml-auto flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500">
            <ShieldCheck className="w-4 h-4 text-teal-500 dark:text-teal-400" />
            <span>Безопасная оплата</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-14">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Left: Course info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Thumbnail */}
            {course.thumbnail_url ? (
              <div className="rounded-2xl overflow-hidden aspect-video bg-gray-900 shadow-md">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-2xl aspect-video bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                <Play className="w-16 h-16 text-white opacity-70" />
              </div>
            )}

            {/* Title */}
            <div>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wide">
                {course.seller_name}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-4">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {course.description}
                </p>
              )}
            </div>

            {/* Course stats */}
            <div className="flex flex-wrap gap-4">
              {course.post_count > 0 && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="font-medium">{course.post_count} материалов</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <span className="font-medium">Пожизненный доступ</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-medium">Онлайн-курс</span>
              </div>
            </div>

            {/* What's included */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-lg">Что вы получите</h3>
              <ul className="space-y-3">
                {[
                  'Доступ ко всем материалам курса',
                  'Обновления курса без доплат',
                  'Просмотр в любое удобное время',
                  'Поддержка на платформе КейКурс',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 dark:text-teal-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Payment card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6 lg:sticky lg:top-20">
              {/* Price */}
              <div className="text-center pb-6 border-b border-gray-100 dark:border-gray-700 mb-6">
                <p className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {formatPrice(course.price)}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">единоразовый платеж</p>
              </div>

              {/* Enrolled */}
              {!checkingEnrollment && enrolled && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-xl px-4 py-3 text-sm font-medium mb-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    У вас уже есть доступ к этому курсу
                  </div>
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl transition-colors"
                  >
                    Перейти к курсу
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Buy button */}
              {!enrolled && (
                <>
                  {payError && (
                    <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                      {payError}
                    </div>
                  )}

                  <button
                    onClick={handleBuyClick}
                    disabled={paying || checkingEnrollment}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-lg mb-4"
                  >
                    {paying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                    {paying ? 'Подготовка...' : 'Купить курс'}
                  </button>

                  {!user && (
                    <p className="text-center text-sm text-gray-400 dark:text-gray-500 mb-4">
                      Нажимая «Купить», вы перейдёте к авторизации
                    </p>
                  )}
                </>
              )}

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-xs pt-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Оплата через ЮKassa · SSL-шифрование</span>
              </div>

              {/* YooKassa logo row */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['Visa', 'Mastercard', 'МИР', 'SBP'].map((m) => (
                    <span key={m} className="text-xs font-medium border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5 text-gray-400 dark:text-gray-400">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Legal footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Исполнитель услуг</p>
              <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">ИП Белов Сергей Андреевич</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ОГРНИП: 324120000000011</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">ИНН: 121660921407</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">keykurs.ru</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Правовые документы</p>
              <div className="space-y-1.5">
                <a
                  href="/oferta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition-colors"
                >
                  Публичная оферта
                </a>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition-colors"
                >
                  Политика конфиденциальности
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              Нажимая кнопку «Купить курс», вы подтверждаете, что ознакомились и согласны с условиями{' '}
              <a href="/oferta" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">
                публичной оферты
              </a>{' '}
              и даёте согласие на обработку персональных данных в соответствии с{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">
                Политикой конфиденциальности
              </a>{' '}
              в соответствии с Федеральным законом № 152-ФЗ «О персональных данных». Услуги оказываются
              дистанционно (ст. 26.1 Закона РФ «О защите прав потребителей»). Оплата защищена SSL-шифрованием.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          onClose={() => setShowEmailModal(false)}
          onSaved={handleEmailSaved}
        />
      )}
    </div>
  );
}

function EmailModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Введите корректный email');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.patch('/api/auth/update-email', { email: email.trim() });
      await onSaved();
    } catch (err: any) {
      setError(err.message || 'Не удалось сохранить email');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Укажите ваш email</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Email нужен для отправки чека об оплате и восстановления доступа к курсу
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="example@mail.ru"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-base"
              disabled={saving}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !email.trim()}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
            {saving ? 'Сохранение...' : 'Сохранить и оплатить'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Email используется только для отправки чека согласно 54-ФЗ
        </p>
      </div>
    </div>
  );
}

function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Войдите, чтобы купить</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">После входа вы сможете оплатить курс и получить доступ</p>
        </div>

        <div className="space-y-4">
          <TelegramLogin onSuccess={onSuccess} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500">или через другой сервис</span>
            </div>
          </div>

          <OAuthButtons onSuccess={async (_token, userId) => {
            window.location.href = `/role-select?user_id=${userId}&redirect=/pay/${window.location.pathname.split('/pay/')[1]}`;
          }} />
        </div>
      </div>
    </div>
  );
}
