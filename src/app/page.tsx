import Link from 'next/link'
import { ArrowRight, Layers, Shield, FlaskConical, Zap, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Layers,
    label: 'MVVM by-feature',
    desc: 'Cada feature isolada, testável e deletável sem cirurgia no projeto',
  },
  {
    icon: Shield,
    label: 'Quality Gate',
    desc: 'Husky + SonarQube bloqueiam lint, tipos e cobertura antes do merge',
  },
  {
    icon: FlaskConical,
    label: 'Três camadas de teste',
    desc: 'Vitest no ViewModel · Cypress Component · E2E nos fluxos críticos',
  },
  {
    icon: Zap,
    label: '12 Skills no terminal',
    desc: 'Claude Code scaffolda, testa, documenta e revisa com um comando',
  },
]

const stack = [
  'Next.js 15',
  'TypeScript strict',
  'TanStack Query',
  'Zod',
  'Axios',
  'Zustand',
  'Tailwind CSS',
  'Vitest',
  'Cypress',
  'SonarQube',
  'OpenTelemetry',
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-dark flex flex-col items-center justify-center">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-48 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(68,220,152,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-80 w-80 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(68,220,152,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(68,220,152,0.15) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-24 max-w-5xl w-full">
        {/* Badge */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-5 py-2">
          <Sparkles className="h-3.5 w-3.5 text-brand-green" />
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand-green">
            Proposta de Stack · Volix · Junho 2026
          </span>
        </div>

        {/* Title */}
        <h1
          className="mb-5 font-black leading-none tracking-tighter text-white"
          style={{ fontSize: 'clamp(5rem, 16vw, 11rem)' }}
        >
          <span
            className="inline-block text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #44DC98 0%, #a7f3d0 45%, #44DC98 100%)',
              WebkitBackgroundClip: 'text',
            }}
          >
            MVVM
          </span>
        </h1>

        <p className="mb-3 text-xl font-light tracking-wide text-white/40 md:text-2xl">
          Arquitetura que escala com o time
        </p>

        <p className="mb-14 font-mono text-xs tracking-[0.2em] text-white/20 uppercase">
          View apresenta &nbsp;·&nbsp; ViewModel decide &nbsp;·&nbsp; Model fornece
        </p>

        {/* CTA */}
        <Link
          href="/orders"
          className="group mb-20 inline-flex items-center gap-3 rounded-2xl bg-brand-green px-10 py-5 text-base font-bold text-brand-dark transition-all duration-300 hover:scale-105"
          style={{
            boxShadow: '0 0 60px rgba(68,220,152,0.30), 0 20px 60px rgba(68,220,152,0.12)',
          }}
        >
          Ver demo — Orders
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>

        {/* Feature cards */}
        <div className="mb-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:border-brand-green/25 hover:bg-brand-green/[0.04]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10">
                <Icon className="h-5 w-5 text-brand-green" />
              </div>
              <p className="mb-1.5 text-sm font-semibold text-white">{label}</p>
              <p className="text-xs leading-relaxed text-white/30">{desc}</p>
            </div>
          ))}
        </div>

        {/* Stack pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/35"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(68,220,152,0.4) 50%, transparent 100%)',
        }}
      />
    </main>
  )
}
