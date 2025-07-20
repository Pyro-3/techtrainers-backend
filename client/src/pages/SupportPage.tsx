// src/pages/SupportPage.tsx
import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { chatAPI } from '../services/api'

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
    <>
      <Header />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl space-y-12">
          <h1 className="text-3xl font-bold text-stone-800">Support & FAQs</h1>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium">{faq.question}</p>
                  <p className="mt-2 text-stone-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Direct Contacts */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Direct Contact Emails</h2>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-stone-100">
                  <tr>
                    <th className="px-4 py-2">Email Address</th>
                    <th className="px-4 py-2">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {directContacts.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <td className="px-4 py-2">
                        <a
                          href={`mailto:${c.email}`}
                          className="text-amber-700 hover:underline"
                        >
                          {c.email}
                        </a>
                      </td>
                      <td className="px-4 py-2 text-stone-600">{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Ticket Submission Form */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Submit a Ticket</h2>
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-xl shadow-sm space-y-4"
            >
              {status === 'error' && (
                <div className="text-red-700 bg-red-100 p-2 rounded">
                  Something went wrong. Please try again.
                </div>
              )}
              {status === 'success' && (
                <div className="text-green-700 bg-green-100 p-2 rounded">
                  Your request has been sent! 🎉
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-stone-300 rounded px-3 py-2 mt-1"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full border border-stone-300 rounded px-3 py-2 mt-1"
                  placeholder="Issue summary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Message
                </label>
                <textarea
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full border border-stone-300 rounded px-3 py-2 mt-1 h-32 resize-none"
                  placeholder="Describe your issue or question in detail…"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className={`inline-block px-6 py-2 rounded-lg text-white font-medium ${
                  status === 'sending'
                    ? 'bg-amber-500'
                    : 'bg-amber-700 hover:bg-amber-800'
                } transition`}
              >
                {status === 'sending' ? 'Sending…' : 'Send Request'}
              </button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default SupportPage
