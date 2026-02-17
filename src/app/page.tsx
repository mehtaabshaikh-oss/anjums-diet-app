'use client'

import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import { useState, useEffect } from 'react'

export default function Home() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)

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
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Anjum's</h1>
                <p className="text-xs text-gray-600">Diet & Wellness</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-gray-700 hover:text-primary font-medium">About</a>
              <a href="#services" className="text-gray-700 hover:text-primary font-medium">Services</a>
              <a href="#packages" className="text-gray-700 hover:text-primary font-medium">Packages</a>
              <a href="#why-us" className="text-gray-700 hover:text-primary font-medium">Why Us</a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary font-medium">Testimonials</a>
              <a href="#faq" className="text-gray-700 hover:text-primary font-medium">FAQ</a>
              <Link href="/client/login" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium">
                Client Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-6 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                Mumbai's Most Trusted Nutritionist
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your Health,<br />
                <span className="text-primary">Transform Your Life</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Personalized nutrition programs designed by Mumbai's best dietician. Achieve lasting results with customized diet plans tailored to your lifestyle.
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                <a href="#contact" className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                  Start Your Journey
                </a>
                <a href="#about" className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors">
                  Learn More
                </a>
              </div>

              {/* Stats Counter */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    <span className="stat-number" data-count="5000">0</span>+
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Happy Clients</div>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    <span className="stat-number" data-count="16">0</span>+
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Specializations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    <span className="stat-number" data-count="10">0</span>+
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Countries Served</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80&auto=format"
                  alt="Fresh healthy food"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-primary/10 rounded-3xl -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80&auto=format"
                alt="Nutritionist consultation"
                className="rounded-2xl shadow-xl relative z-0"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3 z-20">
                <span className="text-3xl">✅</span>
                <div>
                  <div className="font-bold text-gray-900">Certified Nutritionist</div>
                  <div className="text-sm text-gray-600">Personalized Programs</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">About Us</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Your Partner in Health & Wellness
              </h2>
              <p className="text-gray-600 mb-4">
                With changing lifestyles and a quest for better fitness, it has become essential to follow a diet program guided by experts. At Anjum's Diet and Wellness, our team of dieticians and nutritionists analyze your lifestyle and chart out a customized diet plan for your individual needs to help you reach your target results permanently.
              </p>
              <p className="text-gray-600 mb-6">
                We offer one-to-one personalized nutrition programs both in India and online for clients worldwide — including USA, UK, Australia, Singapore, UAE, Saudi Arabia, and Italy. We've designed packages to suit every budget.
              </p>
                  <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: '🎯', title: 'Customized Plans', desc: 'Tailored to your lifestyle' },
                  { icon: '🌍', title: 'Online & Offline', desc: 'Available worldwide' },
                  { icon: '📈', title: 'Permanent Results', desc: 'Sustainable approach' },
                  { icon: '🤝', title: 'Ongoing Support', desc: 'Throughout your journey' },
                ].map((feature, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{feature.icon}</span>
                      <div className="font-bold text-gray-900">{feature.title}</div>
                    </div>
                    <div className="text-sm text-gray-600">{feature.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">Our Expertise</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Specialized Nutrition Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide expert dietary guidance for a wide range of health conditions and fitness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '⚖️', title: 'Weight Management', desc: 'Effective programs for obesity and overweight conditions with sustainable fat loss.' },
              { icon: '💪', title: 'Muscle Building', desc: 'Diet plans for gaining muscle mass and optimizing results from weight training.' },
              { icon: '🧬', title: 'Diabetes Care', desc: 'Specialized nutrition therapy for managing blood sugar levels effectively.' },
              { icon: '🦋', title: 'Thyroid Problems', desc: 'Dietary management for thyroid conditions to support metabolic health.' },
              { icon: '❤️', title: 'Heart & BP', desc: 'Nutrition plans for hypertension, low BP, heart problems, and high cholesterol.' },
              { icon: '🏋️', title: 'Fitness Goals', desc: 'Get your dream beach body or six pack abs with targeted nutrition plans.' },
              { icon: '👩‍⚕️', title: "Women's Health", desc: 'Expert care for PMS, menopausal problems, and Polycystic Ovarian Disease (PCOS).' },
              { icon: '🫀', title: 'Organ Health', desc: 'Dietary support for kidney issues (CKD, high creatinine, gout) and liver problems (fatty liver).' },
            ].map((service, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <span className="text-3xl block mb-3">{service.icon}</span>
                <h4 className="font-bold text-gray-900 mb-2">{service.title}</h4>
                <p className="text-sm text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">Pricing</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Nutrition Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the program that's right for you. All packages include personalized diet plans, regular follow-ups, and continuous support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Gold',
                label: 'Gold Nutrition Program',
                description: 'Enroll under Anjum Shaikh\'s Team of Nutritionists and Dieticians',
                color: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                featured: false,
                plans: [
                  { duration: '3 Months', sessions: '6 sessions', price: '₹45,000' },
                  { duration: '6 Months', sessions: '12 sessions', price: '₹72,000' },
                  { duration: '9 Months', sessions: '18 sessions', price: '₹85,000' },
                  { duration: '1 Year', sessions: '24 sessions', price: '₹98,000' },
                ],
              },
              {
                name: 'Hybrid',
                label: 'Hybrid Nutrition Program',
                description: 'Combo program with 1 session with Anjum Shaikh & alternate session with her team every month',
                color: 'bg-gradient-to-b from-primary to-primary-dark',
                borderColor: 'border-primary',
                featured: true,
                plans: [
                  { duration: '3 Months', sessions: '6 sessions', price: '₹54,000' },
                  { duration: '6 Months', sessions: '12 sessions', price: '₹85,000' },
                  { duration: '9 Months', sessions: '18 sessions', price: '₹98,000' },
                  { duration: '1 Year', sessions: '24 sessions', price: '₹1,15,000' },
                ],
              },
              {
                name: 'Platinum',
                label: 'Platinum Nutrition Program',
                description: 'Premium diet programs directly with Nutritionist Anjum Shaikh',
                color: 'bg-purple-50',
                borderColor: 'border-purple-200',
                featured: false,
                plans: [
                  { duration: '3 Months', sessions: '6 sessions', price: '₹65,000' },
                  { duration: '6 Months', sessions: '12 sessions', price: '₹98,000' },
                  { duration: '9 Months', sessions: '18 sessions', price: '₹1,10,000' },
                  { duration: '1 Year', sessions: '24 sessions', price: '₹1,50,000' },
                ],
              },
            ].map((pkg, i) => (
              <div
                key={i}
                className={`rounded-xl p-8 border-2 transition-all ${
                  pkg.featured
                    ? `${pkg.color} text-white shadow-lg`
                    : `${pkg.color} border-gray-200`
                }`}
              >
                {pkg.featured && (
                  <span className="inline-block mb-4 px-4 py-1 bg-amber-400 text-gray-900 text-xs font-bold rounded-full">
                    MOST POPULAR
                  </span>
                )}

                <div className={pkg.featured ? 'text-white' : ''}>
                  <p className={`text-sm font-semibold uppercase tracking-wider mb-1 ${pkg.featured ? 'text-white/80' : 'text-gray-500'}`}>
                    {pkg.name}
                  </p>
                  <h3 className={`text-2xl font-bold mb-2 ${pkg.featured ? 'text-white' : 'text-gray-900'}`}>
                    {pkg.label}
                  </h3>
                  <p className={`text-sm mb-6 ${pkg.featured ? 'text-white/90' : 'text-gray-600'}`}>
                    {pkg.description}
                  </p>
                </div>

                <div className={`space-y-3 ${pkg.featured ? 'border-white/20' : 'border-gray-200'} border-y py-6 mb-6`}>
                  {pkg.plans.map((plan, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className={`font-semibold ${pkg.featured ? 'text-white' : 'text-gray-900'}`}>
                          {plan.duration}
                        </p>
                        <p className={`text-sm ${pkg.featured ? 'text-white/70' : 'text-gray-600'}`}>
                          {plan.sessions}
                        </p>
                      </div>
                      <p className={`font-bold text-lg ${pkg.featured ? 'text-amber-300' : 'text-primary'}`}>
                        {plan.price}
                      </p>
                    </div>
                  ))}
                </div>

                <a
                  href="#contact"
                  className={`block text-center py-3 rounded-lg font-semibold transition-all ${
                    pkg.featured
                      ? 'bg-white text-primary hover:bg-gray-100'
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="bg-gradient-to-br from-green-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">Why Choose Us</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Is This Program Right For You?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              If any of the following resonate with you, our personalized program is exactly what you need.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
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
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl font-bold text-primary mb-3">0{i + 1}</div>
                <p className="text-gray-700 text-sm">{reason}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xl text-gray-800 mb-6">
              We have the best nutritionists in Mumbai to help you lose weight naturally.
            </p>
            <a href="#contact" className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Start Your Transformation
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">Testimonials</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Happy Clients</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real stories from real people who transformed their lives with Anjum's Diet & Wellness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
              <div className="text-3xl text-amber-400 mb-4">★★★★★</div>
              <div className="space-y-4 text-gray-700 mb-6">
                <p>
                  Anjum has been primarily responsible for keeping my sugar levels in check and help me lead a more healthy, energetic lifestyle. I was diagnosed with high sugar levels in 2005 and was on medication for over 3 years until I met Anjum.
                </p>
                <p>
                  Over the last 3 years, I am completely off medication, lost 6 kgs, 4 inches off my waist and look and feel much younger. I have recommended her to several of my friends who are very happy with her dedication to her profession.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                  VS
                </div>
                <div>
                  <div className="font-bold text-gray-900">Vikaas Sachdeva</div>
                  <div className="text-sm text-gray-600">Diabetes Management</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
              <div className="text-3xl text-amber-400 mb-4">★★★★★</div>
              <div className="space-y-4 text-gray-700 mb-6">
                <p>
                  After giving birth I was 82 kgs. My life had become very dull. After joining the diet program with Anjum, I am 53 kgs now! I feel great because I stand out in the crowd. When I go shopping I look for size XS instead of XL.
                </p>
                <p>
                  Anjum through regular counselling sessions encouraged me to eat healthy at various intervals. Simple home cooked food helped me lose so much weight. I've shed pounds and gained immense confidence!
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                  RS
                </div>
                <div>
                  <div className="font-bold text-gray-900">Ritika Sarin</div>
                  <div className="text-sm text-gray-600">Weight Loss — Lost 29 kgs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">FAQ</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Nutrition is for life. We need to eat right irrespective of our health conditions, age, activity, and weight.
            </p>
          </div>

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
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleQuestion(i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <span className="text-2xl text-primary">
                    {activeQuestion === i ? '−' : '+'}
                  </span>
                </button>
                {activeQuestion === i && (
                  <div className="px-6 pb-5 text-gray-600">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="text-primary font-semibold mb-2 uppercase tracking-wide text-sm">Get In Touch</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Start Your Wellness Journey?
              </h2>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">📍 Visit Us</h4>
                  <p className="text-gray-600">
                    Office No. 4B, D Wing, Crystal Plaza,<br />
                    Andheri West, Mumbai 400053
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">📞 Call Us</h4>
                  <p className="text-gray-600">
                    <a href="tel:7777072454" className="hover:text-primary">7777 072 454</a><br />
                    <a href="tel:+919326230557" className="hover:text-primary">+91 93262 30557</a>
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">✉️ Email Us</h4>
                  <p className="text-gray-600">
                    <a href="mailto:anjumsdiet@gmail.com" className="hover:text-primary">
                      anjumsdiet@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
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
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  )
}
