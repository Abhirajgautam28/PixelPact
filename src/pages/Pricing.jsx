import React from 'react'

const plans = [
  {name:'Starter', price:'Free', bullets:['3 rooms', 'Basic tools']},
  {name:'Team', price:'$12/mo', bullets:['Unlimited rooms','Advanced tools','SSO']},
  {name:'Enterprise', price:'Contact', bullets:['Custom SLAs','Dedicated support']}
]

export default function Pricing(){
  return (
    <section>
      <h2 className="text-2xl font-semibold">Pricing</h2>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {plans.map(p=> (
          <div className="glass p-6" key={p.name}>
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <div className="mt-2 text-2xl font-bold">{p.price}</div>
            <ul className="mt-4 text-sm text-slate-600">
              {p.bullets.map(b=> <li key={b}>• {b}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
