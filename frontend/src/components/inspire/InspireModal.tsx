import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Factory, ExternalLink, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchInspireSettings } from '../../services/api';

interface InspireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InspireModal({ isOpen, onClose }: InspireModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [interest, setInterest] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [interestOptions, setInterestOptions] = useState<string[]>([
    'Sora 2 Video Generation',
    'VLA Model Training',
    'Manufacturing Solutions',
    'Custom AI Solutions',
    'Azure AI Foundry',
    'Other Zava Capabilities'
  ]);

  useEffect(() => {
    if (isOpen) {
      fetchInspireSettings()
        .then(data => {
          if (data.inspireInterests && data.inspireInterests.length > 0) {
            setInterestOptions(data.inspireInterests);
          }
        })
        .catch(error => {
          console.error('Failed to fetch inspire settings:', error);
        });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send to a backend
    console.log('Follow-up request:', { name, email, company, interest });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
      setName('');
      setCompany('');
      setInterest([]);
    }, 3000);
  };

  const toggleInterest = (item: string) => {
    setInterest(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 xl:inset-24 bg-[#0a0a0a] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-medium text-white">Inspire</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Two showcases engineered with Azure AI Foundry
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2 items-stretch">
                {/* Section 1: Increase Revenue */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl bg-white/5 border border-white/10 p-6 h-full flex flex-col"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[--acc-azure]/20">
                      <TrendingUp className="h-6 w-6 text-[--acc-azure]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-2">Increase Revenue</h3>
                      <p className="text-zinc-300 text-sm mb-4">
                        Generate "segment-of-one" hyper-personalized video ads with Sora 2 Video Gen model, powered by Azure AI Foundry. Create unique, targeted content for each customer segment to maximize engagement and conversion.
                      </p>

                      {/* Video */}
                      <div className="relative aspect-[9/16] rounded-lg overflow-hidden mb-4 bg-black max-w-[280px] lg:max-w-[320px] xl:max-w-[360px] mx-auto">
                        <video
                          className="w-full h-full object-contain"
                          controls
                          playsInline
                          preload="metadata"
                        >
                          <source src="/videos/sora-personalized-ad.mp4" type="video/mp4" />
                          <p className="text-sm text-zinc-400">Your browser does not support the video tag.</p>
                        </video>
                      </div>

                      {/* CTAs */}
                      <div className="flex flex-col gap-2 mt-auto">
                        <a
                          href="https://learn.microsoft.com/en-us/azure/ai-foundry/openai/video-generation-quickstart?tabs=macos%2Ckeyless%2Ctext-prompt&pivots=ai-foundry-portal"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Create a personalized ad with Sora in Azure AI Foundry Playground (opens in a new tab)"
                          className="inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-zinc-200 transition group w-full"
                        >
                          <span>Try Sora 2 Video Gen in AI Foundry</span>
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </a>
                        <a
                          href="https://www.microsoft.com/en/customers/story/24274-wpp-azure-openai"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Read how WPP scales personalized video ads with Sora on Azure (opens in a new tab)"
                          className="inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-zinc-200 transition group w-full"
                        >
                          <span>See how WPP scales video creativity with Sora</span>
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Section 2: Reduce Costs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl bg-white/5 border border-white/10 p-6 h-full flex flex-col"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[--acc-green]/20">
                      <Factory className="h-6 w-6 text-[--acc-green]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-2">Reduce Costs</h3>
                      <p className="text-zinc-300 text-sm mb-4">
                        Visual inspection of products (like a Zava shoe) using a robot arm with a Vision-Language-Action (VLA) policy model such as Magma, post-trained on Azure AI Foundry with ND GPUs. Digitize your manufacturing plant with partner solutions like Sight Machines, powered by Omniverse on Azure.
                      </p>

                      {/* Video */}
                      <div className="relative aspect-[9/16] rounded-lg overflow-hidden mb-4 bg-black max-w-[280px] lg:max-w-[320px] xl:max-w-[360px] mx-auto">
                        <video
                          className="w-full h-full object-contain"
                          controls
                          playsInline
                          preload="metadata"
                        >
                          <source src="/videos/ZAVA_Robot.webm" type="video/webm" />
                          <source src="/videos/ZAVA_Robot.mp4" type="video/mp4" />
                          <p className="text-sm text-zinc-400">Your browser does not support the video tag.</p>
                        </video>
                      </div>

                      {/* CTAs */}
                      <div className="flex flex-col gap-2 mt-auto">
                        <a
                          href="https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/fine-tune-managed-compute"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Post-train Hugging Face VLA models on Azure (opens in a new tab)"
                          className="inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-zinc-200 transition group w-full"
                        >
                          <span>Post-train Hugging Face VLA models on Azure</span>
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </a>
                        <a
                          href="https://www.microsoft.com/en/customers/story/1698365434338807911-ipg-azure-ai-customer-story"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Nvidia Omniverse partner solutions (opens in a new tab)"
                          className="inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-zinc-200 transition group w-full"
                        >
                          <span>Explore Omniverse partner solutions</span>
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Next Steps / Follow-up Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mx-auto max-w-6xl mt-8"
              >
                {!showFollowUp ? (
                  <button
                    onClick={() => setShowFollowUp(true)}
                    className="w-full rounded-xl bg-gradient-to-br from-[--acc-azure]/10 to-[--acc-green]/10 border border-white/10 p-6 hover:from-[--acc-azure]/15 hover:to-[--acc-green]/15 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-[--acc-azure]/20">
                          <Sparkles className="h-6 w-6 text-[--acc-azure]" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-medium text-white mb-1">Inspired? Let's Talk Next Steps</h3>
                          <p className="text-sm text-zinc-400">
                            Schedule a tailored Zava workshop for your organization
                          </p>
                        </div>
                      </div>
                      <div className="text-zinc-400 group-hover:text-white transition-colors">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="rounded-xl bg-gradient-to-br from-[--acc-azure]/10 to-[--acc-green]/10 border border-white/10 p-6 lg:p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-[--acc-azure]/20">
                          <Sparkles className="h-6 w-6 text-[--acc-azure]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-white mb-2">Inspired? Let's Talk Next Steps</h3>
                          <p className="text-zinc-300 text-sm">
                            These demos are just a glimpse of what Zava can do for your organization. Get in touch with our Azure Specialists to schedule a tailored Zava workshop and discover solutions specific to your business needs.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowFollowUp(false)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                          aria-label="Collapse follow-up form"
                        >
                          <svg className="h-5 w-5 text-zinc-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      </div>

                      {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[--acc-azure] focus:ring-1 focus:ring-[--acc-azure] transition"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[--acc-azure] focus:ring-1 focus:ring-[--acc-azure] transition"
                            placeholder="your.email@company.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-zinc-300 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[--acc-azure] focus:ring-1 focus:ring-[--acc-azure] transition"
                          placeholder="Your company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          I'm interested in learning more about:
                        </label>
                        <div className="grid gap-2 md:grid-cols-2">
                          {interestOptions.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleInterest(item)}
                              className={`px-4 py-2 rounded-lg text-sm transition text-left ${
                                interest.includes(item)
                                  ? 'bg-[--acc-azure]/20 border-[--acc-azure] text-white'
                                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                              } border`}
                            >
                              <span className="flex items-center gap-2">
                                {interest.includes(item) && (
                                  <CheckCircle2 className="h-4 w-4 text-[--acc-azure]" />
                                )}
                                {item}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[--acc-azure] hover:bg-[--acc-azure]/90 text-white font-medium transition"
                        >
                          <Mail className="h-4 w-4" />
                          Request Follow-up
                        </button>
                        <p className="text-xs text-zinc-500">
                          An Azure Specialist will reach out within 1-2 business days
                        </p>
                      </div>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 p-4 rounded-lg bg-[--acc-green]/20 border border-[--acc-green]/30"
                    >
                      <CheckCircle2 className="h-6 w-6 text-[--acc-green]" />
                      <div>
                        <p className="text-white font-medium">Thank you for your interest!</p>
                        <p className="text-sm text-zinc-300 mt-0.5">
                          An Azure Specialist will contact you shortly to discuss your tailored Zava workshop.
                        </p>
                      </div>
                    </motion.div>
                  )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-white/10 bg-[#0a0a0a]">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-zinc-200 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
