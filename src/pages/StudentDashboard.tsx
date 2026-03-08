import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../lib/api';
import { BookOpen, LogOut, Store, Copy, Check, User, Eye, EyeOff } from 'lucide-react';
import KeyKursLogo from '../components/KeyKursLogo';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';

interface EnrolledCourse {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
  };
}

function StudentIdCard({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const truncated = id.length > 12
    ? `${id.slice(0, 6)}...${id.slice(-4)}`
    : id;

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">ID ученика</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
            Сообщите этот идентификатор автору курса, чтобы он мог предоставить вам доступ к материалам.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 text-sm font-mono font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 truncate select-all">
              {revealed ? id : truncated}
            </code>
            <button
              onClick={() => setRevealed(!revealed)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              title={revealed ? 'Скрыть' : 'Показать полностью'}
            >
              {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                copied
                  ? 'text-teal-500 bg-teal-50 dark:bg-teal-900/30'
                  : 'text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'
              }`}
              title="Скопировать ID"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ user, onSignOut, onSellerMode }: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  onSignOut: () => void;
  onSellerMode?: () => void;
}) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeyKursLogo size={36} color="#0d9488" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight hidden sm:block">{user.first_name || user.telegram_username || user.email}</h1>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">{user.first_name || user.telegram_username || user.email}</p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <LanguageSelector />
            {onSellerMode && (
              <button
                onClick={onSellerMode}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors border border-teal-200 dark:border-teal-700"
                title="Перейти в режим продавца"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Режим продавца</span>
              </button>
            )}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      loadCourses();
    }
  }, [user, loading, navigate]);

  const loadCourses = async () => {
    try {
      const data = await api.getStudentEnrollments();
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader
          user={user!}
          onSignOut={handleSignOut}
          onSellerMode={user?.roles.includes('seller') ? () => navigate('/seller/dashboard') : undefined}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 pb-4 sm:pt-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('myCourses')}</h1>
          </div>

          {user!.user_id && (
            <div className="mb-6">
              <StudentIdCard id={user!.user_id} />
            </div>
          )}

          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('noCourses')}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('browseCoursesDesc')}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        user={user!}
        onSignOut={handleSignOut}
        onSellerMode={user?.roles.includes('seller') ? () => navigate('/seller/dashboard') : undefined}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-6 pb-4 sm:pt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('myCourses')}</h1>
        </div>

        {user!.user_id && (
          <div className="mb-6">
            <StudentIdCard id={user!.user_id} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-8">
          {courses.filter((enrollment) => enrollment.course).map((enrollment) => (
            <button
              key={enrollment.id}
              onClick={() => navigate(`/course/${enrollment.course.id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-lg transition-all text-left group"
            >
              {enrollment.course.thumbnail_url ? (
                <div className="w-full h-44 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={enrollment.course.thumbnail_url}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-full h-44 sm:h-48 bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white opacity-80" />
                </div>
              )}
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 line-clamp-2">
                  {enrollment.course.title}
                </h3>
                {enrollment.course.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3">
                    {enrollment.course.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
