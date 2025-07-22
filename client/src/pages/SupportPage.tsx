// src/pages/SupportPage.tsx
import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { chatAPI } from '../services/api'
import { motion } from 'framer-motion'
import { ChevronDown, Mail, MessageCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const faqs = [
  {
    question: 'How do I reset my password?',
    answer:
      'Go to your profile page, click “Change Password,” and follow the prompts. You’ll need to enter your current password first.',
  },
  {
    question: 'How can I update my fitness level?',
    answer:
      'On your profile page click “Edit Profile” and choose a new Fitness Level from the dropdown. Don’t forget to save!',
  },
  {
    question: 'Where can I find my workout history?',
    answer:
      'Head to your Dashboard → Progress Tracker. There you’ll see all past workouts, stats, and trends.',
  },
]

const directContacts = [
  { email: 'admin@techtrainers.ca', purpose: 'General administration inquiries' },
  { email: 'bookings@techtrainers.ca', purpose: 'Booking and scheduling' },
  { email: 'meetings@techtrainers.ca', purpose: 'Meeting requests' },
  { email: 'noreply@techtrainers.ca', purpose: 'Automated notifications (no replies)' },
  { email: 'support@techtrainers.ca', purpose: 'Technical support & troubleshooting' },
  { email: 'trainers@techtrainers.ca', purpose: 'Trainer-specific inquiries' },
]

const SupportPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setStatus('sending')
      await chatAPI.sendMessage({
        to: 'support@techtrainers.ca',
        from: email,
        subject,
        body: message,
      })
      setStatus('success')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      console.error('Support ticket failed:', err)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-inter">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Support & <span className="text-teal-400">Help</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-stone-200 max-w-3xl mx-auto">
                Get the help you need to maximize your TechTrainer experience. We're here to support your fitness journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="#contact-form"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Submit a Ticket
                </Link>
                <Link
                  to="/"
                  className="border-2 border-white hover:bg-white hover:text-stone-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 space-y-20">

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Find quick answers to common questions about using TechTrainer.
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                className="bg-white p-6 rounded-xl shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <summary className="cursor-pointer flex justify-between items-center font-semibold text-lg hover:text-teal-600 transition-colors">
                  {faq.question}
                  <ChevronDown className="w-5 h-5" />
                </summary>
                <p className="mt-4 text-stone-600 leading-relaxed">{faq.answer}</p>
              </motion.details>
            ))}
          </div>
        </section>

        {/* Direct Contacts */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Direct Contact Emails</h2>
            <p className="text-xl text-stone-600">
              Reach out directly to our specialized teams for faster support.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-100">
                <tr>
                  <th className="px-6 py-4 text-lg font-semibold text-stone-800">Email Address</th>
                  <th className="px-6 py-4 text-lg font-semibold text-stone-800">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {directContacts.map((contact, i) => (
                  <motion.tr 
                    key={i} 
                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-stone-50'} hover:bg-teal-50 transition-colors`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <td className="px-6 py-4">
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-teal-600 hover:text-teal-700 font-semibold flex items-center transition-colors"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {contact.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{contact.purpose}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ticket Submission Form */}
        <section id="contact-form">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Submit a Ticket</h2>
            <p className="text-xl text-stone-600">
              Can't find what you're looking for? Send us a message and we'll get back to you.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <motion.form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-2xl shadow-lg space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {status === 'error' && (
                <div className="text-red-700 bg-red-100 p-4 rounded-lg">
                  Something went wrong. Please try again.
                </div>
              )}
              {status === 'success' && (
                <div className="text-green-700 bg-green-100 p-4 rounded-lg">
                  Your request has been sent! 🎉
                </div>
              )}

              <div>
                <label className="block text-lg font-semibold text-stone-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-2 border-stone-300 rounded-lg px-4 py-3 text-lg focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-stone-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full border-2 border-stone-300 rounded-lg px-4 py-3 text-lg focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="Issue summary"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-stone-700 mb-2">
                  Message
                </label>
                <textarea
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full border-2 border-stone-300 rounded-lg px-4 py-3 text-lg h-40 resize-none focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="Describe your issue or question in detail…"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className={`w-full px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                  status === 'sending'
                    ? 'bg-teal-500 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {status === 'sending' ? 'Sending…' : 'Send Request'}
              </button>
            </motion.form>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default SupportPage
