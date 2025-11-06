import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Compass, Sparkles, ArrowRight, ExternalLink, TrendingUp, TrendingDown, ChevronDown, Github } from "lucide-react";
import { AvatarModal } from "./components/avatar/AvatarModal";
import { InspireModal } from "./components/inspire/InspireModal";
import { ExploreModal } from "./components/explore/ExploreModal";
import { Dropdown } from "./components/ui/Dropdown";
import { fetchCatalog } from "./services/api";

export default function EngageExploreEnvisionMockup() {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isInspireModalOpen, setIsInspireModalOpen] = useState(false);
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);
  const [exploreCategory, setExploreCategory] = useState<string>('');
  const [isExecutiveOverview, setIsExecutiveOverview] = useState(false);
  const [allExpanded, setAllExpanded] = useState(true);
  const [industries, setIndustries] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAllExpanded(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchCatalog()
      .then(catalog => {
        setIndustries(catalog.industries.map(i => i.name));
        setRoles(catalog.roles.map(r => r.name));
      })
      .catch(error => {
        console.error('Failed to fetch catalog:', error);
        setIndustries([
          'Financial Services',
          'Healthcare',
          'Retail',
          'Consumer Goods',
          'Manufacturing & Mobility',
          'Energy & Resources',
          'Telecommunications',
          'Media & Entertainment',
          'Government',
          'Education',
          'Nonprofit'
        ]);
        setRoles([
          'Software Development',
          'Legal',
          'Sales',
          'HR',
          'IT',
          'Marketing',
          'Service'
        ]);
      });
  }, []);

  const toggleAll = () => {
    setAllExpanded(prev => !prev);
  };

  const handleIndustrySelect = (industry: string) => {
    setExploreCategory(industry);
    setIsExecutiveOverview(false);
    setIsExploreModalOpen(true);
  };

  const handleRoleSelect = (role: string) => {
    setExploreCategory(role);
    setIsExecutiveOverview(false);
    setIsExploreModalOpen(true);
  };

  const handleExecutiveOverview = () => {
    setIsExecutiveOverview(true);
    setIsExploreModalOpen(true);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.7, delayChildren: 1.8 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 2.0, ease: [0.22, 1, 0.36, 1] as const } },
    hover: { y: -4, transition: { duration: 0.25 } },
  };

  const titleVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.4,
      },
    },
  };

  const titleWordVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 1.3, ease: [0.22, 1, 0.36, 1] as const } },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.3, delay: 1.3, ease: [0.22, 1, 0.36, 1] as const } 
    },
  };

  return (
    <div
      className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col"
      style={{
        fontFamily:
          "Segoe UI Variable, Segoe UI, Inter, system-ui, -apple-system, \"Helvetica Neue\", Arial, \"Noto Sans\", \"Apple Color Emoji\", \"Segoe UI Emoji\"",
      }}
    >
      <StyleTokens />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 -left-20 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(0,229,255,.18),transparent_60%)] blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_70%_70%,rgba(124,77,255,.16),transparent_60%)] blur-3xl" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(1200px_600px_at_50%_10%, black_40%, transparent_75%)",
          }}
        />
      </div>

      <header className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-zinc-300/85"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[--acc-azure]" />
          <span>Frontier AI • Solutions</span>
        </motion.div>
        <motion.h1 
          variants={titleVariants}
          initial="hidden"
          animate="show"
          className="mt-4 text-4xl md:text-6xl font-light leading-[1.08] tracking-tight"
        >
          <motion.span variants={titleWordVariants} className="inline-block">
            Engage.
          </motion.span>{' '}
          <motion.span variants={titleWordVariants} className="inline-block">
            Explore.
          </motion.span>{' '}
          <motion.span variants={titleWordVariants} className="inline-block">
            Envision.
          </motion.span>
        </motion.h1>
        <motion.p 
          variants={subtitleVariants}
          initial="hidden"
          animate="show"
          className="mt-4 max-w-3xl text-zinc-300 text-base md:text-lg"
        >
          Showcasing Microsoft's Frontier Solutions with Azure AI Foundry & Partner Offerings
        </motion.p>
      </header>

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl px-6 pb-16 flex-1"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
          <Card
            variants={item}
            label="Live"
            title="Engage"
            icon={<Mic className="h-5 w-5" />}
            accent="from-[--acc-azure] via-[--acc-purple] to-transparent"
            cta={{ text: "Start a conversation", onClick: () => setIsAvatarModalOpen(true) }}
            isExpanded={allExpanded}
            summary={
              <p className="text-zinc-300">
                Find tailored solutions to your business priorities.
              </p>
            }
            details={
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 p-5 text-left transition-all cursor-pointer hover:bg-white/[0.07] group"
              >
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[--acc-azure] to-[--acc-purple] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Mic className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-200 font-medium mb-3">How do I enhance patient care management with actionable insights?</p>
                    <div className="rounded-lg bg-white/5 px-5 py-4 text-sm text-zinc-300 leading-relaxed">
                      ...first, let me share how others have tackled this. See how <a href="https://www.microsoft.com/en/customers/story/1663846645014128331-mercy-health-provider-azure-en-united-states" target="_blank" rel="noopener noreferrer" aria-label="Mercy Health case study (opens in a new tab)" className="inline text-[--acc-azure] underline underline-offset-2 decoration-[--acc-azure] font-medium hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[--acc-azure] rounded-[2px]" onClick={(e) => e.stopPropagation()}>Mercy Health has solved this with Azure AI Foundry<ExternalLink className="inline-block h-3 w-3 ml-1 align-text-bottom opacity-80" aria-hidden="true" /></a> or explore our <a href="https://azuremarketplace.microsoft.com/en-us/marketplace/apps/paigeaiinc1677248035554.paige_platform_offer?tab=Overview" target="_blank" rel="noopener noreferrer" aria-label="Paige AI ISV solution (opens in a new tab)" className="inline text-[--acc-azure] underline underline-offset-2 decoration-[--acc-azure] font-medium hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[--acc-azure] rounded-[2px]" onClick={(e) => e.stopPropagation()}>ISV solution from Paige AI<ExternalLink className="inline-block h-3 w-3 ml-1 align-text-bottom opacity-80" aria-hidden="true" /></a>.
                    </div>
                  </div>
                </div>
              </button>
            }
          />

          <Card
            variants={item}
            label="Catalog"
            title="Explore"
            icon={<Compass className="h-5 w-5" />}
            accent="from-[--acc-green] via-[--acc-azure] to-transparent"
            cta={{ text: "Browse solutions", onClick: handleExecutiveOverview }}
            isExpanded={allExpanded}
            summary={
              <p className="text-zinc-300">
                Discover solutions by industry, use case, or role.
              </p>
            }
            details={
              <div className="flex flex-col gap-10">
                <button
                  onClick={handleExecutiveOverview}
                  className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-gradient-to-r from-[--acc-azure]/20 to-[--acc-purple]/20 ring-1 ring-white/10 hover:ring-[--acc-azure]/50 text-zinc-200 hover:text-white transition-all text-sm font-medium cursor-pointer group"
                >
                  <span>Executive Overview</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 mb-3 px-1">Browse by</div>
                  <div className="flex flex-col gap-3">
                    <Dropdown
                      label="Role"
                      options={roles}
                      onSelect={handleRoleSelect}
                    />
                    <Dropdown
                      label="Industry"
                      options={industries}
                      onSelect={handleIndustrySelect}
                    />
                  </div>
                </div>
              </div>
            }
          />

          <Card
            variants={item}
            label="Inspire"
            title="Envision"
            icon={<Sparkles className="h-5 w-5" />}
            accent="from-[--acc-purple] via-[--acc-azure] to-transparent"
            cta={{ text: "See the vision", onClick: () => setIsInspireModalOpen(true) }}
            isExpanded={allExpanded}
            summary={
              <p className="text-zinc-300">
                See how <span className="text-white font-medium">Zava</span> transforms business - from <span className="text-zinc-200">Copilot Studio</span> to <span className="text-zinc-200">Azure AI Foundry</span> and beyond.
              </p>
            }
            details={
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => setIsInspireModalOpen(true)}
                  className="rounded-xl bg-gradient-to-br from-[--acc-purple]/15 to-[--acc-purple]/5 ring-1 ring-white/10 hover:ring-[--acc-purple]/40 p-4 text-left transition-all cursor-pointer group hover:from-[--acc-purple]/20 hover:to-[--acc-purple]/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-[--acc-purple] to-[--acc-azure] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1.5">Increase Revenue</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Generate personalized video ads with <span className="text-zinc-300">Sora on Azure AI Foundry</span> for marketing campaigns targeting segments of one
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setIsInspireModalOpen(true)}
                  className="rounded-xl bg-gradient-to-br from-[--acc-azure]/15 to-[--acc-azure]/5 ring-1 ring-white/10 hover:ring-[--acc-azure]/40 p-4 text-left transition-all cursor-pointer group hover:from-[--acc-azure]/20 hover:to-[--acc-azure]/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-[--acc-azure] to-[--acc-green] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <TrendingDown className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1.5">Reduce Costs</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Post-train <span className="text-zinc-300">vision-language action models</span> to target robotics and digitize manufacturing with <span className="text-zinc-300">Azure ISVs</span>
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            }
          />
        </div>

        {/* Global expand/collapse control */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={item}
          className="mx-auto max-w-6xl px-6 mt-8 flex items-center gap-3 relative z-0"
        >
          <div className="h-px bg-white/10 flex-1" />
          <motion.button
            onClick={toggleAll}
            className="inline-flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-2.5 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            aria-label={allExpanded ? "Collapse details" : "Expand details"}
            aria-expanded={allExpanded}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: allExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.button>
          <div className="h-px bg-white/10 flex-1" />
        </motion.div>
      </motion.main>

      <footer className="mx-auto max-w-6xl px-6 pb-12 text-zinc-400 text-sm">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-400">
            Preview
          </span>
          <span className="text-zinc-500">|</span>
          <a 
            href="https://github.com/thegovind/frontierai.solutions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all group"
          >
            <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Self-host</span>
            <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </footer>

      {/* Avatar Modal */}
      <AvatarModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)} 
      />

      {/* Inspire Modal */}
      <InspireModal 
        isOpen={isInspireModalOpen} 
        onClose={() => setIsInspireModalOpen(false)} 
      />

      <ExploreModal 
        isOpen={isExploreModalOpen} 
        onClose={() => setIsExploreModalOpen(false)}
        category={exploreCategory}
        isExecutiveOverview={isExecutiveOverview}
      />
    </div>
  );
}

