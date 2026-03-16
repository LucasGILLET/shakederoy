import { apiFetch } from '../api'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://shake-api-tmp.striffe.dev'

describe('apiFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('makes a successful GET request', async () => {
    const mockData = { id: 1, name: 'Test' }
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    })

    const result = await apiFetch<typeof mockData>('/test')

    expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/test`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    expect(result).toEqual(mockData)
  })

  it('makes a successful POST request with body', async () => {
    const mockResponse = { success: true }
    const requestBody = { username: 'test', password: 'password' }

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    })

    const result = await apiFetch<typeof mockResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    expect(result).toEqual(mockResponse)
  })

  it('handles 204 No Content response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
    })

    const result = await apiFetch('/delete')

    expect(result).toEqual({})
  })

  it('throws error with message from error response', async () => {
    const errorMessage = 'Invalid credentials'
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => JSON.stringify({ message: errorMessage }),
    })

    await expect(apiFetch('/auth/login')).rejects.toThrow(errorMessage)
  })

  it('handles error with issues field', async () => {
    const issues = [{ field: 'email', message: 'Invalid email' }]
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => JSON.stringify({ issues }),
    })

    await expect(apiFetch('/register')).rejects.toThrow(JSON.stringify(issues))
  })

  it('handles error with error field', async () => {
    const errorDetail = { code: 'AUTH_ERROR', detail: 'Token expired' }
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => JSON.stringify({ error: errorDetail }),
    })

    await expect(apiFetch('/protected')).rejects.toThrow(JSON.stringify(errorDetail))
  })

  it('handles non-JSON error response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server error occurred',
    })

    await expect(apiFetch('/test')).rejects.toThrow('Server error occurred')
  })

  it('falls back to status text when no error message', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => JSON.stringify({}),
    })

    await expect(apiFetch('/missing')).rejects.toThrow('Error 404: Not Found')
  })

  it('handles network errors', async () => {
    const networkError = new Error('Network failure')
    globalThis.fetch = jest.fn().mockRejectedValue(networkError)

    await expect(apiFetch('/test')).rejects.toThrow('Network failure')
  })

  it('accepts custom headers', async () => {
    const mockData = { data: 'test' }
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    })

    await apiFetch('/test', {
      headers: {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'value',
      },
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/test`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'value',
      },
    })
  })

  it('throws a normalized error without logging', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => JSON.stringify({ message: 'Error' }),
    })

    await expect(apiFetch('/test')).rejects.toThrow('Error')
  })
})
