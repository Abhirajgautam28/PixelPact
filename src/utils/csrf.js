export function getCsrfToken(){
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|; )csrf-token=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

export function attachCsrf(headers = {}){
  const t = getCsrfToken()
  if (t) headers['X-CSRF-Token'] = t
  return headers
}
