'use client'

import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Counter animation
  useEffect(() => {
    const counters = document.querySelectorAll('.stat-number')
    counters.forEach((counter) => {
      const target = parseInt((counter as HTMLElement).getAttribute('data-count') || '0')
      const duration = 2000
      const increment = target / (duration / 16)
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          counter.textContent = target.toString()
          clearInterval(timer)
        } else {
          counter.textContent = Math.floor(current).toString()
        }
      }, 16)
    })
  }, [])

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`shadow-sm sticky top-0 z-40 transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-md py-2'
          : 'bg-white py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 group">
              <motion.span
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="text-3xl cursor-pointer"
              >
                🌿
              </motion.span>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">Anjum's</h1>
                <p className="text-xs text-gray-600 font-medium tracking-wide uppercase">Diet & Wellness</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-gray-700 hover:text-primary font-medium transition-colors">About</a>
              <a href="#services" className="text-gray-700 hover:text-primary font-medium transition-colors">Services</a>
              <a href="#packages" className="text-gray-700 hover:text-primary font-medium transition-colors">Packages</a>
              <a href="#why-us" className="text-gray-700 hover:text-primary font-medium transition-colors">Why Us</a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary font-medium transition-colors">Testimonials</a>
              <a href="#faq" className="text-gray-700 hover:text-primary font-medium transition-colors">FAQ</a>

            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50/50 to-white overflow-hidden pt-16 pb-24 md:pt-28 md:pb-32">
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
              }}
              className="max-w-2xl"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="inline-flex items-center gap-2 mb-8 px-4 py-2.5 bg-white border border-gray-100 rounded-full text-sm font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
              >
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-gray-800 tracking-wide">Accepting 5 new clients this month</span>
              </motion.div>

              <motion.h2
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="text-5xl md:text-[4.2rem] font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight"
              >
                Get a personalized Indian diet plan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600 italic font-serif pr-4">that actually works.</span>
              </motion.h2>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="text-lg md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-lg"
              >
                Designed for weight loss, PCOS, and long-term health using an expert-led AI approach.
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="flex flex-wrap gap-4 mb-16"
              >
                <a href="#contact" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-gray-900 rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">Get Your Custom Diet Plan <span className="group-hover:translate-x-1 transition-transform">→</span></span>
                </a>
                <a href="#testimonials" className="inline-flex items-center justify-center px-8 py-4 font-bold text-gray-900 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
                  View Transformations
                </a>
              </motion.div>

              {/* Glassmorphic Stats Counter */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="grid grid-cols-3 gap-6 p-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] w-max"
              >
                <div className="text-center px-4">
                  <div className="text-3xl md:text-4xl font-black text-gray-900">22+</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Years Exp</div>
                </div>
                <div className="text-center px-4 border-l border-r border-gray-200/50">
                  <div className="text-3xl md:text-4xl font-black text-gray-900">500+</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Clients</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-3xl md:text-4xl font-black text-gray-900">98%</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Success Rate</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative lg:ml-auto"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] bg-white/50 backdrop-blur-sm p-3 border border-white/50">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80&auto=format"
                  alt="Anjum Shaikh - Founder and Clinical Nutritionist"
                  className="w-full object-cover aspect-[4/5] rounded-[2rem]"
                />
                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl shadow-inner">🩺</div>
                    <div>
                      <div className="font-black text-gray-900 text-lg leading-tight">Anjum Shaikh</div>
                      <div className="text-xs font-bold text-primary uppercase tracking-widest mt-0.5">Clinical Nutritionist</div>
                    </div>
                  </div>
                  <div className="text-right border-l md:border-l-0 pl-4 md:pl-0 border-gray-200">
                    <div className="font-black text-gray-900 text-lg leading-tight">22+</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Years Exp</div>
                  </div>
                </div>
              </div>

              {/* Decorative Blur Orbs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/30 via-emerald-400/20 to-yellow-300/30 rounded-full blur-[80px] -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section (Meet Anjum) */}
      <section id="about" className="bg-gradient-to-br from-green-50/30 to-white py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-br from-emerald-100/50 to-primary/20 rounded-full blur-[60px] -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80&auto=format"
                alt="Meet Anjum - Clinical Nutritionist"
                className="rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative z-0 border border-white"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-8 -right-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center gap-4 z-20 border border-white"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-2xl">
                  🎖️
                </div>
                <div>
                  <div className="font-black text-gray-900 text-xl tracking-tight">22+ Years</div>
                  <div className="text-sm font-semibold text-primary uppercase tracking-wider">Clinical Experience</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
              }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-100">
                The Methodology
              </motion.div>
              <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Stop Chasing Symptoms.<br/>
                <span className="font-serif italic text-primary">Fix the Root Cause.</span>
              </motion.h2>
              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-lg text-gray-600 mb-6 leading-relaxed">
                Most diets fail because they depend entirely on starvation. At Anjum's Diet and Wellness, we utilize 22+ years of clinical insight to orchestrate metabolic resets and hormonal harmony. 
              </motion.p>
              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-lg text-gray-600 mb-10 leading-relaxed">
                Whether you're battling lifelong PCOS, reversing insulin resistance, or breaking an endless weight plateau, our methodology fits into your actual life—using the Indian foods you grew up with.
              </motion.p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🧬', title: 'Root-Cause Analysis', desc: 'Diagnostics over guesswork' },
                  { icon: '⚖️', title: 'Hormonal Balance', desc: 'PCOS & Thyroid protocols' },
                  { icon: '🍽️', title: 'No Starvation', desc: 'Eat the Indian food you love' },
                  { icon: '📈', title: 'Lasting Results', desc: '22+ years of success stories' },
                ].map((feature, i) => (
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    key={i}
                    className="p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{feature.icon}</span>
                      <div className="font-bold text-gray-900 text-sm">{feature.title}</div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{feature.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gray-50 py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white shadow-sm rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-6">Expert + AI Combo</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Clinical Expertise Meets <span className="font-serif italic text-primary">AI Precision</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              We combine 22+ years of human clinical insight with advanced AI tracking to build the ultimate, highly-personalized Indian diet frameworks for metabolic repair and permanent weight management.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚖️', title: 'Weight Management', desc: 'Sustainable fat loss protocols overriding metabolic adaptations.' },
              { icon: '🧬', title: 'Diabetes Reversal', desc: 'Insulin resistance repair and blood sugar stabilization therapy.' },
              { icon: '🦋', title: 'Thyroid & PCOS', desc: 'Hormonal harmony protocols bridging the gap in women\'s health.' },
              { icon: '🦠', title: 'Gut Microbiome', desc: 'Advanced functional foods for digestive restoration and immunity.' },
              { icon: '❤️', title: 'Heart & BP', desc: 'Clinically proven nutritional interventions for cardiovascular longevity.' },
              { icon: '💪', title: 'Performance Nutrition', desc: 'Lean muscle synthesis and athletic recovery optimization.' },
              { icon: '🌱', title: 'Plant-Based Dieting', desc: 'Anti-inflammatory, sustainable vegan and vegetarian frameworks.' },
              { icon: '🫀', title: 'Organ Health', desc: 'Targeted support for CKD, high creatinine, and fatty liver disease.' },
            ].map((service, i) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                key={i}
                className="relative bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.1)] hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden group border border-transparent z-10"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -z-10 group-hover:scale-[2] transition-transform duration-700 ease-out"></div>
                <div className="w-14 h-14 bg-gray-50/80 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-primary/10 group-hover:shadow-inner transition-colors duration-300">
                  {service.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-3 leading-tight group-hover:text-primary transition-colors duration-300">{service.title}</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="bg-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-white -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">Pricing</div>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-6">Invest in Your Health</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Not another diet plan. A complete health transformation system for individuals serious about long-term root-cause resolution.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-[2.5rem] bg-[#0E1525] overflow-hidden shadow-2xl"
            >
              {/* Premium Glow Effect */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

              <div className="p-10 md:p-14 md:flex gap-12 items-center">
                <div className="md:w-3/5 text-left text-white mb-10 md:mb-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/10">
                    Not a quick fix
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif italic text-white/90">
                    Personalized Transformation System
                  </h3>
                  <p className="text-lg text-white/60 mb-8 leading-relaxed">
                    Designed for individuals who are serious about long-term results to address PCOS, thyroid, and lifestyle-related issues. We fix the root cause, not just symptoms.
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {[
                      'Fully customized clinical nutrition plan',
                      'Regular tracking and expert adjustments',
                      'Indian food-based approach (no starvation)',
                      'Direct support throughout your journey'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/30">✓</span>
                        <span className="text-white/80 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-sm font-semibold text-amber-500 uppercase tracking-widest bg-amber-500/10 inline-block px-4 py-2 rounded-full border border-amber-500/20">
                    ⚠️ Limited clients taking now
                  </div>
                </div>

                <div className="md:w-2/5 md:border-l border-white/10 md:pl-12 text-left">
                  <div className="mb-2">
                    <p className="text-white/40 text-sm font-bold uppercase tracking-wider mb-2">Required Investment</p>
                    <div className="flex items-end gap-2 text-white">
                      <span className="text-4xl lg:text-5xl font-black tracking-tighter">Starts at<br/>₹45k</span>
                    </div>
                    <p className="text-white/40 text-xs mt-3 leading-relaxed">
                      Less than ₹700/day to completely transform your health.
                    </p>
                    <p className="text-white/30 text-xs mt-2 italic">
                      Most clients invest between ₹45,000 – ₹1,20,000 based on goals.
                    </p>
                  </div>

                  <div className="mt-8">
                    <p className="text-white/80 font-bold mb-4 text-sm">Who is this for?</p>
                    <p className="text-white/40 text-sm leading-relaxed mb-6">
                      For those who have tried everything and are ready for real change.
                    </p>
                    
                    <a href="#contact" className="group relative block w-full text-center py-4 rounded-full font-bold bg-white text-gray-900 hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                      Apply for Consultation
                      <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="bg-gradient-to-br from-green-50/50 via-white to-green-50/50 py-24 relative overflow-hidden">
        {/* Abstract Background Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-primary/10 rounded-full -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-primary/10 rounded-full -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">Why Choose Us</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Is This Program Right For You?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              If any of the following resonate with you, our personalized program is exactly what you need.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              'You have tried losing weight before but had no success',
              'You managed to lose weight but couldn\'t maintain it',
              'You went to a dietitian before but the diets were hard to follow',
              'You\'re not comfortable with the idea of surgery or tummy tuck',
              'You know how to eat right but can\'t stay motivated enough',
              'You are exercising regularly but not seeing satisfying results',
              'You have a medical problem and need diet therapy',
              'You need a customized program that suits your lifestyle',
            ].map((reason, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                key={i}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className="text-4xl font-black text-primary mb-4 transform origin-left group-hover:scale-110 transition-all duration-300">
                  0{i + 1}
                </div>
                <p className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                  {reason}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-xl text-gray-800 font-bold mb-8">
              We have the best nutritionists in Mumbai to help you lose weight naturally.
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#contact"
              className="inline-block px-10 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              Start Your Transformation
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-50 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white shadow-sm rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-6">True Success Stories</div>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">Proof of Transformation</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real results from clients who trusted the process and reclaimed their health.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center flex flex-col items-center justify-center min-h-[160px] hover:-translate-y-1 transition-transform">
              <span className="text-4xl mb-3 block">📉</span>
              <h4 className="font-bold text-gray-900 text-lg leading-tight w-full">Lost 12 kg in 4 months</h4>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center flex flex-col items-center justify-center min-h-[160px] hover:-translate-y-1 transition-transform">
              <span className="text-4xl mb-3 block">🌸</span>
              <h4 className="font-bold text-gray-900 text-lg leading-tight w-full">Improved PCOS symptoms</h4>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center flex flex-col items-center justify-center min-h-[160px] hover:-translate-y-1 transition-transform">
              <span className="text-4xl mb-3 block">🩺</span>
              <h4 className="font-bold text-gray-900 text-lg leading-tight w-full">Reduced sugar levels</h4>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center flex flex-col items-center justify-center min-h-[160px] hover:-translate-y-1 transition-transform">
              <span className="text-4xl mb-3 block">🥗</span>
              <h4 className="font-bold text-emerald-900 text-lg leading-tight w-full">No crash diet</h4>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-white py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -z-10 skew-x-12 transform origin-top-right"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">FAQ</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Questions? We have answers.
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our life-changing nutrition programs.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'How does this program work?',
                a: 'Register with us for at least a 3-month or 6-month program (online or offline). We get in touch within 48 hours to book an appointment. A complete diet and medical history is taken before planning your diet. We check your height, weight, measurements and set your fat loss or wellness targets. Your customized diet plan is modified fortnightly, and we monitor your progress throughout.'
              },
              {
                q: 'Do I have to buy a package or can I do single sessions?',
                a: 'We look for permanent results through lifestyle modifications which cannot be achieved with one diet. You\'ll need constant counseling to educate you about eating right, which takes at least 3 months to become practice. Our minimum package is 3 months, where we monitor your diet, exercise, and lifestyle habits closely.'
              },
              {
                q: 'How much weight will I lose?',
                a: 'We don\'t believe in just "Weight Loss." Instead, we encourage "Fat Loss" or "Inch Loss" which is a better indicator of your health, wellbeing, and fitness. Results vary from individual to individual based on various factors.'
              },
              {
                q: 'How many sessions are included in the 3-month program?',
                a: 'You\'ll get a counseling session every 15 days — 6 sessions in 3 months. Each session lasts around 30 minutes (the first session takes 45 minutes to 1 hour). Continued support, guidance, and motivation are provided throughout the entire tenure.'
              },
              {
                q: 'What if I\'m travelling and can\'t follow the diet?',
                a: 'Don\'t worry! We have special travel diets. Support and guidance will be provided through internet, FaceTime, or SMS during your travel period.'
              },
              {
                q: 'Do you give crash diets?',
                a: 'No! We don\'t believe in crash diets or fad diets. We believe in sustainable lifestyle changes that give you permanent results.'
              },
              {
                q: 'Will I have to starve or eat bland food?',
                a: 'Absolutely not! Our diet plans are designed with foods you love and enjoy. We believe in making healthy eating enjoyable and sustainable, not restrictive or boring.'
              },
              {
                q: 'Can I join the program if I live outside Mumbai?',
                a: 'Yes! You can join our package irrespective of your location and avail our services online through phone, video call, or WhatsApp. We serve clients across the globe.'
              },
            ].map((faq, i) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:border-primary/20 transition-all duration-300"
              >
                <button
                  onClick={() => toggleQuestion(i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-lg text-gray-900 pr-8">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: activeQuestion === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${activeQuestion === i ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: activeQuestion === i ? 'auto' : 0, opacity: activeQuestion === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-6 text-gray-600 font-medium leading-relaxed border-t border-gray-50 pt-4 mt-2">
                    <p>{faq.a}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section className="bg-primary/5 py-24 relative overflow-hidden">
        <div className="absolute -left-32 -bottom-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-400/10 to-transparent rounded-bl-full -z-10"></div>
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-amber-100">Free Resource</div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-6 leading-tight">
                Want a taste of the <span className="italic text-primary">Transformation?</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Download our exclusive <strong>7-Day Indian Fat Loss Diet Guide</strong>. Get science-backed clinical meals using ingredients already in your kitchen, completely free.
              </p>
              <form className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" required className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl w-full focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-gray-900 font-medium" />
                  <input type="tel" placeholder="Phone Number" required className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl w-full focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-gray-900 font-medium" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input type="email" placeholder="Email Address" required className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl w-full focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-gray-900 font-medium" />
                  <button type="button" className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 block shrink-0 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Download Now</span>
                  </button>
                </div>
              </form>
              <p className="text-xs text-gray-400 mt-4 font-medium">*We respect your privacy. No spam ever.</p>
            </div>
            <div className="md:w-2/5 w-full flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-full max-w-sm aspect-[4/5] bg-gradient-to-br from-primary to-green-500 rounded-[2.5rem] p-1.5 flex flex-col items-center justify-center text-white shadow-[0_20px_60px_rgba(16,185,129,0.3)] relative group cursor-pointer"
              >
                <div className="absolute inset-1.5 border border-white/30 rounded-[2.3rem] flex flex-col items-center justify-center p-8 text-center bg-black/10 backdrop-blur-sm group-hover:bg-black/0 transition-colors duration-500 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <span className="text-7xl mb-8 filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">🥗</span>
                  <h4 className="font-bold font-serif text-3xl mb-3 tracking-wide">7-Day Guide</h4>
                  <p className="text-sm text-white font-semibold tracking-widest uppercase opacity-80 border-t border-white/20 pt-4 w-full">Metabolic Reset Edition</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="contact" className="bg-white py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div className="lg:pr-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-gray-200">Apply Now</div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-serif">
                Secure Your Consultation
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                To ensure the highest quality of clinical care and personal access, nutritionist Anjum takes on a strictly limited number of new clients each month. Please fill out the intake assessment accurately.
              </p>
              
              <div className="space-y-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-widest flex items-center gap-2"><span className="text-green-500 text-lg">●</span> Instant Connect</h4>
                  <p className="text-gray-600 mb-5 text-sm leading-relaxed font-medium">Skip the line and message our clinic directly via WhatsApp for quicker responses regarding schedule availability.</p>
                  <a href="https://wa.me/919326230557?text=Hi%20Anjum%27s%20Diet%20Clinic,%20I%20would%20like%20to%20apply%20for%20the%20transformation%20program." target="_blank" rel="noopener" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#128C7E] transition-all shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto justify-center">
                    <span className="text-2xl">💬</span> Message on WhatsApp
                  </a>
                </div>
                <div className="pt-6 border-t border-gray-200/60">
                  <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-widest">📍 The Clinic</h4>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">
                    Office No. 4B, D Wing, Crystal Plaza,<br />
                    Andheri West, Mumbai 400053<br />
                  </p>
                  <a href="mailto:anjumsdiet@gmail.com" className="text-primary font-bold hover:text-primary-dark transition-colors inline-flex items-center gap-2 mt-4">
                    ✉️ anjumsdiet@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-gray-100 p-8 md:p-12 relative lg:-mt-10">
              <div className="absolute -top-4 right-8 bg-gray-900 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-gray-700">
                Official Assessment
              </div>
              <h3 className="text-2xl font-bold font-serif text-gray-900 mb-8 border-b border-gray-100 pb-5">Client Intake Application</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌿</span>
                <div>
                  <h3 className="font-bold text-white">Anjum's</h3>
                  <p className="text-xs text-gray-400">Diet & Wellness</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Mumbai's most trusted nutritionist offering personalized diet programs for lasting health transformations.
              </p>
              <div className="flex gap-3">
                <a href="https://facebook.com/anjumsdiet" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                  <span className="text-lg">f</span>
                </a>
                <a href="https://instagram.com/anjumsdiet" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                  <span className="text-lg">📷</span>
                </a>
                <a href="https://wa.me/919326230557" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-lg">💬</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Our Services</a></li>
                <li><a href="#packages" className="hover:text-white transition-colors">Pricing Packages</a></li>
                <li><a href="#why-us" className="hover:text-white transition-colors">Why Choose Us</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Our Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Weight Loss & Management</li>
                <li>Diabetes Care & Prevention</li>
                <li>Thyroid Management</li>
                <li>PCOS Diet Plans</li>
                <li>Heart & Blood Pressure</li>
                <li>Women's Health</li>
                <li>Fitness & Muscle Building</li>
                <li>Organ Health (Kidney/Liver)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact Info</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span>📍</span>
                  <span>Office No. 4B, D Wing, Crystal Plaza, Andheri West, Mumbai 400053</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <a href="tel:7777072454" className="hover:text-white transition-colors">7777 072 454</a>
                </li>
                <li className="flex items-center gap-2">
                  <span>📱</span>
                  <a href="tel:+919326230557" className="hover:text-white transition-colors">+91 93262 30557</a>
                </li>
                <li className="flex items-center gap-2">
                  <span>✉️</span>
                  <a href="mailto:anjumsdiet@gmail.com" className="hover:text-white transition-colors">anjumsdiet@gmail.com</a>
                </li>
              </ul>
              <div className="mt-4">
                <Link href="/admin/login" className="inline-block px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-sm font-semibold transition-colors">
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Anjum's Diet & Wellness. All rights reserved. | Designed for your health transformation.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/919326230557"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-50"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  )
}
