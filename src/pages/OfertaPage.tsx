import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KeyKursLogo from '../components/KeyKursLogo';

export default function OfertaPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Публичная оферта об оказании услуг</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Редакция от 20 апреля 2026 г.</p>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">1. Общие положения</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Настоящий документ является официальным предложением (публичной офертой) индивидуального предпринимателя
              Белова Сергея Андреевича (ОГРНИП 324120000000011, ИНН 121660921407, далее — «Исполнитель») заключить
              договор на оказание услуг дистанционного образования (доступ к онлайн-курсам) на условиях, изложенных
              ниже.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Договор считается заключённым с момента акцепта настоящей оферты Пользователем. Акцептом является
              оплата услуг в порядке, предусмотренном настоящей офертой.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Сайт: <span className="text-teal-600 dark:text-teal-400 font-medium">keykurs.ru</span>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Термины и определения</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed list-none pl-0">
              <li><span className="font-medium text-gray-800 dark:text-gray-100">Платформа</span> — сайт keykurs.ru и связанные с ним сервисы.</li>
              <li><span className="font-medium text-gray-800 dark:text-gray-100">Пользователь (Покупатель)</span> — физическое лицо, акцептовавшее настоящую оферту.</li>
              <li><span className="font-medium text-gray-800 dark:text-gray-100">Курс</span> — цифровой образовательный продукт (набор текстовых, аудио-, видеоматериалов), размещённый на Платформе.</li>
              <li><span className="font-medium text-gray-800 dark:text-gray-100">Услуга</span> — предоставление Пользователю доступа к Курсу.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Предмет договора</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Исполнитель обязуется предоставить Пользователю доступ к выбранному Курсу на Платформе, а Пользователь
              обязуется оплатить услугу в размере, указанном на странице Курса.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Доступ к Курсу предоставляется бессрочно с момента подтверждения оплаты, если иное не указано в описании
              конкретного Курса.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">4. Цена и порядок оплаты</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Цена Курса указана на странице его описания в рублях РФ, включая все применимые налоги и сборы.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Оплата производится в электронной форме через платёжный сервис ЮKassa (ООО «ЮМани»). Доступные способы
              оплаты: банковские карты Visa, Mastercard, МИР, СБП (Система быстрых платежей).
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Обязательство по оплате считается исполненным с момента поступления денежных средств на счёт Исполнителя.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">5. Права и обязанности сторон</h2>
            <p className="text-gray-600 leading-relaxed font-medium mb-2">Исполнитель обязуется:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300 mb-4">
              <li>предоставить доступ к Курсу в течение 24 часов с момента подтверждения оплаты;</li>
              <li>обеспечить техническую доступность Платформы не менее 95% времени в месяц;</li>
              <li>не передавать персональные данные Пользователя третьим лицам, кроме случаев, предусмотренных законодательством РФ.</li>
            </ul>
            <p className="text-gray-600 leading-relaxed font-medium mb-2">Пользователь обязуется:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
              <li>использовать материалы Курса исключительно для личного обучения;</li>
              <li>не копировать, не распространять и не публиковать материалы Курса без письменного согласия Исполнителя;</li>
              <li>предоставить достоверные данные при регистрации.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">6. Возврат денежных средств</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              В соответствии со ст. 26.1 Закона РФ «О защите прав потребителей» и п. 4 ст. 26 того же закона,
              услуги по предоставлению доступа к цифровому контенту надлежащего качества возврату не подлежат
              после начала исполнения договора (с момента открытия доступа к материалам Курса).
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Возврат средств возможен до начала использования Курса (до первого открытия материалов) в течение
              14 календарных дней с момента оплаты на основании письменного обращения на электронную почту
              поддержки.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              В случае технической невозможности предоставить доступ к Курсу по вине Исполнителя полная стоимость
              возвращается Пользователю в течение 10 рабочих дней.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">7. Ответственность сторон</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Исполнитель не несёт ответственности за результаты обучения Пользователя, поскольку они зависят
              от индивидуальных усилий и способностей последнего.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Совокупная ответственность Исполнителя по настоящему договору ограничена стоимостью оплаченного
              Курса.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">8. Интеллектуальная собственность</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Все материалы Курсов являются объектами интеллектуальной собственности их правообладателей.
              Любое воспроизведение, распространение или иное использование материалов без письменного разрешения
              правообладателя запрещено и влечёт ответственность в соответствии с законодательством РФ (ст. 1252
              ГК РФ).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">9. Персональные данные</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Обработка персональных данных Пользователя осуществляется в соответствии с Федеральным законом
              № 152-ФЗ «О персональных данных» и Политикой конфиденциальности, размещённой по адресу{' '}
              <a href="/privacy" className="text-teal-600 dark:text-teal-400 hover:underline">keykurs.ru/privacy</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">10. Срок действия и изменение оферты</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Настоящая оферта вступает в силу с момента размещения на Платформе и действует бессрочно.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Исполнитель вправе вносить изменения в условия оферты в одностороннем порядке. Изменения вступают
              в силу с момента их публикации на Платформе. Продолжение использования Платформы после изменений
              означает согласие Пользователя с новой редакцией.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">11. Разрешение споров</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Все споры разрешаются в досудебном порядке путём направления претензии на электронный адрес
              Исполнителя. При недостижении согласия спор передаётся в суд по месту нахождения Исполнителя
              в соответствии с законодательством Российской Федерации.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">12. Реквизиты Исполнителя</h2>
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
