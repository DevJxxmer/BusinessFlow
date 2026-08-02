import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BusinessFlow runtime error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: '#f7f8fa', color: '#111827' }}>
          <h1 style={{ marginBottom: 12 }}>Algo falló al cargar BusinessFlow</h1>
          <p style={{ marginBottom: 12 }}>La app dejó de renderizar por un error inesperado. El detalle técnico aparece abajo.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 16, borderRadius: 10, border: '1px solid #e5e7eb' }}>
            {this.state.error?.message ?? 'Sin detalle disponible'}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}
