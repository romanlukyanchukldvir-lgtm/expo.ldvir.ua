import Image from "next/image";
import { ActionButtons } from "@/components/ActionButtons";
import { LeadForm } from "@/components/LeadForm";

const brands = [
  { name: "DeWalt", logo: "/brands/dewalt.svg" },
  { name: "Milwaukee", logo: "/brands/milwaukee.svg" },
  { name: "Makita", logo: "/brands/makita.svg" },
  { name: "Metabo", logo: "/brands/metabo.svg" },
  { name: "Maruyama", logo: "/brands/maruyama.png" },
  { name: "DISTAR", logo: "/brands/distar.svg" },
  { name: "Paton", logo: "/brands/paton.svg" },
  { name: "GTM", logo: "/brands/gtm.svg" },
];

const partners = [
  ["West Fireplace", "каміни та мангали"],
  ["БудШок", "Sika, будівельні суміші"],
  ["Bologiv", "професійна обробка каменю"],
  ["Подільський камінь", "натуральний камінь"],
];

const benefits = [
  ["Тестуй", "Подивіться інструмент наживо та оцініть його в роботі."],
  ["Порівнюй", "Порівняйте бренди, моделі та рішення під свої задачі."],
  ["Обирай", "Отримайте консультацію та підберіть інструмент для роботи."],
  [
    "Додаткові експозиції",
    "Каміни, мангали, будівельні суміші, натуральний камінь та професійна обробка каменю.",
  ],
];

const audienceCards = [
  {
    title: "Майстри",
    text: "Порівняйте інструмент для щоденної роботи та підберіть рішення під свої задачі.",
  },
  {
    title: "Будівельники",
    text: "Оцініть інструмент, витратні матеріали та будівельні рішення в одному місці.",
  },
  {
    title: "Монтажники",
    text: "Протестуйте інструмент для монтажу, кріплення, свердління, різання та виїзних робіт.",
  },
  {
    title: "Зварювальники",
    text: "Подивіться рішення для зварювання, підготовки металу та професійної роботи.",
  },
  {
    title: "Прораби",
    text: "Порівняйте бренди для команди та знайдіть рішення для обʼєктів.",
  },
  {
    title: "Власники бригад",
    text: "Підберіть інструмент, який витримує навантаження і працює на результат.",
  },
  {
    title: "Сервісні центри",
    text: "Оцініть інструмент для ремонту, обслуговування техніки та щоденної сервісної роботи.",
  },
  {
    title: "Автосервіси та СТО",
    text: "Підберіть інструмент для ремонту авто, монтажу, демонтажу, шліфування та сервісних задач.",
  },
  {
    title: "Фермерські господарства",
    text: "Знайдіть інструмент і техніку для ремонту, обслуговування господарства, техніки, майстерень і сезонних робіт.",
  },
  {
    title: "Виробництва",
    text: "Порівняйте професійні рішення для цехів, майстерень, складання, ремонту та обслуговування обладнання.",
  },
  {
    title: "Комунальні підприємства",
    text: "Оцініть інструмент для ремонтних бригад, обслуговування територій, техніки та інфраструктури.",
  },
  {
    title: "Електрики",
    text: "Підберіть інструмент для монтажу, свердління, різання, кріплення та щоденних електромонтажних робіт.",
  },
  {
    title: "Сантехніки",
    text: "Подивіться рішення для монтажу, ремонту, різання, свердління та обслуговування систем.",
  },
  {
    title: "Меблярі та столяри",
    text: "Порівняйте інструмент для точного різання, шліфування, свердління та роботи з деревом.",
  },
  {
    title: "Ландшафтники та садові служби",
    text: "Оцініть інструмент і техніку для догляду за територіями, садом, подвірʼями та обʼєктами.",
  },
  {
    title: "Домашні майстри",
    text: "Побачте якісний інструмент наживо та оберіть те, що справді потрібно для дому, ремонту чи майстерні.",
  },
];

