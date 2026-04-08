import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { apiFetch } from '@/app/lib/api'
import { useRouter } from 'next/navigation'

jest.mock('@/app/lib/api')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

function TestComponent() {
  const { user, loading, login, register, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.username : 'No User'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('testuser', 'test@example.com', 'password', true)}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

  beforeEach(() => {
    jest.clearAllMocks()
    mockApiFetch.mockReset()
    mockApiFetch.mockRejectedValue(new Error('Unauthorized'))
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as any)
  })

  describe('Initial State', () => {
    it('initializes with no user and loading false', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })
      expect(screen.getByTestId('user')).toHaveTextContent('No User')
    })

    it('loads user from /users/self on mount', async () => {
      const storedUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        is_bar_owner: false,
      }
      mockApiFetch.mockResolvedValueOnce(storedUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('testuser')
      })
    })
  })

  describe('Login', () => {
    it('successfully logs in user', async () => {
      const mockResponse = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        is_bar_owner: false,
      }
      mockApiFetch
        .mockRejectedValueOnce(new Error('Unauthorized'))
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(mockResponse)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      const loginButton = screen.getByText('Login')
      loginButton.click()

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            credential: 'test@example.com',
            password: 'password',
          }),
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('testuser')
      })

      expect(mockPush).toHaveBeenCalledWith('/catalogue')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  describe('Register', () => {
    it('successfully registers user', async () => {
      const mockResponse = {
        id: '2',
        username: 'newuser',
        email: 'test@example.com',
        role: 'user',
        is_bar_owner: true,
      }
      mockApiFetch
        .mockRejectedValueOnce(new Error('Unauthorized'))
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(mockResponse)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      const registerButton = screen.getByText('Register')
      registerButton.click()

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password',
            isBarOwner: true,
          }),
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('newuser')
      })

      expect(mockPush).toHaveBeenCalledWith('/catalogue')
    })

    it('fetches the current user after registration', async () => {
      mockApiFetch
        .mockRejectedValueOnce(new Error('Unauthorized'))
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          id: '3',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          is_bar_owner: true,
        })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      const registerButton = screen.getByText('Register')
      registerButton.click()

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledTimes(3)
      })

      expect(mockApiFetch).toHaveBeenNthCalledWith(2, '/auth/register', expect.any(Object))
      expect(mockApiFetch).toHaveBeenNthCalledWith(3, '/users/self')
    })
  })

  describe('Logout', () => {
    it('clears user data and redirects to login', async () => {
      const storedUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        is_bar_owner: false,
      }
      mockApiFetch
        .mockResolvedValueOnce(storedUser)
        .mockResolvedValueOnce({})

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('testuser')
      })

      const logoutButton = screen.getByText('Logout')
      
      await act(async () => {
        logoutButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No User')
      })

      expect(mockPush).toHaveBeenCalledWith('/login')
      expect(mockApiFetch).toHaveBeenCalledWith('/auth/logout')
    })
  })

  describe('useAuth Hook', () => {
    it('throws error when used outside AuthProvider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleErrorSpy.mockRestore()
    })
  })
})
