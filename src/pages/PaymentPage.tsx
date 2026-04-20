import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, BookOpen, Star, ArrowRight, X, CheckCircle2,
  Lock, Users, Loader2, ChevronRight, Play, CreditCard
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
    initiatePayment();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Страница не найдена</h2>
          <p className="text-gray-500">{error || 'Курс недоступен для покупки'}</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-xl p-10">
            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Оплата прошла успешно!</h1>
            <p className="text-gray-500 mb-2">Вы получили доступ к курсу</p>
            <p className="text-lg font-semibold text-teal-700 mb-8">«{course.title}»</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <KeyKursLogo size={28} color="#0d9488" />
          <span className="font-bold text-teal-700 text-lg">КейКурс</span>
          <div className="ml-auto flex items-center gap-1 text-sm text-gray-400">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
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
              <p className="text-sm font-medium text-teal-600 mb-2 uppercase tracking-wide">
                {course.seller_name}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {course.description}
                </p>
              )}
            </div>

            {/* Course stats */}
            <div className="flex flex-wrap gap-4">
              {course.post_count > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="font-medium">{course.post_count} материалов</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <span className="font-medium">Пожизненный доступ</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-medium">Онлайн-курс</span>
              </div>
            </div>

            {/* What's included */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Что вы получите</h3>
              <ul className="space-y-3">
                {[
                  'Доступ ко всем материалам курса',
                  'Обновления курса без доплат',
                  'Просмотр в любое удобное время',
                  'Поддержка на платформе КейКурс',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Payment card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky top-20">
              {/* Price */}
              <div className="text-center pb-6 border-b border-gray-100 mb-6">
                <p className="text-5xl font-bold text-gray-900 mb-1">
                  {formatPrice(course.price)}
                </p>
                <p className="text-gray-400 text-sm">единоразовый платеж</p>
              </div>

              {/* Enrolled */}
              {!checkingEnrollment && enrolled && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 bg-teal-50 text-teal-700 rounded-xl px-4 py-3 text-sm font-medium mb-3">
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
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
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
                    <p className="text-center text-sm text-gray-400 mb-4">
                      Нажимая «Купить», вы перейдёте к авторизации
                    </p>
                  )}
                </>
              )}

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs pt-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Оплата через ЮKassa · SSL-шифрование</span>
              </div>

              {/* YooKassa logo row */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-3 text-gray-300">
                  {['Visa', 'Mastercard', 'МИР', 'SBP'].map((m) => (
                    <span key={m} className="text-xs font-medium border border-gray-200 rounded px-2 py-0.5 text-gray-400">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Войдите, чтобы купить</h2>
          <p className="text-gray-500 text-sm">После входа вы сможете оплатить курс и получить доступ</p>
        </div>

        <div className="space-y-4">
          <TelegramLogin onSuccess={onSuccess} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400">или через другой сервис</span>
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
