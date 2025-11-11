export function extractMessage(body, res){
  if (!body && !res) return null
  if (body && typeof body === 'string') return body
  if (body && typeof body === 'object') return body.message || body.error || body.msg || null
  if (res && typeof res.statusText === 'string') return res.statusText
  return null
}

export function showErrorToast(toast, err, fallback = 'An error occurred'){
  if (!toast) return
  let msg = fallback
  try{
    if (err instanceof Error) msg = err.message || fallback
    else if (err && typeof err === 'object') {
      msg = err.message || err.error || err.msg || JSON.stringify(err)
    } else if (typeof err === 'string') msg = err
  }catch(e){ msg = fallback }
  toast.show(msg || fallback, { type: 'error' })
}
