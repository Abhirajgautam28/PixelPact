import React from 'react'

const plans = [
  {name:'Starter', price:'Free', cta:'Get started', bullets:['3 rooms', 'Basic drawing tools', 'Community support']},
  {name:'Team', price:'$12 / editor / mo', cta:'Start trial', bullets:['Unlimited rooms','Advanced toolset','SSO & SCIM','Priority email support']},
  {name:'Enterprise', price:'Contact', cta:'Contact sales', bullets:['Custom SLAs','Dedicated account team','On-prem or VPC deployment']}
]

function Feature({ children }){
  return <li className="text-sm text-slate-600">{children}</li>
}

export default function Pricing(){
  return (
    <section className="space-y-8">
      <header>
        <h2 className="text-3xl font-extrabold">Pricing</h2>
        <p className="mt-2 text-slate-700 max-w-2xl">Simple predictable pricing for teams of all sizes. Start free, scale with your team, and choose enterprise options when you need advanced controls.</p>
      </header>

      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {plans.map(p=> (
          <div className="glass p-6 flex flex-col" key={p.name}>
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <div className="text-slate-500 text-sm">Billed monthly</div>
            </div>
            <div className="mt-4 text-2xl font-bold">{p.price}</div>
            <ul className="mt-4 space-y-2">
              {p.bullets.map(b=> <Feature key={b}>{b}</Feature>)}
            </ul>
            <div className="mt-auto pt-4">
              <button className="w-full rounded-md py-2 bg-indigo-600 text-white font-semibold">{p.cta}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-6">
        <h3 className="text-lg font-semibold">Compare features</h3>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-left text-sm table-auto">
            <thead>
              <tr className="text-slate-600">
                <th className="p-2">Feature</th>
                <th className="p-2">Starter</th>
                <th className="p-2">Team</th>
                <th className="p-2">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">Rooms</td>
                <td className="p-2">3</td>
                <td className="p-2">Unlimited</td>
                <td className="p-2">Unlimited</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-2">Realtime editors</td>
                <td className="p-2">Basic</td>
                <td className="p-2">Advanced</td>
                <td className="p-2">Advanced + Priority</td>
              </tr>
              <tr>
                <td className="p-2">SSO / SCIM</td>
                <td className="p-2">—</td>
                <td className="p-2">Included</td>
                <td className="p-2">Included</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-2">Support</td>
                <td className="p-2">Community</td>
                <td className="p-2">Priority email</td>
                <td className="p-2">Dedicated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass p-6">
        <h3 className="text-lg font-semibold">Frequently asked questions</h3>
        <div className="mt-3 space-y-3 text-slate-700">
          <div>
            <div className="font-semibold">Do you offer discounts for education or nonprofits?</div>
            <div className="text-sm">Yes. We offer discounts for qualifying organizations — contact sales for details.</div>
          </div>
          <div>
            <div className="font-semibold">Can I host PixelPact on-prem?</div>
            <div className="text-sm">Enterprise customers can choose a VPC or on-prem deployment with dedicated support and SLAs.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
