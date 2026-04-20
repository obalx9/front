import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KeyKursLogo from '../components/KeyKursLogo';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <KeyKursLogo size={24} color="#0d9488" />
          <span className="font-bold text-teal-700 dark:text-teal-400">КейКурс</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 md:p-12 max-w-none">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Политика конфиденциальности</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Редакция от 20 апреля 2026 г.</p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">1. Общие положения</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Настоящая Политика конфиденциальности определяет порядок обработки персональных данных
              индивидуальным предпринимателем Беловым Сергеем Андреевичем (ОГРНИП 324120000000011, ИНН 121660921407,
              далее — «Оператор») в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
              «О персональных данных».
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Используя платформу keykurs.ru, вы соглашаетесь с условиями настоящей Политики.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Состав обрабатываемых персональных данных</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">Оператор может обрабатывать следующие персональные данные:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Фамилия, имя, отчество;</li>
              <li>Адрес электронной почты;</li>
              <li>Номер телефона (при наличии);</li>
              <li>Идентификаторы в социальных сетях и мессенджерах (Telegram, ВКонтакте, Яндекс ID);</li>
              <li>Данные об оплате (обрабатываются платёжным сервисом ЮKassa, Оператор не получает реквизиты карты);</li>
              <li>Данные об использовании Платформы (история просмотров, действия в личном кабинете);</li>
              <li>Технические данные: IP-адрес, тип браузера, cookie-файлы.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Цели обработки персональных данных</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Идентификация пользователя и предоставление доступа к Платформе;</li>
              <li>Исполнение договора об оказании услуг (публичной оферты);</li>
              <li>Обработка платежей и ведение финансовой отчётности;</li>
              <li>Техническая поддержка пользователей;</li>
              <li>Направление уведомлений, связанных с использованием Платформы;</li>
              <li>Улучшение качества услуг и функциональности Платформы;</li>
              <li>Соблюдение требований законодательства РФ.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">4. Правовые основания обработки</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">Обработка персональных данных осуществляется на следующих основаниях:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Согласие субъекта персональных данных (ст. 6, ч. 1, п. 1 № 152-ФЗ);</li>
              <li>Исполнение договора, стороной которого является субъект персональных данных (ст. 6, ч. 1, п. 5 № 152-ФЗ);</li>
              <li>Выполнение требований законодательства РФ.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">5. Передача персональных данных третьим лицам</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Оператор не продаёт и не передаёт персональные данные третьим лицам в маркетинговых целях.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">Передача данных допускается в следующих случаях:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Платёжный сервис ЮKassa — для обработки платежей;</li>
              <li>Сервисы авторизации (Telegram, ВКонтакте, Яндекс) — для идентификации пользователя;</li>
              <li>По требованию уполномоченных органов государственной власти РФ.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">6. Хранение и защита данных</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Персональные данные хранятся на серверах, расположенных на территории Российской Федерации
              (требование ст. 18 № 152-ФЗ).
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Оператор применяет организационные и технические меры защиты персональных данных: шифрование
              передачи данных (SSL/TLS), контроль доступа, регулярный аудит безопасности.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Срок хранения персональных данных — в течение срока действия договора и 5 лет после его
              прекращения (в целях бухгалтерского и налогового учёта).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">7. Права субъекта персональных данных</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">Вы вправе:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>получить информацию об обработке ваших персональных данных;</li>
              <li>потребовать уточнения, блокирования или уничтожения персональных данных при наличии оснований;</li>
              <li>отозвать согласие на обработку персональных данных;</li>
              <li>обжаловать действия Оператора в Роскомнадзор.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
              Для реализации своих прав направьте обращение на электронную почту, указанную в разделе «Контакты».
              Срок рассмотрения — 30 дней.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">8. Использование cookie-файлов</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Платформа использует cookie-файлы для обеспечения работоспособности сервисов, авторизации
              пользователей и сбора аналитики. Вы можете отключить cookie в настройках браузера, однако
              это может повлиять на функциональность Платформы.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">9. Изменение Политики</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Оператор вправе вносить изменения в настоящую Политику. Актуальная редакция всегда доступна
              по адресу keykurs.ru/privacy. Продолжение использования Платформы после публикации изменений
              означает ваше согласие с новой редакцией.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">10. Контакты оператора</h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 text-gray-600 dark:text-gray-300 space-y-1">
              <p><span className="font-medium text-gray-800 dark:text-gray-100">Наименование:</span> ИП Белов Сергей Андреевич</p>
              <p><span className="font-medium text-gray-800 dark:text-gray-100">ОГРНИП:</span> 324120000000011</p>
              <p><span className="font-medium text-gray-800 dark:text-gray-100">ИНН:</span> 121660921407</p>
              <p><span className="font-medium text-gray-800 dark:text-gray-100">Сайт:</span> keykurs.ru</p>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
