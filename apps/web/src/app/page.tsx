'use client';

import Link from 'next/link';
import { ArrowRight, Utensils, Target, RefreshCw, CheckCircle2, Star, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const floatAnimation = {
  y: [-10, 10],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut"
  }
};

import { useLanguage } from '@/context/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      
      {/* Background Decor Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-soft" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative z-10 pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Text Content */}
            <div className="relative z-20 text-center lg:text-left">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 text-sm font-semibold mb-6 border border-primary-100 dark:border-primary-800">
                <Star className="w-4 h-4 fill-primary-600 dark:fill-primary-300" />
                <span>{t('landing.hero_badge')}</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-zinc-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                {t('landing.hero_title_1')}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
                  {t('landing.hero_title_2')}
                </span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t('landing.hero_subtitle')}
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/register"
                  className="btn-primary w-full sm:w-auto text-lg px-8 py-4 shadow-lg shadow-primary-500/25 hover:shadow-primary-600/30 flex items-center justify-center gap-2 group"
                >
                  {t('landing.hero_cta')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex flex-col items-center sm:items-start">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 sm:mt-0 font-medium px-4">
                        {t('landing.hero_no_credit')}
                    </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-zinc-500 dark:text-zinc-400">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative">
                            {/* Placeholder avatars since we assume no external images for avatars yet, user requested "images" generally */}
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                        </div>
                    ))}
                 </div>
                 <div className="text-sm">
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                    </div>
                    <span>{t('landing.hero_users')}</span>
                 </div>
              </motion.div>
            </div>

            {/* Visual Content - Floating UI Mockup */}
            <motion.div 
              style={{ y: heroY, opacity: heroOpacity }}
              variants={itemVariants}
              className="relative z-10 hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                <motion.div 
                    animate={floatAnimation}
                    className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-[3rem] transform rotate-3" 
                />
                {/* Main Dashboard Image Placeholder */}
                <motion.div 
                    className="absolute inset-2 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                >
                    <img 
                        src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop" 
                        alt="Healthy Meal Prep" 
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                    />
                    
                    {/* Floating UI Card 1 - Calories */}
                    <div className="absolute top-8 right-8 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 w-48 animate-float" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                 <Utensils className="w-4 h-4" />
                             </div>
                             <div>
                                 <div className="text-xs text-zinc-500">{t('landing.hero_lunch')}</div>
                                 <div className="text-sm font-bold text-zinc-900 dark:text-white">Poke Bowl</div>
                             </div>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-1.5 dark:bg-zinc-700">
                            <div className="bg-orange-500 h-1.5 rounded-full w-[75%]"></div>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-zinc-500">
                            <span>450 kcal</span>
                            <span>75%</span>
                        </div>
                    </div>

                     {/* Floating UI Card 2 - Macros */}
                     <div className="absolute bottom-12 left-8 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 w-56 animate-float" style={{ animationDelay: '1.5s' }}>
                        <div className="flex justify-between items-end mb-2">
                             <div className="text-sm font-bold text-zinc-900 dark:text-white">{t('landing.hero_macros')}</div>
                             <div className="text-xs text-emerald-600 font-medium">{t('landing.hero_perfect')}</div>
                        </div>
                        <div className="flex gap-2">
                            {[t('landing.chart_protein'), t('landing.chart_carbs'), t('landing.chart_fats')].map((macro, i) => (
                                <div key={macro} className="flex-1">
                                    <div className={`h-16 w-full rounded-lg bg-zinc-100 dark:bg-zinc-700 relative overflow-hidden`}>
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${[60, 45, 30][i]}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 + (i * 0.2) }}
                                            className={`absolute bottom-0 w-full ${['bg-primary-500', 'bg-emerald-500', 'bg-amber-500'][i]} opacity-80`} 
                                        />
                                    </div>
                                    <div className="text-[10px] text-zinc-500 text-center mt-1">{macro}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <Link href="#features">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1, y: [0, 10, 0] }} 
                transition={{ delay: 1, duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-400 hidden lg:flex flex-col items-center gap-2 cursor-pointer hover:text-primary-600 transition-colors"
            >
                <span className="text-xs uppercase tracking-widest">{t('landing.hero_discover')}</span>
                <ChevronDown className="w-4 h-4" />
            </motion.div>
        </Link>
      </section>

      {/* VALUE PROP SCROLL */}
      <section id="features" className="py-24 bg-zinc-50/50 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center max-w-3xl mx-auto mb-16">
                   <h2 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white mb-4">
                       {t('landing.features_title')}
                   </h2>
                   <p className="text-lg text-zinc-600 dark:text-zinc-400">
                       {t('landing.features_subtitle_1')}<span className="text-primary-600 font-medium">{t('landing.features_subtitle_2')}</span>{t('landing.features_subtitle_3')}
                   </p>
               </div>
               
               <div className="grid md:grid-cols-3 gap-8">
                   {[
                       {
                           image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop",
                           icon: Target,
                           key: "science"
                       },
                       {
                           image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
                           icon: RefreshCw,
                           key: "training"
                       },
                       {
                           image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop",
                           icon: CheckCircle2,
                           key: "shopping"
                       }
                   ].map((feature, i) => (
                       <motion.div 
                           key={i}
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ delay: i * 0.2 }}
                           className="group relative bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-black/30 border border-zinc-100 dark:border-zinc-700 h-full flex flex-col"
                       >
                           {/* Image Container with Zoom Effect */}
                           <div className="h-48 overflow-hidden relative">
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                               <motion.img 
                                   src={feature.image} 
                                   alt={t(`landing.feat_${feature.key}_title`)}
                                   className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                               />
                               <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white">
                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-lg">{t(`landing.feat_${feature.key}_title`)}</span>
                               </div>
                           </div>
                           
                           {/* Content */}
                           <div className="p-6 flex-1 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-500">
                                    <feature.icon className="w-24 h-24 text-primary-500" />
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed relative z-10">
                                    {t(`landing.feat_${feature.key}_desc`)}
                                </p>
                                
                                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-700 relative z-10">
                                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-2 transition-transform inline-flex items-center gap-1 cursor-pointer">
                                        {t('landing.feat_learn_more')} <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                           </div>
                       </motion.div>
                   ))}
               </div>
           </div>
      </section>

      {/* FEATURE SHOWCASE - SPLIT LAYOUT */}
      <section id="how-it-works" className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="order-2 lg:order-1"
                  >
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
                          <img 
                            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop" 
                            alt="Nutrition Planning" 
                            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                              <div className="text-white">
                                  <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                      <span className="font-semibold">{t('landing.how_img_badge')}</span>
                                  </div>
                                  <p className="text-white/80 text-sm">{t('landing.how_img_desc')}</p>
                              </div>
                          </div>
                      </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="order-1 lg:order-2"
                  >
                      <h2 className="text-3xl lg:text-4xl font-heading font-bold text-zinc-900 dark:text-white mb-6">
                          {t('landing.how_title_1')}<br/>
                          <span className="text-primary-600">{t('landing.how_title_2')}</span>
                      </h2>
                      <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8">
                          {t('landing.how_desc')}
                      </p>
                      
                      <ul className="space-y-4">
                          {[1, 2, 3].map((i) => (
                              <li key={i} className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
                                      <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                  </div>
                                  <span className="text-zinc-700 dark:text-zinc-300">{t(`landing.how_item_${i}`)}</span>
                              </li>
                          ))}
                      </ul>
                      
                      <div className="mt-10">
                          <Link href="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 flex items-center gap-2 group">
                              {t('landing.how_cta')}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                      </div>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-12 lg:p-20 text-center text-white shadow-2xl shadow-primary-900/30 relative overflow-hidden"
          >
              {/* Background patterns */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white/30"></div>
                  <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white/20 blur-2xl"></div>
              </div>

              <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                      {t('landing.cta_title')}
                  </h2>
                  <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                      {t('landing.cta_desc')}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Link 
                        href="/register" 
                        className="btn bg-white text-primary-700 hover:bg-zinc-50 font-bold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 w-full sm:w-auto text-lg"
                      >
                          {t('landing.cta_button')}
                      </Link>
                      <span className="text-sm text-primary-200">
                          {t('landing.cta_no_credit')}
                      </span>
                  </div>
              </div>
          </motion.div>
      </section>

    </div>
  );
}

