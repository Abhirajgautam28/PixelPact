import React from 'react'

export default function Terms(){
  return (
    <main className="prose max-w-none mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-slate-700">Last updated: November 8, 2025</p>

      <nav aria-label="On this page" className="my-4">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li><a href="#acceptance" className="text-sky-600">Acceptance</a></li>
          <li><a href="#accounts" className="text-sky-600">Accounts</a></li>
          <li><a href="#user-content" className="text-sky-600">User content</a></li>
          <li><a href="#prohibited" className="text-sky-600">Prohibited</a></li>
          <li><a href="#liability" className="text-sky-600">Liability</a></li>
          <li><a href="#contact" className="text-sky-600">Contact</a></li>
        </ul>
      </nav>

      <section id="acceptance">
        <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
        <p className="text-slate-700">By accessing or using PixelPact (the "Service") you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>
      </section>

      <section id="services">
        <h2 className="text-2xl font-semibold">2. Services</h2>
        <p className="text-slate-700">We provide web-based collaboration and testimonial features. Specific features, pricing and availability may change; we will try to communicate material changes in advance.</p>
      </section>

      <section id="accounts">
        <h2 className="text-2xl font-semibold">3. Accounts</h2>
        <p className="text-slate-700">You are responsible for maintaining the confidentiality of your account and password. Notify us immediately of any unauthorized use. We may suspend or terminate accounts that violate these Terms.</p>
      </section>

      <section id="user-content">
        <h2 className="text-2xl font-semibold">4. User Content</h2>
        <p className="text-slate-700">You retain ownership of content you upload or post. By submitting content you grant us a non-exclusive, worldwide license to use, host, store, reproduce, modify and display that content as necessary to provide the Service.</p>
      </section>

      <section id="prohibited">
        <h2 className="text-2xl font-semibold">5. Prohibited Conduct</h2>
        <ul>
          <li>Don't use the Service for unlawful purposes or to infringe others' rights.</li>
          <li>Don't attempt to access other accounts, introduce malware, or overload our systems.</li>
          <li>Don't misrepresent affiliation with others or the origin of content.</li>
        </ul>
      </section>

      <section id="payments">
        <h2 className="text-2xl font-semibold">6. Payments & Refunds</h2>
        <p className="text-slate-700">If the Service offers paid features, payments are handled by our payment processor and are subject to their terms as well as ours. Refund policies (if any) will be described on the pricing page or at purchase.</p>
      </section>

      <section id="intellectual-property">
        <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
        <p className="text-slate-700">All rights, title and interest in the Service (excluding user content) are owned by PixelPact or its licensors. You may not copy, modify, or distribute our proprietary materials without permission.</p>
      </section>

      <section id="liability">
        <h2 className="text-2xl font-semibold">8. Disclaimers & Limitation of Liability</h2>
        <p className="text-slate-700">The service is provided "as is" and we disclaim implied warranties to the fullest extent permitted by law. To the maximum extent permitted, PixelPact's aggregate liability for claims arising from use of the Service is limited to direct damages up to the amount you paid in the prior 12 months (or $100 if you haven't paid).</p>
      </section>

      <section id="indemnity">
        <h2 className="text-2xl font-semibold">9. Indemnification</h2>
        <p className="text-slate-700">You agree to indemnify and hold PixelPact harmless from claims, damages, losses, liabilities, and expenses arising from your use of the Service or violation of these Terms.</p>
      </section>

      <section id="termination">
        <h2 className="text-2xl font-semibold">10. Termination</h2>
        <p className="text-slate-700">We may suspend or terminate access for violations or for any reason with notice where required. On termination, your right to access the Service ends and we may delete associated data in accordance with our retention policy.</p>
      </section>

      <section id="governing">
        <h2 className="text-2xl font-semibold">11. Governing Law</h2>
        <p className="text-slate-700">These Terms are governed by the laws of the jurisdiction where PixelPact is based, without regard to conflicts of law principles. For disputes, consult the dispute resolution clause (if any) or contact us to attempt informal resolution.</p>
      </section>

      <section id="changes">
        <h2 className="text-2xl font-semibold">12. Changes</h2>
        <p className="text-slate-700">We may revise these Terms occasionally. Material changes will be communicated. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
      </section>

      <section id="contact">
        <h2 className="text-2xl font-semibold">13. Contact</h2>
        <p className="text-slate-700">If you have questions about these Terms, contact us at <a href="mailto:support@your-domain.example" className="text-sky-600">support@your-domain.example</a>. Replace this address with your preferred contact.</p>
      </section>
    </main>
  )
}
