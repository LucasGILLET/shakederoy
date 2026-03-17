import { apiFetch, apiFetchList } from '../api'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://shake-api-tmp.striffe.dev'

describe('API Endpoints - Cocktails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /cocktails', () => {
    it('fetches all cocktails successfully', async () => {
      const mockCocktails = [
        {
          id: '1',
          name: 'Mojito',
          description: 'Cocktail frais',
          ingredients: '[]',
          instructions: '[]',
        },
        {
          id: '2',
          name: 'Martini',
          description: 'Cocktail classique',
          ingredients: '[]',
          instructions: '[]',
        },
      ]

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCocktails,
      })

      const result = await apiFetch<typeof mockCocktails>('/cocktails')

      expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/cocktails`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockCocktails)
    })

    it('handles empty cocktails list', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      })

      const result = await apiFetch<unknown[]>('/cocktails')
      expect(result).toEqual([])
    })

    it('extracts paginated cocktail data with apiFetchList', async () => {
      const mockCocktails = [
        { id: '1', name: 'Mojito' },
        { id: '2', name: 'Martini' },
      ]

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: mockCocktails,
          page: 1,
          size: 10,
          total: 2,
          totalPages: 1,
        }),
      })

      const result = await apiFetchList<typeof mockCocktails[number]>('/cocktails')
      expect(result).toEqual(mockCocktails)
    })
  })

  describe('GET /cocktails/:id', () => {
    it('fetches single cocktail by id', async () => {
      const mockCocktail = {
        id: '1',
        name: 'Mojito',
        description: 'Cocktail frais a la menthe',
        ingredients: JSON.stringify([
          { name: 'Rhum', amount: '4cl' },
          { name: 'Menthe', amount: '8 feuilles' },
        ]),
        instructions: JSON.stringify(['Etape 1', 'Etape 2']),
      }

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCocktail,
      })

      const result = await apiFetch<typeof mockCocktail>('/cocktails/1')

      expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/cocktails/1`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockCocktail)
    })

    it('handles 404 when cocktail not found', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => JSON.stringify({ message: 'Cocktail not found' }),
      })

      await expect(apiFetch('/cocktails/999')).rejects.toThrow('Cocktail not found')
    })
  })

  describe('POST /cocktails/create', () => {
    it('creates a new cocktail successfully', async () => {
      const newCocktail = {
        name: 'Nouveau Cocktail',
        description: 'Description du cocktail',
        ingredients: JSON.stringify([{ name: 'Vodka', amount: '5cl' }]),
        instructions: JSON.stringify(['Melanger', 'Servir']),
      }

      const mockResponse = {
        id: '3',
        ...newCocktail,
      }

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      })

      const result = await apiFetch<typeof mockResponse>('/cocktails/create', {
        method: 'POST',
        body: JSON.stringify(newCocktail),
        headers: {
          Authorization: 'Bearer fake-token',
        },
      })

      expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/cocktails/create`, {
        method: 'POST',
        body: JSON.stringify(newCocktail),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token',
        },
      })
      expect(result).toEqual(mockResponse)
    })

    it('requires authentication', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => JSON.stringify({ message: 'Authentication required' }),
      })

      await expect(
        apiFetch('/cocktails/create', {
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        })
      ).rejects.toThrow('Authentication required')
    })

    it('validates required fields', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () =>
          JSON.stringify({
            issues: [
              { field: 'name', message: 'Name is required' },
              { field: 'description', message: 'Description is required' },
            ],
          }),
      })

      await expect(
        apiFetch('/cocktails/create', {
          method: 'POST',
          body: JSON.stringify({}),
          headers: { Authorization: 'Bearer token' },
        })
      ).rejects.toThrow()
    })
  })
})

describe('API Endpoints - Authentication with Tokens', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authorization Header', () => {
    it('sends Bearer token in Authorization header', async () => {
      const token = 'my-secret-token-123'
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      })

      await apiFetch('/protected-endpoint', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/protected-endpoint`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    })

    it('handles expired token error', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () =>
          JSON.stringify({
            error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
          }),
      })

      await expect(
        apiFetch('/protected-endpoint', {
          headers: { Authorization: 'Bearer expired-token' },
        })
      ).rejects.toThrow()
    })

    it('handles missing token', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => JSON.stringify({ message: 'No token provided' }),
      })

      await expect(apiFetch('/protected-endpoint')).rejects.toThrow('No token provided')
    })
  })

  describe('Token in localStorage', () => {
    it('retrieves and uses token from localStorage', () => {
      const token = 'stored-token-456'
      localStorage.setItem('token', token)

      const storedToken = localStorage.getItem('token')
      expect(storedToken).toBe(token)
    })

    it('handles missing token in localStorage', () => {
      localStorage.removeItem('token')
      const storedToken = localStorage.getItem('token')
      expect(storedToken).toBeNull()
    })
  })
})

