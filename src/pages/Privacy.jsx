import React from 'react'

export default function Privacy(){
  return (
    <main className="prose max-w-none mx-auto p-6 md:p-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-slate-700">Effective date: November 10, 2025</p>
        <p className="mt-3 text-slate-600">This Privacy Policy explains what personal data PixelPact collects, how we use it, and the choices you have. We keep this short and practical — if you need more detail, contact us (details below).</p>
      </header>

      <nav aria-label="On this page" className="my-4">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li><a href="#summary" className="text-sky-600">Quick summary</a></li>
          <li><a href="#what-we-collect" className="text-sky-600">Data we collect</a></li>
          <li><a href="#how-we-use" className="text-sky-600">How we use it</a></li>
          <li><a href="#cookies" className="text-sky-600">Cookies</a></li>
          <li><a href="#security" className="text-sky-600">Security</a></li>
          <li><a href="#rights" className="text-sky-600">Your rights</a></li>
          <li><a href="#contact" className="text-sky-600">Contact</a></li>
        </ul>
      </nav>

      <section id="summary">
        <h2 className="text-2xl font-semibold">Quick summary</h2>
        <ul>
          <li>We use your data to operate and improve PixelPact.</li>
          <li>We do not sell personal information.</li>
          <li>Authentication uses secure, httpOnly cookies; we protect against CSRF with a double-submit token.</li>
          <li>You can request access, correction, deletion, or portability where applicable.</li>
        </ul>
      </section>

      <section id="what-we-collect">
        <h2 className="text-2xl font-semibold">1. Data we collect</h2>
        <p className="text-slate-700">We collect the minimum data necessary to provide and improve the service. Typical categories include:</p>
        <ul>
          <li><strong>Account data:</strong> name, email, hashed password, profile information.</li>
          <li><strong>User content:</strong> testimonials, board/whiteboard contents, uploads and any content you submit.</li>
          <li><strong>Usage data:</strong> IP address, device/browser metadata, logs, pages visited and feature usage.</li>
          <li><strong>Payment & billing:</strong> handled by third-party processors; we store only minimal billing metadata unless otherwise stated.</li>
        </ul>
      </section>

      <section id="how-we-use">
        <h2 className="text-2xl font-semibold">2. How we use personal data</h2>
        <p className="text-slate-700">We use data for:</p>
        <ul>
          <li>Providing and improving the service (auth, sync, storage).</li>
          <li>Security, fraud detection and abuse prevention.</li>
          <li>Customer support and account management.</li>
          <li>Analytics and performance monitoring (aggregated where possible).</li>
        </ul>
        <p className="text-slate-700">Legal bases for processing may include consent, contract performance, legitimate interests, and compliance with legal obligations (where applicable).</p>
      </section>

      <section id="sharing">
        <h2 className="text-2xl font-semibold">3. Sharing & third parties</h2>
        <p className="text-slate-700">We do not sell personal information. We may share data with:</p>
        <ul>
          <li><strong>Service providers:</strong> hosting, analytics, email, payment processors — only to the extent necessary and under contract.</li>
          <li><strong>Legal requests:</strong> to comply with the law or protect rights and safety.</li>
          <li><strong>Business transfers:</strong> in the event of a merger or sale; we'll notify users where required.</li>
        </ul>
      </section>

      <section id="cookies">
        <h2 className="text-2xl font-semibold">4. Cookies & tracking</h2>
        <p className="text-slate-700">We use cookies for session management, essential site features, and analytics. Below are common categories:</p>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Type</th>
              <th className="text-left">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Essential</td>
              <td>Session cookies for authentication and CSRF protection (httpOnly + readable csrf token cookie).</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>Anonymous usage metrics to improve product quality (third-party analytics).</td>
            </tr>
            <tr>
              <td>Functional</td>
              <td>User preferences and UI settings.</td>
            </tr>
          </tbody>
        </table>
        <p className="text-slate-700 mt-3">You can control cookies using your browser settings. Blocking essential cookies may prevent the site from functioning correctly.</p>
      </section>

      <section id="security">
        <h2 className="text-2xl font-semibold">5. Security</h2>
        <p className="text-slate-700">We protect data in transit with TLS (HTTPS) and take industry-standard measures to protect data at rest and in operation. Access to production systems is restricted, and we use monitored logging and rate limits. No system is perfectly secure — if you suspect a breach, contact us immediately.</p>
      </section>

      <section id="retention">
        <h2 className="text-2xl font-semibold">6. Data retention</h2>
        <p className="text-slate-700">We retain personal data only as long as necessary to provide the service, comply with legal obligations, or resolve disputes. When data is no longer required we securely delete or anonymize it.</p>
      </section>

      <section id="rights">
        <h2 className="text-2xl font-semibold">7. Your rights</h2>
        <p className="text-slate-700">Depending on your jurisdiction you may have the right to access, correct, delete, or export your personal data, and to object to or restrict processing. To exercise these rights contact us at the address below.</p>
      </section>

      <section id="international">
        <h2 className="text-2xl font-semibold">8. International transfers</h2>
        <p className="text-slate-700">PixelPact operates internationally and may process data in jurisdictions with different laws. We use appropriate safeguards for transfers, such as standard contractual clauses, where required.</p>
      </section>

      <section id="children">
        <h2 className="text-2xl font-semibold">9. Children's privacy</h2>
        <p className="text-slate-700">The Service is not directed at children under 13 (or higher minimum age where required). We do not knowingly collect personal information from children; if you believe we have, please contact us to request removal.</p>
      </section>

      <section id="changes">
        <h2 className="text-2xl font-semibold">10. Changes to this policy</h2>
        <p className="text-slate-700">We may update this policy periodically. For material changes we will provide notice by email or a prominent site banner. The effective date at the top reflects the most recent update.</p>
      </section>

      <section id="contact">
        <h2 className="text-2xl font-semibold">11. Contact</h2>
        <p className="text-slate-700">Questions or requests: <a href="mailto:privacy@pixelpact.example" className="text-sky-600">abhirajgautam28@gmail.com</a>.</p>
      </section>
    </main>
  )
}
