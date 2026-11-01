import { useEffect } from "react"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { AdminAuthProvider } from "@/contexts/AdminAuthContext"
import { AdminLogin } from "@/pages/AdminLogin"
import { AdminPage } from "@/pages/AdminPage"
import {
  AlertCircle,
  ArrowDown,
  CalendarDays,
  Check,
  Church,
  Clock3,
  Copy,
  ExternalLink,
  Gift,
  Heart,
  Infinity as InfinityIcon,
  LoaderCircle,
  MapPin,
  Menu,
  Navigation,
  Send,
  Users,
  X,
} from "lucide-react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import { letters, prayerParagraphs, wedding } from "./data/wedding"
import { submitRsvp, type RsvpPayload } from "./services/rsvp"

const nav = [
  ["Início", "#inicio"],
  ["Nossa história", "#historia"],
  ["O evento", "#evento"],
  ["Presença", "#presenca"],
  ["Presentes", "#presentes"],
]

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Voltar ao início">
        <Heart size={15} />
        <span>Nós</span>
      </a>
      <nav className="desktop-nav" aria-label="Navegação principal">
        {nav.map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <button
        className="menu-button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {nav.map(([label, href], i) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
                <span>0{i + 1}</span>
                {label}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <span />
      <Heart size={12} />
      <span />
    </div>
  )
}

function Hero() {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 700], [0, reduced ? 0 : 45])
  return (
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Com a graça de Deus
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          O nosso <em>para sempre</em>
        </motion.h1>
        <motion.div
          className="hero-date"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <span>15</span>
          <div>
            <strong>Dezembro</strong>
            <small>2026 · às 15h</small>
          </div>
        </motion.div>
        <p className="hero-quote">
          “Acima de tudo, porém, revistam-se do amor, que é o elo perfeito.”
        </p>
        <a className="scroll-cue" href="#boas-vindas">
          Descubra <ArrowDown size={15} />
        </a>
      </div>
      <motion.div className="hero-photo-wrap" style={{ y }}>
        <img
          className="hero-photo"
          src="/img/img-1.jpeg"
          alt="Fotografia do casal"
          loading="eager"
          decoding="async"
        />
        <p className="photo-caption">
          Um encontro escrito por Deus <small>Salvador · Bahia</small>
        </p>
      </motion.div>
    </section>
  )
}

