import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Zap, Users, Star, MapPin, Calendar, DollarSign,
  Search, ArrowRight, CheckCircle, Clock, MessageSquare,
  Sparkles, TrendingUp, ChevronRight, Briefcase, Award,
  ShieldCheck, HeadphonesIcon, Zap as Lightning
} from 'lucide-react';
import api from '../services/api';

const categoryIcons: Record<string, string> = {
  'Home Services': '🏠',
  'Delivery & Errands': '📦',
  'Personal Care': '💆',
  'Technology': '💻',
  'Automotive': '🚗',
  'Education': '📚',
  'Events & Entertainment': '🎉',
  'Professional Services': '💼',
  'Health & Wellness': '🏥',
  'Creative & Design': '🎨',
};

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-text-primary">{target.toLocaleString()}+</div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
    </div>
  );
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');

  const { data: services } = useQuery({
    queryKey: ['services', 'featured'],
    queryFn: () => api.get('/services/browse', { params: { per_page: 6, sort: 'newest' } }).then((r) => r.data),
  });

  const listings = services?.data ?? [];

  const { data: errands } = useQuery({
    queryKey: ['errands', 'recent'],
    queryFn: () => api.get('/requests/browse', { params: { per_page: 4, sort: 'newest' } }).then((r) => r.data),
  });

  const errandListings = errands?.data ?? [];

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'home'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
  });

  const categories = (categoriesData ?? []).slice(0, 8);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/nearby?query=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      {/* ─── HERO ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)' }}>
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: '#FF6B00' }} />
          <div className="absolute top-20 -left-20 w-64 h-64 rounded-full opacity-5" style={{ background: '#FF6B00' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-5" style={{ background: '#60a5fa' }} />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
        >
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
              style={{ backgroundColor: 'rgba(255,107,0,0.15)', color: '#fb923c' }}>
              <Sparkles className="w-4 h-4" />
              Trusted by thousands of locals
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]">
              Get Things Done.
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #FF6B00, #fb923c)' }}>
                Effortlessly.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with verified local agents for errands, deliveries, repairs, and more.
              Fast, trusted, and right in your neighborhood.
            </motion.p>

            {/* Search Bar */}
            <motion.form variants={fadeUp} onSubmit={handleHeroSearch} className="max-w-xl mx-auto mb-8">
              <div className="flex items-center bg-white rounded-2xl shadow-2xl shadow-black/20 p-2">
                <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Find electricians, restaurants, services near you..."
                  className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 bg-transparent outline-none text-base"
                />
                <button type="submit"
                  className="px-6 py-3 rounded-xl text-white font-medium text-sm transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shrink-0"
                  style={{ backgroundColor: '#FF6B00' }}>
                  Search
                </button>
              </div>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp}>
            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: '#FF6B00' }}>
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/errands"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all">
                  Browse Errands
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/requests/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: '#FF6B00' }}>
                  Post a Request <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/errands"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all">
                  Find Errands to Do
                </Link>
              </div>
            )}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <AnimatedCounter target={2500} label="Active Users" />
            <AnimatedCounter target={850} label="Verified Agents" />
            <AnimatedCounter target={12000} label="Tasks Completed" />
            <AnimatedCounter target={4} label="Avg Rating" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ─── HOW IT WORKS ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="py-20 bg-surface"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FF6B00' }}>How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-2 mb-4">Three steps to get started</h2>
            <p className="text-text-secondary max-w-lg mx-auto">Simple, fast, and secure — from posting a task to getting it done.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(90deg, #FF6B00, #1e3a8a, #22c55e)' }} />

            {[
              { step: '1', icon: <Zap className="w-6 h-6" />, title: 'Post Your Task', desc: 'Describe what you need, set your budget, and choose a category. It takes less than a minute.', color: '#FF6B00', bg: '#FFF7ED' },
              { step: '2', icon: <Users className="w-6 h-6" />, title: 'Get Matched', desc: 'Verified local agents review your request and apply. Compare profiles, ratings, and proposals.', color: '#1e3a8a', bg: '#EFF6FF' },
              { step: '3', icon: <CheckCircle className="w-6 h-6" />, title: 'Get It Done', desc: 'Pick your agent, chat in real-time, and track progress. Pay only when you\'re satisfied.', color: '#22c55e', bg: '#F0FDF4' },
            ].map((item) => (
              <motion.div key={item.step} variants={scaleUp} className="relative text-center px-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 shadow-lg"
                  style={{ backgroundColor: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: item.color }}>Step {item.step}</div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── CATEGORIES ─── */}
      {categories.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="py-20" style={{ backgroundColor: '#f8fafc' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FF6B00' }}>Categories</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-2 mb-4">Browse by service type</h2>
              <p className="text-text-secondary max-w-lg mx-auto">Find the right professional for any task across dozens of categories.</p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat: { id: string; name: string; icon?: string }) => (
                <motion.div key={cat.id} variants={scaleUp}>
                  <Link to={`/errands?category_id=${cat.id}`}
                    className="group bg-surface p-6 rounded-2xl border border-border hover:border-transparent hover:shadow-lg transition-all duration-300 text-center block">
                    <div className="text-3xl mb-3">{categoryIcons[cat.name] || cat.icon || '📋'}</div>
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-500 transition-colors">{cat.name}</h3>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="text-center mt-8">
              <Link to="/errands" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: '#FF6B00' }}>
                View all categories <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* ─── FEATURED SERVICES ─── */}
      {listings.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="py-20 bg-surface"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FF6B00' }}>Featured</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-2">Top services near you</h2>
              </div>
              <Link to="/services" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:gap-2.5" style={{ color: '#FF6B00' }}>
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((s: any) => (
                <motion.div key={s.id} variants={scaleUp}>
                  <Link to={`/services/${s.id}`}
                    className="group bg-surface rounded-2xl border border-border hover:border-transparent hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden flex flex-col block">
                    <div className="h-48 relative overflow-hidden" style={{ backgroundColor: '#FFF7ED' }}>
                      {s.photos?.[0] ? (
                        <img src={s.photos[0]} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl font-bold opacity-20" style={{ color: '#FF6B00' }}>{s.title[0]}</span>
                        </div>
                      )}
                      {s.price_type && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                          {s.price_type === 'hourly' ? `$${s.starting_price}/hr` : s.starting_price ? `From $${s.starting_price}` : 'Negotiable'}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-text-primary mb-1.5 group-hover:text-brand-500 transition-colors">{s.title}</h3>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">{s.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-3">
                          {s.agent?.avg_overall_rating > 0 && (
                            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#f59e0b' }}>
                              <Star className="w-3.5 h-3.5 fill-current" /> {Number(s.agent.avg_overall_rating).toFixed(1)}
                            </span>
                          )}
                          {s.location && (
                            <span className="flex items-center gap-1 text-xs text-text-secondary">
                              <MapPin className="w-3 h-3" /> {s.location.length > 20 ? s.location.slice(0, 20) + '...' : s.location}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="text-center mt-8 sm:hidden">
              <Link to="/services" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#FF6B00' }}>
                View all services <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* ─── RECENT ERRANDS ─── */}
      {errandListings.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="py-20" style={{ backgroundColor: '#f8fafc' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FF6B00' }}>Open Now</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-2">Recent errands</h2>
              </div>
              <Link to="/errands" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:gap-2.5" style={{ color: '#FF6B00' }}>
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {errandListings.map((e: any) => (
                <motion.div key={e.id} variants={fadeUp}>
                  <Link to={`/errands/${e.id}`}
                    className="group bg-surface p-6 rounded-2xl border border-border hover:border-transparent hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex gap-5 block">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        {e.category && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                            {e.category.name}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                          e.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          e.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          e.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {e.priority}
                        </span>
                      </div>
                      <h3 className="font-bold text-text-primary mb-1 group-hover:text-brand-500 transition-colors truncate">{e.title}</h3>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-3">{e.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                        {e.budget_range?.length === 2 && (
                          <span className="flex items-center gap-1 font-semibold" style={{ color: '#FF6B00' }}>
                            <DollarSign className="w-3.5 h-3.5" /> ${e.budget_range[0]} – ${e.budget_range[1]}
                          </span>
                        )}
                        {e.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Due {new Date(e.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {e.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {e.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-orange-50 transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="text-center mt-8 sm:hidden">
              <Link to="/errands" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#FF6B00' }}>
                View all errands <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* ─── WHY ERRANDHUB ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="py-20 bg-surface"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FF6B00' }}>Why ErrandHub</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-2 mb-4">Built for trust & speed</h2>
            <p className="text-text-secondary max-w-lg mx-auto">Every feature designed to make local services safe, transparent, and effortless.</p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck className="w-6 h-6" />, title: 'Verified Agents', desc: 'Every agent goes through ID verification and background checks.', color: '#FF6B00', bg: '#FFF7ED' },
              { icon: <Star className="w-6 h-6" />, title: 'Real Reviews', desc: 'Multi-dimensional ratings from real customers you can trust.', color: '#f59e0b', bg: '#FFFBEB' },
              { icon: <MessageSquare className="w-6 h-6" />, title: 'Real-Time Chat', desc: 'Message your agent instantly with file sharing and read receipts.', color: '#1e3a8a', bg: '#EFF6FF' },
              { icon: <Lightning className="w-6 h-6" />, title: 'Fast Matching', desc: 'Get applications from qualified agents within minutes of posting.', color: '#22c55e', bg: '#F0FDF4' },
            ].map((item) => (
              <motion.div key={item.title} variants={scaleUp} className="group p-6 rounded-2xl border border-border hover:border-transparent hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-text-primary mb-1.5">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── FOR CLIENTS / FOR AGENTS ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="py-20" style={{ backgroundColor: '#f8fafc' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clients */}
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2" style={{ background: '#FF6B00' }} />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,107,0,0.2)' }}>
                  <Zap className="w-7 h-7" style={{ color: '#FF6B00' }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Need Something Done?</h3>
                <p className="text-blue-200 mb-8 leading-relaxed">Post your task in under a minute. Get proposals from verified agents, compare profiles and ratings, and hire the best fit — all in one place.</p>
                <ul className="space-y-3 mb-8">
                  {['Post tasks with photos & budget', 'Receive proposals within minutes', 'Secure in-app messaging', 'Pay only when satisfied'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-blue-100">
                      <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#FF6B00' }} /> {item}
                    </li>
                  ))}
                </ul>
                <Link to={!user ? '/register' : '/requests/create'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02]"
                  style={{ backgroundColor: '#FF6B00' }}>
                  {!user ? 'Sign Up as Client' : 'Post a Request'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Agents */}
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-surface border border-border">
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5 translate-y-1/2 -translate-x-1/2" style={{ background: '#22c55e' }} />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#F0FDF4' }}>
                  <TrendingUp className="w-7 h-7" style={{ color: '#22c55e' }} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">Want to Earn?</h3>
                <p className="text-text-secondary mb-8 leading-relaxed">Build your profile, showcase your skills, and find local jobs that match your expertise. Set your own schedule and rates.</p>
                <ul className="space-y-3 mb-8">
                  {['Create a professional profile', 'Browse & apply to errands', 'Get verified for trust', 'Build your reputation with reviews'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                      <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} /> {item}
                    </li>
                  ))}
                </ul>
                <Link to={!user ? '/register' : '/errands'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02]"
                  style={{ backgroundColor: '#22c55e' }}>
                  {!user ? 'Sign Up as Agent' : 'Find Errands'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── CTA BANNER ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        className="py-20" style={{ background: 'linear-gradient(135deg, #FF6B00, #ea580c)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to get things done?</h2>
          <p className="text-lg text-orange-100 mb-8 max-w-xl mx-auto">Join thousands of people who trust ErrandHub for their everyday tasks and services.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#0f172a', color: '#fff' }}>
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/services"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all">
              Browse Services
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
