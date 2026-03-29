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
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <img 
                src="/Anjumsdietlogo.avif" 
                alt="Anjum's Diet Logo" 
                className="h-10 md:h-12 w-auto object-contain rounded-xl"
              />
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
                className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-amber-50 border border-amber-100/50 rounded-full text-sm font-bold shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
              >
                <span className="text-amber-700 tracking-wide">If you’ve tried multiple diets and nothing worked long-term, this is for you</span>
              </motion.div>

              <motion.h1
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="text-5xl md:text-[4.8rem] font-extrabold text-gray-900 mb-6 leading-[1.05] tracking-tight"
              >
                Get a personalized Indian diet plan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600 italic font-serif">that actually works.</span>
              </motion.h1>

              <motion.h2
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="text-2xl md:text-3xl font-bold text-gray-700 mb-6 leading-relaxed max-w-2xl"
              >
                For weight loss, PCOS, and long-term health without giving up home food
              </motion.h2>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="text-xl md:text-2xl font-black text-gray-900 mb-6 italic border-l-4 border-primary pl-6 py-1"
              >
                Finally lose weight without giving up the food you love.
              </motion.p>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="text-lg font-extrabold text-gray-600 mb-10 inline-block px-5 py-2.5 bg-gray-100/80 rounded-xl border border-gray-200"
              >
                22+ years experience helping 500+ clients
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                className="flex flex-col items-start gap-4 mb-16"
              >
                <a href="#contact" className="group relative inline-flex items-center justify-center px-14 py-6 font-bold text-white bg-primary rounded-full overflow-hidden hover:scale-[1.03] transition-all duration-300 shadow-[0_12px_45px_rgba(16,185,129,0.35)] text-2xl tracking-wide w-full md:w-auto text-center border-b-4 border-emerald-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">Get Your Custom Diet Plan <span className="group-hover:translate-x-1 transition-transform">→</span></span>
                </a>
                <div className="space-y-1.5 ml-4">
                  <p className="text-base font-black text-gray-500 flex items-center gap-2"><span className="text-amber-500 text-xl">⚡</span> Takes less than 2 minutes</p>
                  <p className="text-sm font-bold text-gray-400 italic">Answer a few quick questions and get your personalized plan</p>
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
                  src="/Dietitian-Nutritionist-AnjumShaikh-Mumbai.jpg"
                  alt="Anjum Shaikh - Founder and Clinical Nutritionist"
                  className="w-full object-cover aspect-[4/5] rounded-[2rem]"
                />

              </div>

              {/* Decorative Blur Orbs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/30 via-emerald-400/20 to-yellow-300/30 rounded-full blur-[80px] -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Positioning Section (Above the fold/just below hero) */}
      <section className="bg-white py-12 border-b border-gray-100 relative z-20 -mt-10 lg:-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-bold text-gray-400 uppercase tracking-widest text-sm mb-8">Real results from real clients</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="bg-white py-12 px-6 rounded-[2.5rem] border border-gray-200 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center flex flex-col justify-center min-h-[180px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-500">
              <div className="font-black text-4xl md:text-5xl tracking-tight text-gray-900 mb-3 leading-tight">12 kg lost</div>
              <p className="font-bold text-gray-400 text-sm uppercase tracking-widest">in 4 months</p>
            </div>
            <div className="bg-white py-12 px-6 rounded-[2.5rem] border border-gray-200 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center flex flex-col justify-center min-h-[180px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-500">
              <div className="font-black text-3xl md:text-4xl tracking-tight text-gray-900 mb-3 leading-tight">PCOS improved</div>
              <p className="font-bold text-gray-400 text-sm uppercase tracking-widest">regular cycles in 3 months</p>
            </div>
            <div className="bg-white py-12 px-6 rounded-[2.5rem] border border-gray-200 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center flex flex-col justify-center min-h-[180px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-500">
              <div className="font-black text-3xl md:text-4xl tracking-tight text-gray-900 mb-3 leading-tight">Reduced sugar levels</div>
              <p className="font-bold text-gray-400 text-sm uppercase tracking-widest">better energy and control</p>
            </div>
            <div className="bg-emerald-50 py-12 px-6 rounded-[2.5rem] border border-emerald-100 shadow-[0_12px_40px_rgba(16,185,129,0.1)] text-center flex flex-col justify-center min-h-[180px] hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all duration-500">
              <div className="font-black text-3xl md:text-4xl tracking-tight text-emerald-900 mb-3 leading-tight">Eating home food</div>
              <p className="font-bold text-emerald-700/60 text-sm uppercase tracking-widest">no crash diets</p>
            </div>
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
                src="/anjum-shaikh-1.jpg"
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
              className="lg:pl-8"
            >
              <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Why clients trust Anjum
              </motion.h2>
              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-lg text-gray-600 mb-8 leading-relaxed">
                With over 22 years of experience, Anjum has helped hundreds of clients transform their health using practical, Indian diet plans that are easy to follow and sustainable long term.
              </motion.p>
              
              <motion.ul variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4 mb-10">
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span>
                  <span className="text-gray-700 font-medium text-lg">Specialized in PCOS, weight loss, and lifestyle conditions</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span>
                  <span className="text-gray-700 font-medium text-lg">Focus on real food, not restrictive diets</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span>
                  <span className="text-gray-700 font-medium text-lg">Continuous guidance and plan adjustments</span>
                </li>
              </motion.ul>

              <motion.a 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                href="#contact" 
                className="inline-block px-10 py-5 font-bold text-white bg-primary rounded-full hover:bg-emerald-600 transition-colors shadow-[0_8px_30px_rgba(16,185,129,0.3)] text-lg"
              >
                Get Your Custom Diet Plan
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section id="differentiation" className="bg-gray-50 py-24 overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why this works when other diets fail
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { icon: '🥗', title: 'Built for Indian food and lifestyle' },
              { icon: '🚫', title: 'No calorie counting required' },
              { icon: '❌', title: 'No starvation or crash diets' },
              { icon: '🎯', title: 'Focus on long-term results' }
            ].map((diff, i) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={i}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                  {diff.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-xl leading-tight">{diff.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="bg-white py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Personalized Nutrition Programs</h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-[2.5rem] bg-[#0E1525] overflow-hidden shadow-2xl"
            >
              <div className="p-10 md:p-14 md:flex gap-12 items-center">
                <div className="md:w-3/5 text-left text-white mb-10 md:mb-0">
                  <ul className="space-y-6 mb-8">
                    {[
                      'Custom plans based on your body, lifestyle, and goals',
                      'Ongoing support and accountability',
                      'Regular tracking and adjustments'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shrink-0">✓</span>
                        <span className="text-white/90 font-medium text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                  <div className="md:w-2/5 md:border-l border-white/10 md:pl-12 text-left">
                    <div className="mb-10 space-y-4">
                      <p className="text-white font-black text-4xl md:text-5xl leading-tight">
                        Programs start from ₹45,000
                      </p>
                      <p className="text-amber-400 font-extrabold text-xl leading-relaxed">
                        Less than ₹700 per day for a complete health transformation
                      </p>
                      <p className="text-white/40 text-sm font-medium italic">
                        Personalized based on your goals and level of support
                      </p>
                    </div>
                    
                    <a href="#contact" className="group relative block w-full text-center py-6 rounded-full font-black bg-primary text-white hover:bg-emerald-600 hover:scale-[1.03] transition-all duration-300 shadow-[0_12px_40px_rgba(16,185,129,0.4)] text-xl mb-6">
                      Get Your Custom Diet Plan
                    </a>
                    <p className="text-center text-sm font-bold text-white/50 leading-relaxed max-w-xs mx-auto">
                      Answer a few quick questions and get your personalized plan
                    </p>
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
            className="text-center bg-gray-900 px-6 py-20 rounded-[3rem] mt-16 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
            <div className="relative z-10 py-16">
              <h2 className="text-4xl md:text-6xl text-white font-black mb-10 leading-tight">
                Ready to transform your health?
              </h2>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#contact"
                className="inline-block px-14 py-7 bg-primary text-white rounded-full font-black hover:bg-emerald-600 shadow-[0_15px_50px_rgba(16,185,129,0.4)] transition-all duration-300 mb-10 text-2xl tracking-wide border-b-4 border-emerald-700"
              >
                Get Your Custom Diet Plan
              </motion.a>
              <div className="flex flex-col items-center gap-4">
                <p className="text-white/90 font-black text-xl tracking-wide uppercase">Limited clients accepted each month</p>
                <div className="h-px w-24 bg-primary/30"></div>
                <p className="text-white/60 font-medium text-lg italic">Answer a few quick questions and get your personalized plan</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats Strip */}
      <section className="bg-gray-900 py-16 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-800 text-center">
            <div className="pt-6 md:pt-0 px-4">
              <div className="text-3xl md:text-4xl font-black text-white mb-2">22+</div>
              <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">years experience</div>
            </div>
            <div className="pt-6 md:pt-0 px-4">
              <div className="text-3xl md:text-4xl font-black text-white mb-2">500+</div>
              <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">clients</div>
            </div>
            <div className="pt-6 md:pt-0 px-4 flex flex-col justify-center items-center">
              <div className="text-sm font-medium text-emerald-400 uppercase tracking-widest leading-relaxed max-w-[200px]">Personalized plans for every body</div>
            </div>
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
                  <a href="https://wa.me/919326230557?text=I%20want%20to%20apply%20for%20the%20diet%20program" target="_blank" rel="noopener" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#128C7E] transition-all shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto justify-center">
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
              <div className="flex items-center gap-2 mb-4 bg-white/95 rounded-2xl px-3 py-2 w-fit">
                <img src="/Anjumsdietlogo.avif" alt="Anjum's Diet Logo" className="h-10 w-auto object-contain rounded-lg" />
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
