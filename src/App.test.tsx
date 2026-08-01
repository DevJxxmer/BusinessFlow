import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('BusinessFlow app', () => {
  it('renders welcome screen', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Tu negocio,/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Comenzar ahora/i })).toHaveLength(2)
  })

  it('shows login when clicking iniciar sesión', async () => {
    render(<App />)
    const welcomeButton = screen.getAllByRole('button', { name: /Comenzar ahora/i })[0]
    fireEvent.click(welcomeButton)
    expect(await screen.findByText(/Inicia sesión/i)).toBeInTheDocument()
  })
})