const target = new Date(wedding.date).getTime()
function Countdown() {
  const calculate = () => {
    const d = Math.max(0, target - Date.now())
    return {
      Dias: Math.floor(d / 86400000),
      Horas: Math.floor((d / 3600000) % 24),
      Minutos: Math.floor((d / 60000) % 60),
      Segundos: Math.floor((d / 1000) % 60),
    }
  }
  const [time, setTime] = useState(calculate)
  useEffect(() => {
    const id = setInterval(() => setTime(calculate()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <Reveal className="countdown">
      {Object.entries(time).map(([label, value]) => (
        <div key={label}>
          <motion.strong
            key={value}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
          >
            {String(value).padStart(2, "0")}
          </motion.strong>
          <span>{label}</span>
        </div>
      ))}
    </Reveal>
  )
}

function Welcome() {
  const links = [
    ["Confirmar presença", "#presenca", Check],
    ["Como chegar", "#evento", Navigation],
    ["Presentear", "#presentes", Gift],
  ] as const
  return (
    <section className="welcome section" id="boas-vindas">
      <Reveal className="section-heading centered">
        <p className="eyebrow">Está chegando</p>
        <h2>Para o dia em que dois se tornam um</h2>
        <p>
          Criamos este espaço para dividir com você cada detalhe do dia que
          guardaremos para sempre no coração.
        </p>
      </Reveal>
      <Countdown />
      <Reveal className="quick-links">
        {links.map(([label, href, Icon]) => (
          <a href={href} key={href}>
            <i>
              <Icon size={18} />
            </i>
            {label}
          </a>
        ))}
      </Reveal>
    </section>
  )
}

function Prayer() {
  return (
    <section className="prayer section">
      <aside aria-hidden="true">
        <Church size={24} />
        <span />
        <small>Fé · amor · propósito</small>
      </aside>
      <div className="prayer-content">
        <Reveal className="centered">
          <p className="eyebrow">Nossa oração</p>
          <h2>Antes de tudo, Deus</h2>
          <Ornament />
        </Reveal>
        <div className="prayer-text">
          {prayerParagraphs.map((p, i) => (
            <Reveal key={i}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Letters() {
  return (
    <section className="letters section" id="historia">
      <Reveal className="section-heading">
        <p className="eyebrow">Cartas de amor</p>
        <h2>Palavras que vêm do coração</h2>
      </Reveal>
      <div className="letter-grid">
        {letters.map((letter, i) => (
          <Reveal className="letter-card" key={letter.title} delay={i * 0.12}>
            <b>0{i + 1}</b>
            <Heart size={18} />
            <h3>{letter.title}</h3>
            {letter.paragraphs.map((p, n) => (
              <p key={n}>{p}</p>
            ))}
            <em>Com todo o meu amor</em>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Gallery() {
  return (
    <section className="gallery section">
      <Reveal className="section-heading centered">
        <p className="eyebrow">Nossas memórias</p>
        <h2>Capítulos de uma história</h2>
        <p>Em breve, nossas fotografias favoritas estarão reunidas aqui.</p>
      </Reveal>
      <Reveal className="photo-grid">
        <img
          className="gallery-photo"
          src="/img/img-2.jpeg"
          alt="Fotografia do casal"
          loading="lazy"
          decoding="async"
        />
        <img
          className="gallery-photo"
          src="/img/img-3.jpeg"
          alt="Fotografia do casal"
          loading="lazy"
          decoding="async"
        />
      </Reveal>
    </section>
  )
}

function Event() {
  const details = [
    [CalendarDays, "Data", "15 de dezembro de 2026"],
    [Clock3, "Horário", "15h"],
    [MapPin, "Local", "Lago Doce"],
  ] as const
  return (
    <section className="event section" id="evento">
      <div className="event-main">
        <Reveal>
          <p className="eyebrow">Nosso grande dia</p>
          <h2>Onde o nosso sim será celebrado</h2>
          <p>Prepare o coração para viver este momento conosco.</p>
        </Reveal>
        <Reveal className="event-card">
          {details.map(([Icon, label, value]) => (
            <div className="event-detail" key={label}>
              <Icon size={20} />
              <p>
                <span>{label}</span>
                <strong>{value}</strong>
              </p>
            </div>
          ))}
          <div className="address">
            <span>Endereço</span>
            <p>{wedding.address}</p>
          </div>
          <a
            className="button"
            href={wedding.mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            Abrir localização no Google Maps <ExternalLink size={16} />
          </a>
        </Reveal>
      </div>
      <Reveal className="attire">
        <div>
          <p className="eyebrow">Dress code</p>
          <h3>Uma paleta para celebrar</h3>
          <p>Reservamos algumas cores especiais para o nosso cortejo.</p>
        </div>
        <div className="attire-row">
          <b>Madrinhas</b>
          <div className="swatches">
            {[
              ["yellow", "Amarelo"],
              ["blue", "Azul serenity"],
              ["green", "Verde pastel"],
            ].map(([c, l]) => (
              <span key={c}>
                <i className={c} />
                <small>{l}</small>
              </span>
            ))}
          </div>
        </div>
        <div className="attire-row">
          <b>Padrinhos</b>
          <div className="swatches one">
            <span>
              <i className="gray" />
              <small>Terno cinza</small>
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

type FormData = RsvpPayload & {
  companionName: string
  dietaryRestrictions: string
  message: string
}
const initialForm: FormData = {
  fullName: "",
  attending: true,
  guestCount: 1,
  companionName: "",
  dietaryRestrictions: "",
  message: "",
}

function Rsvp() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] =
    useState<"idle" | "sending" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((v) => ({ ...v, [key]: value }))
  async function send(e: FormEvent) {
    e.preventDefault()
    setError("")
    if (form.fullName.trim().length < 3) {
      setError("Por favor, informe seu nome completo.")
      setStatus("error")
      return
    }
    setStatus("sending")
    try {
      await submitRsvp(form)
      setStatus("success")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar agora.",
      )
      setStatus("error")
    }
  }
  return (
    <section className="rsvp section" id="presenca">
      <div>
        <Reveal>
          <p className="eyebrow">R.S.V.P.</p>
          <h2>Será uma alegria ter você conosco!</h2>
          <p>
            Confirme sua presença para que possamos preparar cada detalhe desse
            dia tão especial.
          </p>
        </Reveal>
        <Reveal className="rsvp-note">
          <Users size={20} />
          <span>
            <b>Confirme com carinho</b>Preencha uma resposta por família.
          </span>
        </Reveal>
      </div>
      <Reveal className="rsvp-panel">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              className="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <i>
                <Check />
              </i>
              <p className="eyebrow">Resposta recebida</p>
              <h3>Obrigado, {form.fullName.split(" ")[0]}!</h3>
              <p>
                {form.attending
                  ? "Sua presença tornará o nosso dia ainda mais especial."
                  : "Agradecemos por nos avisar. Você estará em nossos corações."}
              </p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={send}
              noValidate
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <label>
                <span>Nome completo *</span>
                <input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Como devemos chamar você?"
                />
              </label>
              <fieldset>
                <legend>Você poderá comparecer? *</legend>
                <div className="choices">
                  <label className={form.attending ? "active" : ""}>
                    <input
                      type="radio"
                      checked={form.attending}
                      onChange={() => update("attending", true)}
                    />
                    <Check size={15} /> Sim, estarei lá
                  </label>
                  <label className={!form.attending ? "active" : ""}>
                    <input
                      type="radio"
                      checked={!form.attending}
                      onChange={() => update("attending", false)}
                    />
                    — Não poderei ir
                  </label>
                </div>
              </fieldset>
              {form.attending && (
                <>
                  <div className="form-grid">
                    <label>
                      <span>Quantidade de pessoas *</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={form.guestCount}
                        onChange={(e) =>
                          update("guestCount", Number(e.target.value))
                        }
                      />
                    </label>
                    <label>
                      <span>Nome do acompanhante</span>
                      <input
                        value={form.companionName}
                        onChange={(e) =>
                          update("companionName", e.target.value)
                        }
                        placeholder="Quando aplicável"
                      />
                    </label>
                  </div>
                  <label>
                    <span>Restrições alimentares</span>
                    <input
                      value={form.dietaryRestrictions}
                      onChange={(e) =>
                        update("dietaryRestrictions", e.target.value)
                      }
                      placeholder="Conte-nos para cuidarmos de você"
                    />
                  </label>
                </>
              )}
              <label>
                <span>Mensagem para os noivos</span>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Deixe uma palavra de carinho (opcional)"
                />
              </label>
              {status === "error" && (
                <p className="form-error">
                  <AlertCircle size={16} />
                  {error}
                </p>
              )}
              <button className="button submit" disabled={status === "sending"}>
                {status === "sending" ? (
                  <>
                    Enviando <LoaderCircle className="spin" size={17} />
                  </>
                ) : (
                  <>
                    Confirmar resposta <Send size={16} />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  )
}

function Gifts() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!wedding.pixKey) return
    await navigator.clipboard.writeText(wedding.pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }
  return (
    <section className="gifts section" id="presentes">
      <Reveal className="section-heading centered">
        <p className="eyebrow">Lista de presentes</p>
        <h2>Seu carinho também é um presente</h2>
        <p>
          Celebrar esse momento ao lado de pessoas tão especiais já é um
          presente enorme. Mas, se desejar nos presentear, preparamos uma forma
          simples e especial.
        </p>
      </Reveal>
      <Reveal className="gift-card">
        <div className="qr">
          {wedding.pixQrCode ? (
            <img src={wedding.pixQrCode} alt="QR Code Pix" />
          ) : (
            <>
              <Gift size={34} />
              <span>QR Code Pix</span>
              <small>será inserido aqui</small>
            </>
          )}
        </div>
        <div>
          <p className="eyebrow">Presente via Pix</p>
          <h3>
            {wedding.pixKey
              ? "Um gesto que guardaremos com carinho"
              : "Dados em preparação"}
          </h3>
          <span className="pix-label">Chave Pix</span>
          <div className="pix-key">
            <code>
              {wedding.pixKey || "Chave Pix será disponibilizada em breve"}
            </code>
            <button
              onClick={copy}
              disabled={!wedding.pixKey}
              aria-label="Copiar chave Pix"
            >
              {copied ? <Check /> : <Copy />}
            </button>
          </div>
          {copied && (
            <p className="copied">
              <Check size={14} /> Chave copiada com sucesso
            </p>
          )}
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <Ornament />
      <p>Feito com amor, fé e a bênção de Deus.</p>
      <div>
        <Heart size={15} />
        <InfinityIcon size={25} />
      </div>
      <strong>15 · 12 · 2026</strong>
      <small>O nosso para sempre começa aqui</small>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Welcome />
        <Prayer />
        <Letters />
        <Gallery />
        <Event />
        <Rsvp />
        <Gifts />
      </main>
      <Footer />
    </>
  )
}
