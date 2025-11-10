import React from 'react'

export default function Terms(){
  return (
    <main className="prose max-w-none mx-auto p-6 md:p-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-slate-700">Last updated: November 10, 2025</p>
        <p className="mt-3 text-slate-600">These Terms govern your use of PixelPact. Please read them carefully — using the service indicates you accept these terms.</p>
      </header>

      <nav aria-label="On this page" className="my-4">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li><a href="#acceptance" className="text-sky-600">Acceptance</a></li>
          <li><a href="#definitions" className="text-sky-600">Definitions</a></li>
          <li><a href="#accounts" className="text-sky-600">Accounts</a></li>
          <li><a href="#user-content" className="text-sky-600">User content</a></li>
          <li><a href="#payments" className="text-sky-600">Payments</a></li>
          <li><a href="#liability" className="text-sky-600">Liability</a></li>
          <li><a href="#contact" className="text-sky-600">Contact</a></li>
        </ul>
      </nav>

      <section id="acceptance">
        <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
        <p className="text-slate-700">By accessing or using PixelPact (the "Service") you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>
      </section>

      <section id="definitions">
        <h2 className="text-2xl font-semibold">2. Definitions</h2>
        <p className="text-slate-700">"Service" means PixelPact and related services. "User content" means any content you upload, post or submit while using the Service.</p>
      </section>

      <section id="services">
        <h2 className="text-2xl font-semibold">3. Services</h2>
        <p className="text-slate-700">We provide web-based collaboration and testimonial features. Features, pricing and availability may change; material changes will be communicated where practicable.</p>
      </section>

      <section id="accounts">
        <h2 className="text-2xl font-semibold">4. Accounts</h2>
        <p className="text-slate-700">You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use. We may suspend or terminate accounts that violate these Terms.</p>
      </section>

      <section id="user-content">
        <h2 className="text-2xl font-semibold">5. User content & license</h2>
        <p className="text-slate-700">You retain ownership of content you submit. By submitting content, you grant PixelPact a non-exclusive, worldwide license to use, host, store, reproduce, modify and display that content to provide the Service.</p>
        <p className="text-slate-700">You represent and warrant that you have the rights to submit the content and that it does not violate third-party rights or applicable law.</p>
      </section>

      <section id="prohibited">
        <h2 className="text-2xl font-semibold">6. Prohibited conduct</h2>
        <ul>
          <li>Illegal activities, harassment, hate speech, or content that infringes intellectual property rights.</li>
          <li>Attempting to access others' accounts, introducing malware, or performing denial-of-service attacks.</li>
          <li>Using the Service to misrepresent identity or to impersonate others.</li>
        </ul>
      </section>

      <section id="payments">
        <h2 className="text-2xl font-semibold">7. Payments & refunds</h2>
        <p className="text-slate-700">Paid features (if any) are billed through our payment processor. Refunds, if available, will be described at purchase or on the pricing page. We do not store full payment card data on our servers.</p>
      </section>

      <section id="intellectual-property">
        <h2 className="text-2xl font-semibold">8. Intellectual property</h2>
        <p className="text-slate-700">All rights in the Service (excluding user content) are owned by PixelPact or its licensors. You may not copy or redistribute our proprietary materials without permission.</p>
      </section>

      <section id="liability">
        <h2 className="text-2xl font-semibold">9. Disclaimers & limitation of liability</h2>
        <p className="text-slate-700">The Service is provided "as is". To the maximum extent permitted by law, PixelPact's liability is limited to direct damages up to the amount you paid in the prior 12 months (or $100 if you have not paid). We are not liable for indirect or consequential damages.</p>
      </section>

      <section id="indemnity">
        <h2 className="text-2xl font-semibold">10. Indemnification</h2>
        <p className="text-slate-700">You agree to indemnify PixelPact for claims arising from your violation of these Terms or your use of the Service.</p>
      </section>

      <section id="termination">
        <h2 className="text-2xl font-semibold">11. Termination</h2>
        <p className="text-slate-700">We may suspend or terminate access for violations or for any reason with notice where required. On termination, your right to access the Service ends and we may delete associated data consistent with our retention policy.</p>
      </section>

      <section id="governing">
        <h2 className="text-2xl font-semibold">12. Governing law & disputes</h2>
        <p className="text-slate-700">These Terms are governed by the laws where PixelPact is based. For disputes please contact us first to attempt informal resolution.</p>
      </section>

      <section id="changes">
        <h2 className="text-2xl font-semibold">13. Changes to these Terms</h2>
        <p className="text-slate-700">We may revise these Terms occasionally. Material changes will be notified. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
      </section>

      <section id="contact">
        <h2 className="text-2xl font-semibold">14. Contact</h2>
        <p className="text-slate-700">Questions about these Terms: <a href="mailto:legal@pixelpact.example" className="text-sky-600">abhirajgautam28@gmail.com</a></p>
      </section>
    </main>
  )
}
