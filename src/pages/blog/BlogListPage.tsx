import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { blogPosts } from './blogData';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import KeyKursLogo from '../../components/KeyKursLogo';

const CATEGORY_COLORS: Record<string, string> = {
  'Руководства': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  'Аналитика': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Монетизация': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'Сравнения': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'Педагогика': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function BlogListPage() {
  useSEO({
    title: 'Блог КейКурс — советы по онлайн-обучению и Telegram-курсам',
    description: 'Полезные статьи об онлайн-обучении, создании курсов, монетизации знаний и работе с Telegram-аудиторией. Советы для экспертов и преподавателей.',
    keywords: 'блог онлайн курсы, статьи об обучении, создание курсов, telegram обучение',
    canonical: '/blog',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <KeyKursLogo size={28} />
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              Кей<span className="text-teal-600 dark:text-teal-400">Курс</span>
            </span>
          </Link>
          <Link to="/login" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
            Войти →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-semibold mb-3">
            <BookOpen size={16} />
            <span>Блог КейКурс</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            Советы по онлайн-обучению<br className="hidden sm:block" /> и Telegram-курсам
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl">
            Практические статьи для экспертов: как создавать курсы, удерживать студентов и монетизировать знания.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Clock size={12} />
                  {post.readTime} мин
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                {post.description}
              </p>
              <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-sm font-semibold">
                Читать статью <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 text-center py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-sm">© 2025 КейКурс — платформа онлайн-курсов нового поколения</p>
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <Link to="/" className="hover:text-white transition-colors">Главная</Link>
            <Link to="/blog" className="hover:text-white transition-colors">Блог</Link>
            <Link to="/login" className="hover:text-white transition-colors">Войти</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
