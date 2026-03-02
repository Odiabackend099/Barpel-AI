import { Mail, Linkedin, Twitter } from 'lucide-react';
import Navigation from '@/sections/Navigation';
import Footer from '@/sections/Footer';

export default function Contact() {
  return (
    <>
      <Navigation />
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#102A33] mb-4">Contact Us</h1>
          <p className="text-lg text-[#6B7280] mb-12">
            Have questions? We'd love to hear from you. Reach out and we'll respond within 24 hours.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Email */}
            <div className="bg-[#E8F5F2] rounded-2xl p-8">
              <Mail className="w-8 h-8 text-[#37A195] mb-4" />
              <h3 className="text-lg font-bold text-[#102A33] mb-2">Email</h3>
              <p className="text-[#6B7280] mb-2">General inquiries:</p>
              <a href="mailto:hello@barpel.ai" className="text-[#37A195] font-semibold hover:underline">
                hello@barpel.ai
              </a>
              <p className="text-[#6B7280] mt-4 mb-2">Sales:</p>
              <a href="mailto:sales@barpel.ai" className="text-[#37A195] font-semibold hover:underline">
                sales@barpel.ai
              </a>
            </div>

            {/* Social */}
            <div className="bg-[#F9FAFB] rounded-2xl p-8">
              <h3 className="text-lg font-bold text-[#102A33] mb-4">Follow Us</h3>
              <div className="flex flex-col gap-3">
                <a
                  href="https://twitter.com/barpelai"
                  className="flex items-center gap-3 text-[#6B7280] hover:text-[#37A195] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span>@barpelai</span>
                </a>
                <a
                  href="https://linkedin.com/company/barpel-ai"
                  className="flex items-center gap-3 text-[#6B7280] hover:text-[#37A195] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>Barpel AI</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#102A33] mb-6">Send us a message</h2>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#102A33] mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#37A195] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#102A33] mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#37A195] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#102A33] mb-2">Company</label>
                <input
                  type="text"
                  placeholder="Your company"
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#37A195] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#102A33] mb-2">Message</label>
                <textarea
                  placeholder="Tell us how we can help..."
                  rows={5}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#37A195] focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#37A195] text-white rounded-lg font-semibold hover:bg-[#2F8E88] transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          <p className="text-center text-[#6B7280] text-sm mt-8">
            We typically respond within 1 business day.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