const eventHighlights = [
  ["Дата", "15 липня, середа"],
  ["Місто", "Хмельницький"],
  ["Брендів", "8 інструментальних"],
  ["Формат", "тест і демонстрації"],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="header-logo" href="#top" aria-label="LDVIR.UA">
          <Image src="/logo-ldvir.png" alt="LDVIR.UA" width={1374} height={430} priority />
        </a>
        <nav className="header-nav" aria-label="Навігація">
          <a href="#brands">Бренди</a>
          <a href="#program">Що буде</a>
          <a href="#location">Локація</a>
          <a href="#registration">Зареєструватися</a>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="hero-logo">
            <Image src="/logo-ldvir.png" alt="LDVIR.UA" width={1374} height={430} priority />
          </div>
          <p className="event-pill">15 липня 2026 • Хмельницький</p>
          <h1>ВИСТАВКА ІНСТРУМЕНТІВ</h1>
          <p className="hero-subtitle">Тестуй. Порівнюй. Обирай краще.</p>
          <div
            className="hero-brand-marquee"
            aria-label={`Бренди на виставці: ${brands.map((brand) => brand.name).join(", ")}`}
          >
            <div className="hero-brand-track">
              <div className="hero-brand-set">
                {brands.map((brand) => (
                  <span className="hero-brand-logo-card" key={brand.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brand.logo} alt={brand.name} />
                  </span>
                ))}
              </div>
              <div className="hero-brand-set" aria-hidden="true">
                {brands.map((brand) => (
                  <span className="hero-brand-logo-card" key={`repeat-${brand.name}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brand.logo} alt="" />
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="hero-copy">
            Інструмент, демонстрації, будівельні рішення, камінь, каміни та мангали — все на одній
            локації біля LDVIR.UA.
          </p>
          <div className="hero-facts" aria-label="Дата та адреса події">
            <span>15 липня 2026, середа</span>
            <span>м. Хмельницький, вул. Вінницька 1/9</span>
          </div>
          <ActionButtons showForm showMaps variant="hero" />
          <p className="cta-note">Бот нагадає про виставку перед подією.</p>
          <p className="call-note">Маєте питання? Зателефонуйте менеджеру.</p>
        </div>
      </section>

      <section className="event-strip" aria-label="Ключова інформація про подію">
        <div className="container event-strip-grid">
          {eventHighlights.map(([label, value]) => (
            <div className="event-strip-item" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section id="brands" className="section section-raised">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Інструмент</p>
            <h2>Бренди на виставці</h2>
            <p>На одній локації — інструмент і рішення для професійної роботи.</p>
          </div>
          <div className="brand-grid">
            {brands.map((brand) => (
              <div className="brand-badge" key={brand.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="brand-logo" src={brand.logo} alt={brand.name} loading="lazy" />
                <span>{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Партнери</p>
            <h2>Також на виставці</h2>
            <p>
              Окрім інструменту, на події будуть представлені рішення для будівництва, ремонту,
              каменю та зони відпочинку.
            </p>
          </div>
          <div className="partner-grid">
            {partners.map(([name, category]) => (
              <article className="partner-card" key={name}>
                <div className="partner-logo">{name}</div>
                <p>{category}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="program" className="section section-raised">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Програма</p>
            <h2>Що буде на виставці</h2>
          </div>
          <div className="benefit-grid">
            {benefits.map(([title, text]) => (
              <article className="benefit-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section audience-section">
        <div className="container audience-layout">
          <div className="audience-copy">
            <div>
              <p className="eyebrow">КОМУ БУДЕ КОРИСНО</p>
              <h2>Для кого ця подія</h2>
            </div>
            <div className="audience-copy-text">
              <p className="audience-subtitle">
                Якщо ви працюєте з інструментом, технікою, будівництвом, монтажем, ремонтом або
                обслуговуванням — ця виставка допоможе протестувати рішення наживо, порівняти
                бренди та вибрати інструмент під свої задачі.
              </p>
              <p>
                Це подія для тих, хто купує інструмент не просто “щоб був”, а для роботи,
                результату і щоденного навантаження.
              </p>
            </div>
          </div>
          <div className="audience-card-grid">
            {audienceCards.map((item) => (
              <article className="audience-card" key={item.title}>
                <span className="audience-card-mark" aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="audience-footer">
            <p className="audience-accent">
              Неважливо, ви працюєте самі, керуєте бригадою, маєте сервіс, фермерське господарство
              чи виробництво — на виставці можна буде побачити інструмент наживо, порівняти рішення
              та поставити питання представникам брендів.
            </p>
            <div className="audience-cta">
              <p>
                Хочете зрозуміти, які рішення підійдуть саме вам? Зареєструйтесь і приходьте на
                виставку.
              </p>
              <ActionButtons showForm={false} variant="audience" />
            </div>
          </div>
        </div>
      </section>

      <section id="registration" className="section section-registration">
        <div className="container registration-layout">
          <div className="registration-main">
            <p className="eyebrow">Реєстрація</p>
            <h2>Зареєструйтесь на виставку</h2>
            <p>
              Найзручніше — зареєструватися через Telegram. Бот нагадає про виставку перед подією.
            </p>
            <ActionButtons showForm={false} variant="registration" />
            <p className="call-note">Маєте питання? Зателефонуйте менеджеру.</p>
          </div>
          <div id="registration-form" className="form-panel">
            <h3>Резервна реєстрація</h3>
            <p>
              Не маєте Telegram або зручніше залишити номер? Заповніть форму — менеджер зареєструє
              вас.
            </p>
            <LeadForm />
          </div>
        </div>
      </section>

      <section id="location" className="section">
        <div className="container location-layout">
          <div className="section-heading">
            <p className="eyebrow">Локація</p>
            <h2>LDVIR.UA</h2>
            <p>м. Хмельницький, вул. Вінницька 1/9</p>
          </div>
          <ActionButtons onlyMaps variant="location" />
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta-inner">
          <div>
            <p className="eyebrow">15 липня</p>
            <h2>15 липня зустрічаємось у LDVIR.UA</h2>
            <p>
              Виставка інструментів у Хмельницькому. Тестуйте, порівнюйте та обирайте інструмент
              під свою роботу.
            </p>
          </div>
          <ActionButtons showForm variant="final" />
        </div>
      </section>
    </main>
  );
}