function Card({
  label,
  title,
  icon,
  accent,
  cta,
  summary,
  details,
  variants,
  isExpanded,
}: {
  label: string;
  title: string;
  icon: React.ReactNode;
  accent: string;
  cta: { text: string; href?: string; onClick?: () => void };
  summary: React.ReactNode;
  details: React.ReactNode;
  variants: any;
  isExpanded: boolean;
}) {
  const cardTitleVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.0, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const } 
    },
  };

  const cardContentVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] as const } 
    },
  };

  return (
    <motion.div
      variants={variants}
      whileHover="hover"
      className="group relative h-full"
    >
      <div className={`h-full rounded-2xl p-[1px] bg-gradient-to-br ${accent}`}>
        <div className="h-full rounded-2xl bg-white/5 backdrop-blur-[6px] ring-1 ring-white/10 flex flex-col">
          <motion.div 
            initial="hidden"
            animate="show"
            className="flex items-center justify-between px-5 pt-5"
          >
            <motion.div 
              variants={cardContentVariants}
              className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-zinc-300/85"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10">
                {icon}
              </span>
              <span>{label}</span>
            </motion.div>
            {cta.onClick ? (
              <motion.button
                variants={cardContentVariants}
                onClick={cta.onClick}
                className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/20 transition cursor-pointer"
              >
                {cta.text}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
            ) : (
              <motion.a
                variants={cardContentVariants}
                href={cta.href}
                className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/20 transition cursor-pointer"
              >
                {cta.text}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </motion.a>
            )}
          </motion.div>
          <motion.div 
            initial="hidden"
            animate="show"
            className="px-5 pt-3 flex-1 flex flex-col"
          >
            <motion.h3 
              variants={cardTitleVariants}
              className="text-2xl md:text-3xl font-medium tracking-tight"
            >
              {title}
            </motion.h3>
            <motion.div 
              variants={cardContentVariants}
              className="mt-3 pb-3"
            >
              {summary}
            </motion.div>
            {cta.onClick ? (
              <motion.button
                variants={cardContentVariants}
                onClick={cta.onClick}
                className="md:hidden mt-5 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/20 transition cursor-pointer"
              >
                {cta.text}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            ) : (
              <motion.a
                variants={cardContentVariants}
                href={cta.href}
                className="md:hidden mt-5 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/20 transition cursor-pointer"
              >
                {cta.text}
                <ArrowRight className="h-4 w-4" />
              </motion.a>
            )}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'visible' }}
                >
                  <motion.div className="mt-5 pb-2">
                    {details}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl opacity-0 blur-2xl transition duration-300 group-hover:opacity-30"
        style={{
          background:
            "radial-gradient(60%_40%_at_50%_0%, rgba(124,77,255,0.22), transparent_60%), radial-gradient(60%_40%_at_100%_100%, rgba(0,229,255,0.22), transparent_60%)",
        }}
      />
    </motion.div>
  );
}

function StyleTokens() {
  return (
    <style>{`
      :root {
        --acc-azure: #00e5ff;
        --acc-purple: #7c4dff;
        --acc-green: #00e676;
      }

      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
      }
    `}</style>
  );
}
