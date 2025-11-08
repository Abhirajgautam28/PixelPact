import React from 'react'
import { logUnhandledError } from '../utils/errorLogger'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error){
    return { hasError: true, error }
  }

  componentDidCatch(error, info){
    // save info for dev diagnostics
    this.setState({ error, info })
    // eslint-disable-next-line no-console
    console.error('Uncaught error in component tree:', error, info)
    try{
      // static import is safe because the logger guards for non-browser envs
      try{ logUnhandledError(error, { componentStack: info?.componentStack }) }catch(e){}
    }catch(e){/* ignore */}
  }

  render(){
    if (!this.state.hasError) return this.props.children

    const { error, info } = this.state
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-2xl w-full bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-600">An unexpected error occurred while rendering the app. You can reload the page or copy the error details for debugging.</p>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 rounded bg-[#6C5CE7] text-white" onClick={()=> window.location.reload()}>Reload page</button>
            <button className="px-4 py-2 rounded border" onClick={()=> { navigator.clipboard && navigator.clipboard.writeText(String(error) + '\n' + (info?.componentStack || '')) }}>Copy error</button>
          </div>
          {import.meta.env.MODE !== 'production' && (
            <details className="mt-4 text-xs text-slate-500 whitespace-pre-wrap">
              <summary className="cursor-pointer">Error details (dev)</summary>
              <div className="mt-2">{String(error)}</div>
              <pre className="mt-2 text-[11px] text-slate-600">{info?.componentStack}</pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}
