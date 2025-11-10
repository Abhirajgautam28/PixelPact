import React from 'react'

export default function Terms(){
  return (
    <main className="space-y-10 py-8" role="main" aria-labelledby="terms-heading">
      <header className="text-center max-w-3xl mx-auto px-4">
        <h1 id="terms-heading" className="text-3xl md:text-4xl font-extrabold">Terms of Service — PixelPact</h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: November 11, 2025</p>
        <p className="mt-4 text-slate-700 max-w-2xl mx-auto">A short, plain-language summary of the essential terms that apply when you use PixelPact.</p>
      </header>

      <section className="max-w-3xl mx-auto px-4">
  <div className="glass p-6 shadow-elevation-1">
          <div className="prose max-w-none text-slate-800">
            <h2 className="text-lg font-semibold">Using PixelPact</h2>
            <p>By using PixelPact you agree to follow these terms. Use the service responsibly and don't impersonate others or submit illegal content.</p>

            <h2 className="text-lg font-semibold mt-4">Accounts</h2>
            <p>Keep your credentials secure. We may suspend accounts that abuse the service or violate these terms.</p>

            <h2 className="text-lg font-semibold mt-4">User content</h2>
            <p>You retain ownership of what you upload. By submitting content you grant PixelPact a license to host and display it to provide the service.</p>

            <h2 className="text-lg font-semibold mt-4">Liability</h2>
            <p>The service is provided "as is". Our liability is limited as set out in the full Terms; contact us if you need more detail.</p>

            <h2 className="text-lg font-semibold mt-4">Contact</h2>
            <p>Questions about these Terms: <a href="mailto:abhirajgautam28@gmail.com" className="text-sky-600">abhirajgautam28@gmail.com</a></p>
          </div>
        </div>
      </section>
    </main>
  )
}
