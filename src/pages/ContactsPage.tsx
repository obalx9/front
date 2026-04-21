import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import KeyKursLogo from '../components/KeyKursLogo';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';
import {
  Mail,
  Send,
  Globe,
  Phone,
  MapPin,
  MessageCircle,
  ExternalLink,
  ArrowRight,
  LayoutDashboard,
  LogIn,
} from 'lucide-react';

interface SiteContact {
  id: string;
  label: string;
  value: string;
  icon: string;
  url: string | null;
  order_index: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Mail,
  Send,
  Globe,
  Phone,
  MapPin,
  MessageCircle,
};

function ContactIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Mail;
  return <Icon className={className} />;
}

const ICON_COLORS: Record<string, string> = {
  Mail: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Send: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
  Globe: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  Phone: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  MapPin: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  MessageCircle: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
};

export default function ContactsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<SiteContact[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await api.getSiteContacts();
      if (data) setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <KeyKursLogo className="w-10 h-10" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">KeyKurs</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                {t('footerAbout')}
              </Link>
              <Link to="/#courses" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                {t('footerCourses')}
              </Link>
              <span className="text-teal-600 dark:text-teal-400 font-medium">
                {t('footerContact')}
              </span>
            </nav>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
              {user ? (
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('studentDashboard')}</span>
                </Link>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <LogIn className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('signIn')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-cyan-600/10 dark:from-teal-600/20 dark:to-cyan-600/20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-2xl mb-6">
                <Mail className="w-10 h-10 text-teal-600 dark:text-teal-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t('footerContact')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Свяжитесь с нами — мы всегда готовы помочь вам
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {contacts.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                Контактная информация пока не добавлена
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contacts.map((contact, index) => {
                  const colorClass = ICON_COLORS[contact.icon] || ICON_COLORS.Mail;
                  const content = (
                    <div
                      key={contact.id}
                      className={`
                        group bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6
                        border border-gray-100 dark:border-gray-700
                        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                      `}
                      style={{ transitionDelay: `${index * 80}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <ContactIcon name={contact.icon} className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {contact.label}
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {contact.value}
                          </p>
                        </div>
                        {contact.url && (
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  );

                  if (contact.url) {
                    return (
                      <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" className="block">
                        {content}
                      </a>
                    );
                  }
                  return content;
                })}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-700 dark:to-cyan-700">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Готовы начать обучение?
            </h2>
            <p className="text-teal-100 text-lg mb-8">
              Присоединяйтесь к тысячам студентов на платформе KeyKurs
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg font-semibold flex items-center justify-center gap-2"
              >
                <span>Войти в платформу</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register-seller"
                className="px-8 py-4 bg-teal-700 text-white border-2 border-white rounded-lg hover:bg-teal-800 transition-all transform hover:scale-105 font-semibold"
              >
                Стать продавцом
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
