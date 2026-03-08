import { useParams, Link, Navigate } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import { blogPosts, BlogSection } from './blogData';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import KeyKursLogo from '../../components/KeyKursLogo';

function renderSection(section: BlogSection, index: number) {
  switch (section.type) {
    case 'h2':
      return <h2 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-3">{section.text}</h2>;
    case 'h3':
      return <h3 key={index} className="text-lg font-bold text-gray-800 mt-5 mb-2">{section.text}</h3>;
    case 'p':
      return <p key={index} className="text-gray-600 leading-relaxed mb-4">{section.text}</p>;
    case 'ul':
      return (
        <ul key={index} className="mb-4 space-y-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-600">
              <CheckCircle size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={index} className="mb-4 space-y-2 list-none">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div key={index} className="bg-teal-50 border-l-4 border-teal-400 rounded-r-xl p-4 mb-4 flex gap-3">
          <Lightbulb size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
          <p className="text-teal-800 text-sm leading-relaxed">{section.text}</p>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  useSEO({
    title: post?.title ?? 'Статья',
    description: post?.description,
    keywords: post?.keywords,
    canonical: `/blog/${slug}`,
  });

  if (!post) return <Navigate to="/blog" replace />;

  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  const CATEGORY_COLORS: Record<string, string> = {
    'Руководства': 'bg-teal-100 text-teal-800',
    'Аналитика': 'bg-blue-100 text-blue-800',
    'Монетизация': 'bg-green-100 text-green-800',
    'Сравнения': 'bg-orange-100 text-orange-800',
    'Педагогика': 'bg-rose-100 text-rose-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <KeyKursLogo size={28} />
            <span className="font-bold text-lg text-gray-900">
              Кей<span className="text-teal-600">Курс</span>
            </span>
          </Link>
          <Link to="/login" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            Войти →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors mb-6">
          <ArrowLeft size={14} />
          Все статьи
        </Link>

        <article>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-700'}`}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              {post.readTime} мин чтения
            </span>
            <time dateTime={post.publishedAt} className="text-xs text-gray-400">
              {new Date(post.publishedAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          <div className="prose-custom">
            {post.content.map((section, i) => renderSection(section, i))}
          </div>
        </article>

        <div className="mt-12 p-6 bg-teal-600 rounded-2xl text-white text-center">
          <h3 className="text-lg font-bold mb-2">Готовы запустить свой курс?</h3>
          <p className="text-teal-100 text-sm mb-4">Первый курс бесплатно. Настройка занимает 5 минут.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors"
          >
            Начать бесплатно <ArrowRight size={14} />
          </Link>
        </div>

        {(prevPost || nextPost) && (
          <nav className="mt-8 grid grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                to={`/blog/${prevPost.slug}`}
                className="group col-span-1 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
                  <ArrowLeft size={12} />
                  Предыдущая
                </div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-2">
                  {prevPost.title}
                </p>
              </Link>
            ) : <div />}
            {nextPost ? (
              <Link
                to={`/blog/${nextPost.slug}`}
                className="group col-span-1 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-right"
              >
                <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mb-1.5">
                  Следующая
                  <ArrowRight size={12} />
                </div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-2">
                  {nextPost.title}
                </p>
              </Link>
            ) : <div />}
          </nav>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 text-center py-8 mt-16">
        <div className="max-w-3xl mx-auto px-4">
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