describe('API Advanced Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Concurrent Requests', () => {
    it('handles multiple simultaneous requests', async () => {
      globalThis.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ id: '1', name: 'Cocktail 1' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ id: '2', name: 'Cocktail 2' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ id: '3', name: 'Cocktail 3' }),
        })

      const results = await Promise.all([
        apiFetch('/cocktails/1'),
        apiFetch('/cocktails/2'),
        apiFetch('/cocktails/3'),
      ])

      expect(results).toHaveLength(3)
      expect(results[0]).toEqual({ id: '1', name: 'Cocktail 1' })
      expect(results[1]).toEqual({ id: '2', name: 'Cocktail 2' })
      expect(results[2]).toEqual({ id: '3', name: 'Cocktail 3' })
      expect(globalThis.fetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('Large Response Handling', () => {
    it('handles large JSON responses', async () => {
      const largeCocktailList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Cocktail ${i + 1}`,
        description: 'A'.repeat(1000),
      }))

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => largeCocktailList,
      })

      const result = await apiFetch<typeof largeCocktailList>('/cocktails')

      expect(result).toHaveLength(100)
      expect(result[0].description).toHaveLength(1000)
    })
  })

  describe('Special Characters and Encoding', () => {
    it('handles special characters in request body', async () => {
      const cocktailWithSpecialChars = {
        name: "Mojito d'ete",
        description: 'Cocktail avec emojis',
        ingredients: JSON.stringify([{ name: 'Rhum "Special"', amount: '5cl' }]),
      }

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: '1', ...cocktailWithSpecialChars }),
      })

      const result = await apiFetch<typeof cocktailWithSpecialChars & { id: string }>('/cocktails/create', {
        method: 'POST',
        body: JSON.stringify(cocktailWithSpecialChars),
      })

      expect(result.name).toBe("Mojito d'ete")
      expect(result.description).toContain('emojis')
    })
  })

  describe('HTTP Methods', () => {
    it('supports PUT method for updates', async () => {
      const updateData = { name: 'Updated Name' }

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: '1', ...updateData }),
      })

      await apiFetch('/cocktails/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/cocktails/1`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('supports DELETE method', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 204,
      })

      const result = await apiFetch('/cocktails/1', {
        method: 'DELETE',
      })

      expect(result).toEqual({})
      expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/cocktails/1`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('supports PATCH method for partial updates', async () => {
      const patchData = { description: 'New description' }

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: '1', ...patchData }),
      })

      await apiFetch('/cocktails/1', {
        method: 'PATCH',
        body: JSON.stringify(patchData),
      })

      expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/cocktails/1`, {
        method: 'PATCH',
        body: JSON.stringify(patchData),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  describe('Error Recovery', () => {
    it('preserves original error for retry logic', async () => {
      const networkError = new Error('Network timeout')
      globalThis.fetch = jest.fn().mockRejectedValue(networkError)

      let caughtError
      try {
        await apiFetch('/cocktails')
      } catch (error) {
        caughtError = error
      }

      expect(caughtError).toBe(networkError)
    })
  })

  describe('Response Status Codes', () => {
    it('handles 201 Created', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: '1', name: 'New' }),
      })

      const result = await apiFetch('/cocktails/create', { method: 'POST', body: '{}' })
      expect(result).toEqual({ id: '1', name: 'New' })
    })

    it('handles 304 Not Modified', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 304,
        json: async () => ({}),
      })

      const result = await apiFetch('/cocktails/1')
      expect(result).toEqual({})
    })

    it('handles 503 Service Unavailable', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: async () => JSON.stringify({ message: 'Service temporarily unavailable' }),
      })

      await expect(apiFetch('/cocktails')).rejects.toThrow('Service temporarily unavailable')
    })
  })
})
