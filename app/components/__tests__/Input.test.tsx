import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label when provided', () => {
    render(<Input label="Username" />)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('label')).not.toBeInTheDocument()
  })

  it('displays error message when error prop is provided', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<Input error="Error message" data-testid="input-field" />)
    const input = screen.getByTestId('input-field')
    expect(input).toHaveClass('border-red-400')
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="input-field" />)
    const input = screen.getByTestId('input-field') as HTMLInputElement
    
    await user.type(input, 'test value')
    expect(input.value).toBe('test value')
  })

  it('can be disabled', () => {
    render(<Input disabled data-testid="input-field" />)
    const input = screen.getByTestId('input-field')
    expect(input).toBeDisabled()
  })

  it('accepts custom className', () => {
    render(<Input className="custom-input" data-testid="input-field" />)
    const input = screen.getByTestId('input-field')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards input props', () => {
    render(<Input type="email" name="email" required data-testid="input-field" />)
    const input = screen.getByTestId('input-field')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('name', 'email')
    expect(input).toBeRequired()
  })

  it('supports controlled input', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Input value="controlled" onChange={handleChange} data-testid="input-field" />)
    const input = screen.getByTestId('input-field') as HTMLInputElement
    
    expect(input.value).toBe('controlled')
    await user.type(input, 'a')
    expect(handleChange).toHaveBeenCalled()
  })
})
