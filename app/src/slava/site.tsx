import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { services, projects, steps, phone, type Service } from "./content";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-7-7 7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function Close() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function ContactIcon({ kind }: { kind: string }) {
  const paths: Record<string, ReactNode> = {
    phone: <path d="M7 3 4 5c-2 5 6 13 11 15l4-3-4-4-3 2c-3-1-5-3-5-6l2-2-2-4Z" />,
    email: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    telegram: (
      <>
        <path d="m3 11 18-7-4 17-6-5-4 3 1-7 10-6-7 10" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M20 11a8 8 0 0 1-12 7l-5 2 1-5A8 8 0 1 1 20 11Z" />
        <path d="m9 7-2 1c0 4 3 7 7 8l2-2-3-2-1 1c-2-1-3-2-3-3l1-1-1-2Z" />
      </>
    ),
    viber: (
      <>
        <path d="M5 3h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8l-5 3v-3H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="m8 7-1 1c0 4 2 6 6 7l2-2-2-2-1 1-2-2 1-1-3-2ZM13 6c3 0 5 2 5 5m-5-2c1 0 2 1 2 2" />
      </>
    ),
  };
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {paths[kind]}
    </svg>
  );
}
const ContactContext = createContext<(service?: string) => void>(() => {});
export function ConsultationButton({
  className = "",
  children = "Записатися на консультацію",
  service,
}: {
  className?: string;
  children?: ReactNode;
  service?: string;
}) {
  const open = useContext(ContactContext);
  return (
    <button
      className={className}
      aria-label={className === "header-consult" ? "Записатися на консультацію" : undefined}
      onClick={() => open(service)}
    >
      {children}
      <Arrow diagonal />
    </button>
  );
}
export function Photo({
  name,
  alt,
  className = "",
  priority = false,
}: {
  name: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      className={className}
      src={"/assets/" + name + ".webp"}
      srcSet={`/assets/${name}-640.webp 640w, /assets/${name}-1200.webp 1200w, /assets/${name}.webp 1920w`}
      sizes={className === "full" || priority ? "100vw" : "(max-width: 600px) 100vw, 60vw"}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      width="1920"
      height="1080"
    />
  );
}
function Brand() {
  return (
    <a href="/" className="brand" aria-label="БК Слава, головна">
      <img src="/assets/logo.jpg" alt="Логотип ТОВ БК Слава" width="52" height="52" />
      <span>
        БК СЛАВА<small>БУДУЄМО З 2006 РОКУ</small>
      </span>
    </a>
  );
}
function ContactMethods({ large = false }: { large?: boolean }) {
  const [tg, setTg] = useState(false);
  return (
    <>
      <div className={"contact-methods " + (large ? "large" : "")}>
        <a aria-label="Телефон" href="tel:+380676090075">
          <ContactIcon kind="phone" />
          <span>Телефон</span>
          <Arrow diagonal />
        </a>
        <a
          aria-label="WhatsApp"
          href="https://wa.me/380676090075"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ContactIcon kind="whatsapp" />
          <span>WhatsApp</span>
          <Arrow diagonal />
        </a>
        <a aria-label="Viber" href="viber://chat?number=%2B380676090075">
          <ContactIcon kind="viber" />
          <span>Viber</span>
          <Arrow diagonal />
        </a>
        <button aria-label="Telegram" onClick={() => setTg(true)}>
          <ContactIcon kind="telegram" />
          <span>Telegram</span>
          <Arrow diagonal />
        </button>
        <a aria-label="Email" href="mailto:m98720141@gmail.com">
          <ContactIcon kind="email" />
          <span>Email</span>
          <Arrow diagonal />
        </a>
      </div>
      <Dialog.Root open={tg} onOpenChange={setTg}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="notice-dialog">
            <Dialog.Close className="close-control" aria-label="Закрити">
              <Close />
            </Dialog.Close>
            <ContactIcon kind="telegram" />
            <Dialog.Title>Зв’язок у Telegram</Dialog.Title>
            <Dialog.Description>
              Контакт компанії в Telegram ще уточнюється. Зараз зручно обговорити ваш об’єкт
              телефоном або у WhatsApp.
            </Dialog.Description>
            <a className="notice-phone" href="tel:+380676090075">
              {phone}
            </a>
            <a
              className="text-link"
              href="https://wa.me/380676090075"
              target="_blank"
              rel="noopener noreferrer"
            >
              Написати у WhatsApp <Arrow diagonal />
            </a>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
function Consultation({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service: string;
}) {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    place: "",
    service: "",
    message: "",
    consent: false,
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (open) {
      setValues((v) => ({ ...v, service }));
      setSaved(false);
      setError("");
    }
  }, [open, service]);
  function submit(e: FormEvent) {
    e.preventDefault();
    const digits = values.phone.replace(/\D/g, "");
    if (!values.name.trim()) {
      setError("Вкажіть, будь ласка, ваше ім’я.");
      return;
    }
    if (!/^(380\d{9}|0\d{9})$/.test(digits)) {
      setError("Вкажіть український номер: +380 та 9 цифр або 0 та 9 цифр.");
      return;
    }
    if (!values.consent) {
      setError("Підтвердьте згоду на обробку контактних даних.");
      return;
    }
    try {
      sessionStorage.setItem("slava-consultation", JSON.stringify(values));
    } catch {}
    setError("");
    setSaved(true);
  }
  const emailBody = `Консультація БК Слава\nІм’я: ${values.name}\nТелефон: ${values.phone}\nОб’єкт: ${values.place}\nПослуга: ${values.service}\n${values.message}`;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="consult-panel">
          <Dialog.Close className="close-control" aria-label="Закрити форму">
            <Close />
          </Dialog.Close>
          <div className="panel-topline">БК СЛАВА / КОНСУЛЬТАЦІЯ</div>
          <Dialog.Title>
            Ваш простір.
            <br />
            Наш наступний крок.
          </Dialog.Title>
          <Dialog.Description>
            Розкажіть про об’єкт. Підготуємо звернення, щоб вам було зручно обговорити деталі.
          </Dialog.Description>
          {saved ? (
            <div className="form-complete" role="status">
              <span className="complete-mark">✓</span>
              <h3>Звернення підготовлено</h3>
              <p>
                Дані збережено лише у цьому браузері на час сесії. Автоматичне надсилання ще не
                підключене.
              </p>
              <a
                className="email-draft"
                href={
                  "mailto:m98720141@gmail.com?subject=" +
                  encodeURIComponent("Консультація БК Слава") +
                  "&body=" +
                  encodeURIComponent(emailBody)
                }
              >
                Надіслати через пошту <Arrow diagonal />
              </a>
              <a href="tel:+380676090075" className="notice-phone">
                {phone}
              </a>
              <button className="text-link" onClick={() => setSaved(false)}>
                Повернутися до форми
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="form-grid">
                <label>
                  Ваше ім’я *
                  <input
                    autoComplete="given-name"
                    name="name"
                    value={values.name}
                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                    placeholder="Як до вас звертатися"
                    required
                    maxLength={80}
                  />
                </label>
                <label>
                  Телефон *
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    name="phone"
                    value={values.phone}
                    onChange={(e) => setValues({ ...values, phone: e.target.value })}
                    placeholder="+380 __ ___ __ __"
                    required
                    maxLength={25}
                  />
                </label>
              </div>
              <label>
                Де знаходиться об’єкт?
                <input
                  name="place"
                  autoComplete="address-level2"
                  value={values.place}
                  onChange={(e) => setValues({ ...values, place: e.target.value })}
                  placeholder="Київ або населений пункт області"
                  maxLength={120}
                />
              </label>
              <label>
                Що плануєте зробити?
                <select
                  name="service"
                  value={values.service}
                  onChange={(e) => setValues({ ...values, service: e.target.value })}
                >
                  <option value="">Обрати напрямок</option>
                  {services.map((s) => (
                    <option key={s.slug}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Кілька слів про завдання
                <textarea
                  name="message"
                  value={values.message}
                  onChange={(e) => setValues({ ...values, message: e.target.value })}
                  placeholder="Тип приміщення, стан і бажаний результат"
                  rows={3}
                  maxLength={2000}
                />
              </label>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => setValues({ ...values, consent: e.target.checked })}
                />
                <span>
                  Погоджуюсь на обробку даних згідно з{" "}
                  <a href="/pryvatnist" target="_blank" rel="noopener noreferrer">
                    політикою приватності
                  </a>
                  .
                </span>
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="form-submit">
                Підготувати звернення <Arrow diagonal />
              </button>
              <p className="form-note">
                Або зв’яжіться напряму: <a href="tel:+380676090075">{phone}</a>
              </p>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState("");
  const [menu, setMenu] = useState(false);
  const links = [
    ["/poslugy", "Послуги"],
    ["/portfolio", "Наші роботи"],
    ["/pro-kompaniyu", "Про компанію"],
    ["/kontakty", "Контакти"],
  ];
  return (
    <ContactContext.Provider
      value={(s) => {
        setService(s || "");
        setMenu(false);
        setOpen(true);
      }}
    >
      <a className="skip-link" href="#main">
        Перейти до вмісту
      </a>
      <header className="site-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Основна навігація">
          {links.map(([url, title]) => (
            <a key={url} href={url}>
              {title}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href="tel:+380676090075">
            {phone}
          </a>
          <ConsultationButton className="header-consult">
            <span>Консультація</span>
          </ConsultationButton>
          <button className="menu-toggle" onClick={() => setMenu(true)} aria-label="Відкрити меню">
            <span />
            <span />
          </button>
        </div>
      </header>
      <Dialog.Root open={menu} onOpenChange={setMenu}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="mobile-menu">
            <Dialog.Close className="close-control" aria-label="Закрити меню">
              <Close />
            </Dialog.Close>
            <Dialog.Title>БК Слава</Dialog.Title>
            <Dialog.Description>Будівельні та ремонтні роботи з 2006 року.</Dialog.Description>
            <nav aria-label="Мобільна навігація">
              <a href="/">
                Головна <Arrow diagonal />
              </a>
              {links.map(([url, title]) => (
                <a key={url} href={url}>
                  {title}
                  <Arrow diagonal />
                </a>
              ))}
            </nav>
            <ConsultationButton className="menu-consult" />
            <a href="tel:+380676090075">{phone}</a>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="footer-main">
          <Brand />
          <p>
            Продумані рішення.
            <br />
            Акуратне виконання.
            <br />
            Київ та Київська область.
          </p>
          <div className="footer-links">
            <a href="/poslugy">Послуги</a>
            <a href="/portfolio">Наші роботи</a>
            <a href="/pro-kompaniyu">Про компанію</a>
            <a href="/kontakty">Контакти</a>
          </div>
          <div className="footer-contacts">
            <a href="tel:+380676090075">{phone}</a>
            <a href="mailto:m98720141@gmail.com">m98720141@gmail.com</a>
            <ContactMethods />
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ТОВ БК Слава</span>
          <span>Працюємо з 2006 року</span>
          <a href="/pryvatnist">Приватність</a>
        </div>
      </footer>
      <Consultation open={open} onOpenChange={setOpen} service={service} />
    </ContactContext.Provider>
  );
}
function Intro() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [progress, setProgress] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    try {
      if (
        !sessionStorage.getItem("slava-intro-seen") &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setMobile(matchMedia("(max-width: 700px)").matches);
        setVisible(true);
        sessionStorage.setItem("slava-intro-seen", "1");
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (!visible || !ready) return;
    const timer = setTimeout(() => setVisible(false), 48000);
    return () => clearTimeout(timer);
  }, [visible, ready]);
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", key);
    };
  }, [visible]);
  if (!visible) return null;
  return (
    <Dialog.Root open={visible} onOpenChange={setVisible}>
      <Dialog.Portal>
        <Dialog.Content className="intro" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">Вступне відео БК Слава</Dialog.Title>
          <video
            ref={video}
            className={ready ? "ready" : ""}
            autoPlay
            muted
            playsInline
            preload="auto"
            src={mobile ? "/assets/intro-mobile.mp4" : "/assets/intro.mp4"}
            poster="/assets/intro-poster.jpg"
            onCanPlay={() => setReady(true)}
            onEnded={() => setVisible(false)}
            onError={(e) => {
              if (e.currentTarget.error) setVisible(false);
            }}
            onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / 46)}
          ></video>
          <div className="intro-caption">
            <span>ТОВ БК СЛАВА</span>
            <span>АРХІТЕКТУРА ТОЧНОСТІ / З 2006 РОКУ</span>
          </div>
          <button className="intro-skip" autoFocus onClick={() => setVisible(false)}>
            Перейти на сайт <Arrow />
          </button>
          <div className="intro-progress" style={{ transform: `scaleX(${progress})` }} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Home() {
  return (
    <>
      <Intro />
      <section className="home-hero">
        <Photo
          name="hero"
          alt="Світла вітальня з природними матеріалами та зеленою кухнею"
          priority
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="hero-kicker">БУДІВЕЛЬНА КОМПАНІЯ • КИЇВ ТА ОБЛАСТЬ</span>
          <h1>
            Простір, у якому
            <br />
            хочеться жити.
          </h1>
          <p>Ремонт і будівельні роботи з увагою до кожної деталі.</p>
        </div>
        <ConsultationButton className="hero-consult">
          <span>
            Записатися
            <br />
            на консультацію
          </span>
        </ConsultationButton>
        <span className="hero-caption">ЖИТЛОВІ ТА КОМЕРЦІЙНІ ПРОСТОРИ</span>
      </section>
      <section className="year-section wrap">
        <div className="year-number">
          2006<span>РІК ПОЧАТКУ НАШОЇ РОБОТИ</span>
        </div>
        <div>
          <h2>Досвід, що стає основою.</h2>
          <p>
            ТОВ БК Слава працює з 2006 року. Виконуємо ремонтні та будівельні роботи у Києві й
            Київській області, поєднуючи практичні рішення з акуратним виконанням.
          </p>
          <a className="text-link" href="/pro-kompaniyu">
            Познайомитися з компанією <Arrow diagonal />
          </a>
        </div>
      </section>
      <ServicesDirectory />
      <section className="selected-work wrap">
        <div className="section-heading">
          <h2>
            Майбутній вигляд
            <br />
            вашого простору.
          </h2>
          <p>
            Матеріали, світло та точна геометрія. Візуальні приклади рішень для житла й бізнесу.
          </p>
        </div>
        <div className="selected-grid">
          {[projects[0], projects[2]].map((p) => (
            <a href={"/portfolio?project=" + p.id} className="project-link" key={p.id}>
              <div className="image-crop">
                <Photo name={p.image} alt={p.title} />
                <span className="project-open">
                  <Arrow diagonal />
                </span>
              </div>
              <div className="project-caption">
                <h3>{p.title}</h3>
                <span>{p.type}</span>
              </div>
            </a>
          ))}
        </div>
        <div className="gallery-foot">
          <span>Архітектурні візуалізації. Ідеї для вашого об’єкта.</span>
          <a className="text-link" href="/portfolio">
            Переглянути всі рішення <Arrow />
          </a>
        </div>
      </section>
      <Process />
      <ContactBand />
    </>
  );
}
function ServicesDirectory({ full = false }: { full?: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <section className={"services-directory wrap " + (full ? "directory-full" : "")}>
      <div className="section-heading">
        <h2>{full ? "Один процес. Різні завдання." : "Роботи, що формують простір."}</h2>
        <p>Повний ремонт або окремий етап. Обирайте напрямок, який потрібен вашому об’єкту.</p>
      </div>
      <div className="service-index">
        <div className="service-rows">
          {services.map((s, i) => (
            <a
              href={"/poslugy/" + s.slug}
              key={s.slug}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={active === i ? "active" : ""}
            >
              <span className="row-number">0{i + 1}</span>
              <div>
                <h3>{s.name}</h3>
                <p>{s.short}</p>
              </div>
              <span className="row-arrow">
                <Arrow diagonal />
              </span>
            </a>
          ))}
        </div>
        <div className="service-preview">
          <Photo name={services[active].image} alt={services[active].name} />
          <span>{services[active].short}</span>
        </div>
      </div>
    </section>
  );
}
export function Process() {
  return (
    <section className="process-section">
      <div className="wrap">
        <h2>
          Від задуму
          <br />
          до останньої деталі.
        </h2>
        <div className="process-grid">
          {steps.map(([name, text], i) => (
            <div key={name}>
              <span className="step-index">0{i + 1}</span>
              <h3>{name}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function ContactBand() {
  return (
    <section className="contact-band wrap">
      <div>
        <span className="contact-kicker">Є ІДЕЯ ДЛЯ ВАШОГО ОБ’ЄКТА?</span>
        <h2>
          Почнемо з<br />
          вашого простору.
        </h2>
        <a className="contact-big-phone" href="tel:+380676090075">
          {phone}
        </a>
        <ContactMethods />
      </div>
      <ConsultationButton className="contact-consult">
        <span>
          Записатися
          <br />
          на консультацію
        </span>
      </ConsultationButton>
    </section>
  );
}
function Breadcrumb({ current, service = false }: { current: string; service?: boolean }) {
  return (
    <nav className="breadcrumb" aria-label="Шлях сторінки">
      <a href="/">Головна</a>
      <span>/</span>
      {service && (
        <>
          <a href="/poslugy">Послуги</a>
          <span>/</span>
        </>
      )}
      <span aria-current="page">{current}</span>
    </nav>
  );
}
export function ServicesPage() {
  return (
    <>
      <div className="page-title wrap">
        <Breadcrumb current="Послуги" />
        <h1>
          Будуємо основу.
          <br />
          <span>Завершуємо деталі.</span>
        </h1>
        <p>
          Шість напрямків для цілісного результату. Працюємо з квартирами, будинками, офісами й
          комерційними приміщеннями.
        </p>
      </div>
      <div className="page-banner wrap">
        <Photo name="house" alt="Сучасний житловий простір із натуральними матеріалами" priority />
      </div>
      <ServicesDirectory full />
      <Process />
      <ContactBand />
    </>
  );
}
export function ServicePage({ service: s }: { service: Service }) {
  const index = services.indexOf(s);
  const next = services[(index + 1) % services.length];
  return (
    <>
      <div className="page-title service-title wrap">
        <Breadcrumb current={s.name} service />
        <div className="service-title-grid">
          <div>
            <span className="service-label">КИЇВ ТА КИЇВСЬКА ОБЛАСТЬ</span>
            <h1>{s.name}</h1>
            <p>{s.short}</p>
            <ConsultationButton service={s.name} className="service-consult" />
          </div>
          <div className="service-cover">
            <Photo name={s.image} alt={s.name} priority />
          </div>
        </div>
      </div>
      <section className="service-description wrap">
        <h2>
          Продуманий підхід.
          <br />
          Видимий результат.
        </h2>
        <p>{s.intro}</p>
      </section>
      <section className="scope-section wrap">
        <div className="section-heading">
          <h2>Що виконуємо</h2>
          <p>
            Обсяг робіт погоджуємо після знайомства з об’єктом. Тут можна обрати потрібні завдання.
          </p>
        </div>
        <div className="scope-grid">
          {s.scope.map((name, i) => (
            <article key={name}>
              <span>0{i + 1}</span>
              <h3>{name}</h3>
              <p>{s.details[i]}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="service-result">
        <div className="wrap">
          <span>РЕЗУЛЬТАТ, ДО ЯКОГО ПРАЦЮЄМО</span>
          <h2>{s.result}</h2>
        </div>
      </div>
      <Process />
      <section className="faq wrap">
        <h2>Перед початком робіт</h2>
        <div>
          <details>
            <summary>
              Як визначається вартість?<span>+</span>
            </summary>
            <p>
              Після обговорення задачі та огляду приміщення. На вартість впливають стан основ,
              обсяг, матеріали й умови виконання. Погоджуємо склад робіт до початку.
            </p>
          </details>
          <details>
            <summary>
              Чи можна замовити тільки цей напрямок?<span>+</span>
            </summary>
            <p>
              Так. Напрямок можна обговорити як окреме завдання або як частину комплексного ремонту.
            </p>
          </details>
          <details>
            <summary>
              Що підготувати для консультації?<span>+</span>
            </summary>
            <p>
              Адресу або населений пункт, опис стану приміщення та бажаного результату. План і
              фотографії допоможуть точніше обговорити завдання.
            </p>
          </details>
          <details>
            <summary>
              У яких населених пунктах працюєте?<span>+</span>
            </summary>
            <p>
              Київ та Київська область. Деталі виїзду й організації робіт погоджуємо для вашого
              об’єкта.
            </p>
          </details>
        </div>
      </section>
      <a className="next-service wrap" href={"/poslugy/" + next.slug}>
        <span>Наступний напрямок</span>
        <h3>{next.name}</h3>
        <Arrow diagonal />
      </a>
      <ContactBand />
    </>
  );
}
function BeforeAfter() {
  const [value, setValue] = useState(50);
  return (
    <div className="comparison">
      <div className="compare-images">
        <Photo name="after" alt="Візуалізація цього приміщення після ремонту" />
        <div className="compare-before" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
          <Photo name="before" alt="Приміщення з чорновими поверхнями до ремонту" />
        </div>
        <span className="compare-tag before">До</span>
        <span className="compare-tag after">Після</span>
        <div className="compare-line" style={{ left: value + "%" }}>
          <span>↔</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Порівняти вигляд до та після ремонту"
        />
      </div>
      <p>
        Рухайте розділювач, щоб порівняти. Візуалізація перетворення, створена для ілюстрації
        можливого результату.
      </p>
    </div>
  );
}
export function Portfolio() {
  const [filter, setFilter] = useState("Усі");
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("project");
    if (id) setSelected(projects.find((p) => p.id === id) || null);
  }, []);
  const categories = [
    "Усі",
    "Житлові простори",
    "Комерційні простори",
    "Оздоблення",
    "Підготовка та монтаж",
  ];
  return (
    <>
      <div className="page-title wrap">
        <Breadcrumb current="Наші роботи" />
        <h1>
          Простір набуває
          <br />
          <span>нового змісту.</span>
        </h1>
        <p>
          Добірка архітектурних рішень для різних задач. Фотореалістичні візуалізації показують
          характер матеріалів і можливий результат; вони не є фотографіями виконаних об’єктів
          компанії.
        </p>
      </div>
      <section className="portfolio-section wrap">
        <div className="portfolio-filters" role="group" aria-label="Категорії робіт">
          {categories.map((c) => (
            <button
              aria-pressed={filter === c}
              className={filter === c ? "selected" : ""}
              onClick={() => setFilter(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="filter-count" aria-live="polite">
          {projects.filter((p) => filter === "Усі" || p.category === filter).length} візуальних
          рішень
        </p>
        <div className="portfolio-grid">
          {projects
            .filter((p) => filter === "Усі" || p.category === filter)
            .map((p) => (
              <button className="portfolio-project" onClick={() => setSelected(p)} key={p.id}>
                <div className="image-crop">
                  <Photo name={p.image} alt={p.title} />
                  <span className="project-open">
                    <Arrow diagonal />
                  </span>
                </div>
                <div className="project-caption">
                  <h2>{p.title}</h2>
                  <span>{p.type}</span>
                </div>
              </button>
            ))}
        </div>
      </section>
      <section className="beforeafter-section wrap">
        <h2>Побачити зміни.</h2>
        <p>Від підготовленої основи до продуманого інтер’єру.</p>
        <BeforeAfter />
      </section>
      <ContactBand />
      <Dialog.Root
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="project-dialog">
            <Dialog.Close className="close-control" aria-label="Закрити проєкт">
              <Close />
            </Dialog.Close>
            {selected && (
              <>
                <Photo name={selected.image} alt={selected.title} />
                <div className="project-dialog-text">
                  <span>{selected.type} / ВІЗУАЛІЗАЦІЯ</span>
                  <Dialog.Title>{selected.title}</Dialog.Title>
                  <Dialog.Description>{selected.text}</Dialog.Description>
                  <ConsultationButton
                    className="project-consult"
                    service={selected.type}
                    children="Обговорити подібне рішення"
                  />
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
export function About() {
  return (
    <>
      <div className="page-title wrap">
        <Breadcrumb current="Про компанію" />
        <h1>
          Міцна основа.
          <br />
          <span>Від 2006 року.</span>
        </h1>
        <p>ТОВ БК Слава. Будівельні та ремонтні роботи у Києві й Київській області.</p>
      </div>
      <section className="about-identity wrap">
        <div className="about-logo">
          <img
            src="/assets/logo.jpg"
            alt="Оригінальний логотип ТОВ БК Слава"
            width="1254"
            height="1254"
          />
        </div>
        <div>
          <h2>Досвід у кожному рішенні.</h2>
          <p>
            Компанія працює з 2006 року. Для нас ремонт починається з розуміння об’єкта: його стану,
            призначення та ваших очікувань.
          </p>
          <p>
            Поєднуємо окремі роботи в послідовний процес. Від демонтажу й підготовки до конструкцій,
            інженерії та фінішного оздоблення.
          </p>
          <p>
            Можна звернутися з комплексним ремонтом або конкретним завданням. Разом визначимо, що
            потрібно саме вашому приміщенню.
          </p>
          <span className="about-since">
            З 2006 <small>КИЇВ ТА ОБЛАСТЬ</small>
          </span>
        </div>
      </section>
      <section className="values wrap">
        <h2>
          Увага до того,
          <br />
          що має значення.
        </h2>
        <div>
          {[
            ["Ясність домовленостей", "Обговорюємо склад робіт і важливі рішення до їх виконання."],
            ["Логіка етапів", "Плануємо процес так, щоб зберігати якість уже виконаного."],
            ["Увага до основи", "Підготовка, монтаж і приховані роботи визначають якість фінішу."],
            ["Акуратні деталі", "Примикання, кути та стики формують цілісний вигляд простору."],
          ].map(([t, p]) => (
            <article key={t}>
              <h3>{t}</h3>
              <p>{p}</p>
              <Arrow diagonal />
            </article>
          ))}
        </div>
      </section>
      <Process />
      <ContactBand />
    </>
  );
}
export function Contacts() {
  return (
    <>
      <div className="page-title wrap">
        <Breadcrumb current="Контакти" />
        <h1>
          Хороший ремонт
          <br />
          <span>починається з розмови.</span>
        </h1>
        <p>Київ та Київська область. Обговоримо ваш об’єкт, потрібні роботи й наступний крок.</p>
      </div>
      <section className="contacts-layout wrap">
        <div className="contacts-primary">
          <span>ЗАТЕЛЕФОНУЙТЕ НАМ</span>
          <a href="tel:+380676090075">{phone}</a>
          <span>АБО НАПИШІТЬ</span>
          <a className="contact-email" href="mailto:m98720141@gmail.com">
            m98720141@gmail.com
          </a>
          <ContactMethods large />
        </div>
        <div className="contact-invitation">
          <Photo
            name="material"
            alt="Архітектурні деталі з металу, скла та мінеральних поверхонь"
          />
          <div>
            <span>ТОВ БК СЛАВА</span>
            <h2>
              Ваші плани.
              <br />
              Наша увага.
            </h2>
            <ConsultationButton className="invitation-consult" />
          </div>
        </div>
      </section>
      <section className="contact-preparation wrap">
        <h2>
          Щоб розмова
          <br />
          була предметною.
        </h2>
        <div>
          <p>
            Підготуйте короткий опис завдання: тип приміщення, населений пункт, поточний стан і
            бажаний результат.
          </p>
          <p>
            Якщо маєте план або фотографії об’єкта, їх можна передати під час спілкування у WhatsApp
            або Viber.
          </p>
          <p>Терміни, обсяг і вартість визначаємо після знайомства із завданням.</p>
        </div>
      </section>
    </>
  );
}
export function Privacy() {
  return (
    <div className="legal-page wrap">
      <Breadcrumb current="Приватність" />
      <h1>Політика приватності</h1>
      <p>
        Контакт для питань щодо даних: <a href="mailto:m98720141@gmail.com">m98720141@gmail.com</a>.
        Компанія: ТОВ БК Слава.
      </p>
      <h2>Форма консультації</h2>
      <p>
        У цій версії сайту форма готує звернення та зберігає його лише у sessionStorage вашого
        браузера на час поточної сесії. Дані автоматично не надсилаються компанії. Ви можете
        самостійно відправити підготовлений текст через свій поштовий застосунок.
      </p>
      <h2>Контактні дані</h2>
      <p>
        За вашим бажанням форма містить ім’я, номер телефону, населений пункт, обраний напрямок та
        опис завдання. Не вказуйте у повідомленні конфіденційні дані, які не потрібні для
        консультації.
      </p>
      <h2>Зовнішні сервіси</h2>
      <p>
        Посилання на WhatsApp, Viber і пошту відкривають відповідні сторонні сервіси. Подальша
        обробка інформації відбувається згідно з їхніми політиками.
      </p>
      <h2>Локальне зберігання</h2>
      <p>
        Сайт також зберігає у поточній сесії позначку перегляду вступного відео. Аналітичні та
        рекламні трекери не підключені. Закриття сесії браузера видаляє ці локальні дані.
      </p>
      <h2>Ваші звернення</h2>
      <p>
        Питання щодо повідомлень, які ви самостійно надіслали компанії, можна адресувати на вказану
        пошту.
      </p>
    </div>
  );
}
