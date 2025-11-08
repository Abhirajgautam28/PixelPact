import React from 'react'

export default function Privacy(){
  return (
    <main className="prose max-w-none mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-slate-700">Effective date: November 8, 2025</p>

      <nav aria-label="On this page" className="my-4">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li><a href="#what-we-collect" className="text-sky-600">What we collect</a></li>
          <li><a href="#how-we-use" className="text-sky-600">How we use it</a></li>
          <li><a href="#cookies" className="text-sky-600">Cookies</a></li>
          <li><a href="#security" className="text-sky-600">Security</a></li>
          <li><a href="#rights" className="text-sky-600">Your rights</a></li>
          <li><a href="#contact" className="text-sky-600">Contact</a></li>
        </ul>
      </nav>

      <section id="what-we-collect">
        <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
        <p className="text-slate-700">We collect information to provide, improve, and protect our service. The main categories are:</p>
        <ul>
          <li><strong>Account information:</strong> name, email, password (hashed), profile info when you create an account.</li>
          <li><strong>User content:</strong> anything you post, upload or submit while using the service (for example, testimonials or whiteboard content).</li>
          <li><strong>Usage data:</strong> logs, pages visited, feature usage, IP address, device and browser information.</li>
          <li><strong>Payment data:</strong> (only for paid features) billing details handled by our payment processor — we do not store full payment card numbers on our servers.</li>
        </ul>
      </section>

      <section id="how-we-use">
        <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain the service and deliver requested features.</li>
          <li>To respond to support requests and communicate account or policy changes.</li>
          <li>To analyze usage and improve the product (analytics and A/B testing).</li>
          <li>To detect, prevent and address technical issues and abuse.</li>
        </ul>
      </section>

      <section id="sharing">
        <h2 className="text-2xl font-semibold">3. Sharing and Disclosure</h2>
        <p className="text-slate-700">We do not sell your personal information. We may share data with:</p>
        <ul>
          <li><strong>Service providers:</strong> trusted third parties who perform services on our behalf (hosting, analytics, payments).</li>
          <li><strong>Legal requests:</strong> when required by law or to protect rights and safety.</li>
          <li><strong>Business transfers:</strong> in the event of a merger, acquisition, or asset sale (you will be notified).</li>
        </ul>
      </section>

      <section id="cookies">
        <h2 className="text-2xl font-semibold">4. Cookies & Tracking</h2>
        <p className="text-slate-700">We use cookies and similar technologies for essential site functionality, authentication, and analytics. You can control most cookies via your browser settings. Third-party services we use (for example analytics and embedded content) may also set cookies.</p>
      </section>

      <section id="security">
        <h2 className="text-2xl font-semibold">5. Security</h2>
        <p className="text-slate-700">We take reasonable measures to protect data in transit and at rest, including HTTPS, access controls, and encryption where appropriate. No system is completely secure — if you believe your account has been compromised, contact us immediately (see Contact below).</p>
      </section>

      <section id="retention">
        <h2 className="text-2xl font-semibold">6. Data Retention</h2>
        <p className="text-slate-700">We retain personal data for as long as needed to provide the service, meet legal obligations, resolve disputes, and enforce our agreements. When data is no longer required we delete or anonymize it.</p>
      </section>

      <section id="rights">
        <h2 className="text-2xl font-semibold">7. Your Rights</h2>
        <p className="text-slate-700">Depending on your jurisdiction you may have rights to access, correct, delete, or export your personal data, and to object to certain processing. To exercise these rights contact us (see Contact).</p>
      </section>

      <section id="children">
        <h2 className="text-2xl font-semibold">8. Children's Privacy</h2>
        <p className="text-slate-700">Our service is not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have collected data from a child, contact us so we can delete it.</p>
      </section>

      <section id="third-party">
        <h2 className="text-2xl font-semibold">9. Third-Party Links</h2>
        <p className="text-slate-700">Our service may contain links to third-party sites. We are not responsible for their privacy practices. Review third-party policies before sharing personal information.</p>
      </section>

      <section id="changes">
        <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
        <p className="text-slate-700">We may update this policy occasionally. If changes are material we will provide notice (for example by email or a prominent banner). The effective date at the top reflects the last update.</p>
      </section>

      <section id="contact">
        <h2 className="text-2xl font-semibold">11. Contact</h2>
        <p className="text-slate-700">If you have questions or requests regarding this policy, please contact: <a href="mailto:support@your-domain.example" className="text-sky-600">support@your-domain.example</a>. Replace this address with your preferred contact.</p>
      </section>
    </main>
  )
}
