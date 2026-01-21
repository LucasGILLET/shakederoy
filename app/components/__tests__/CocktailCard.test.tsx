import { render, screen } from '@testing-library/react'
import { CocktailCard } from '../CocktailCard'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('CocktailCard', () => {
  const mockCocktail = {
    id: '1',
    name: 'Mojito Royal',
    tags: ['Frais', 'Menthe', 'Citron'],
    difficulty: 'Facile' as const,
    duration: '5 min',
    alcohol: true,
  }

  it('renders cocktail name', () => {
    render(<CocktailCard {...mockCocktail} />)
    expect(screen.getByText('Mojito Royal')).toBeInTheDocument()
  })

  it('renders cocktail tags (maximum 3)', () => {
    render(<CocktailCard {...mockCocktail} />)
    expect(screen.getByText('Frais')).toBeInTheDocument()
    expect(screen.getByText('Menthe')).toBeInTheDocument()
    expect(screen.getByText('Citron')).toBeInTheDocument()
  })

  it('limits tags display to 3', () => {
    const cocktailWithManyTags = {
      ...mockCocktail,
      tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'],
    }
    render(<CocktailCard {...cocktailWithManyTags} />)
    expect(screen.getByText('Tag1')).toBeInTheDocument()
    expect(screen.getByText('Tag2')).toBeInTheDocument()
    expect(screen.getByText('Tag3')).toBeInTheDocument()
    expect(screen.queryByText('Tag4')).not.toBeInTheDocument()
    expect(screen.queryByText('Tag5')).not.toBeInTheDocument()
  })

  it('renders difficulty level', () => {
    render(<CocktailCard {...mockCocktail} />)
    expect(screen.getByText('Facile')).toBeInTheDocument()
  })

  it('renders duration', () => {
    render(<CocktailCard {...mockCocktail} />)
    expect(screen.getByText('5 min')).toBeInTheDocument()
  })

  it('displays "Sans Alcool" badge for non-alcoholic cocktails', () => {
    const nonAlcoholicCocktail = { ...mockCocktail, alcohol: false }
    render(<CocktailCard {...nonAlcoholicCocktail} />)
    expect(screen.getByText('Sans Alcool')).toBeInTheDocument()
  })

  it('does not display "Sans Alcool" badge for alcoholic cocktails', () => {
    render(<CocktailCard {...mockCocktail} />)
    expect(screen.queryByText('Sans Alcool')).not.toBeInTheDocument()
  })

  it('links to correct cocktail detail page', () => {
    const { container } = render(<CocktailCard {...mockCocktail} />)
    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/cocktail/1')
  })

  it('applies pink gradient for alcoholic cocktails', () => {
    const { container } = render(<CocktailCard {...mockCocktail} />)
    const imageContainer = container.querySelector('.from-pink-200')
    expect(imageContainer).toBeInTheDocument()
  })

  it('applies green gradient for non-alcoholic cocktails', () => {
    const nonAlcoholicCocktail = { ...mockCocktail, alcohol: false }
    const { container } = render(<CocktailCard {...nonAlcoholicCocktail} />)
    const imageContainer = container.querySelector('.from-green-200')
    expect(imageContainer).toBeInTheDocument()
  })

  it('renders different difficulty levels correctly', () => {
    const { rerender } = render(<CocktailCard {...mockCocktail} difficulty="Facile" />)
    expect(screen.getByText('Facile')).toBeInTheDocument()

    rerender(<CocktailCard {...mockCocktail} difficulty="Moyen" />)
    expect(screen.getByText('Moyen')).toBeInTheDocument()

    rerender(<CocktailCard {...mockCocktail} difficulty="Difficile" />)
    expect(screen.getByText('Difficile')).toBeInTheDocument()
  })
})
