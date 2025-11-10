import React from 'react'

export default function Privacy(){
  return (
    <main className="space-y-10 py-8" role="main" aria-labelledby="privacy-heading">
      <header className="text-center max-w-3xl mx-auto px-4">
        <h1 id="privacy-heading" className="text-3xl md:text-4xl font-extrabold">Privacy — PixelPact</h1>
        <p className="mt-2 text-sm text-slate-600">Effective: November 11, 2025</p>
        <p className="mt-4 text-slate-700 max-w-2xl mx-auto">A short summary of how we handle data. We keep this minimal — if you need full legal detail, contact us.</p>
      </header>

      <section className="max-w-3xl mx-auto px-4">
  <div className="glass p-6 shadow-elevation-1">
          <div className="prose max-w-none text-slate-800">
            <h2 className="text-lg font-semibold">What we collect</h2>
            <p>Basic account details (name, email), content you upload, and aggregated usage data to operate and improve the service.</p>

            <h2 className="text-lg font-semibold mt-4">How we use it</h2>
            <p>To provide the service (authentication, storage, sync), for security and to respond to support requests. We do not sell personal information.</p>

            <h2 className="text-lg font-semibold mt-4">Cookies</h2>
            <p>We use essential cookies for sessions and a readable CSRF token cookie; analytics cookies may be used in aggregated form.</p>

            <h2 className="text-lg font-semibold mt-4">Your choices</h2>
            <p>You can request access, correction, or deletion by contacting us. You can also control cookies via your browser.</p>

            <h2 className="text-lg font-semibold mt-4">Contact</h2>
            <p>For privacy requests: <a href="mailto:abhirajgautam28@gmail.com" className="text-sky-600">abhirajgautam28@gmail.com</a></p>
          </div>
        </div>
      </section>
    </main>
  )
}
