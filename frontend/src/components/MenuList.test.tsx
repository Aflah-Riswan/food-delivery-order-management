import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuList } from './MenuList';
import { MenuItem } from '../types';

describe('MenuList Component', () => {
  const sampleItems: MenuItem[] = [
    {
      id: 'item-1',
      name: 'Cheeseburger',
      description: 'Prime beef patty with cheese',
      price: 10.0,
      imageUrl: 'burger.jpg',
      category: 'Burgers',
    },
    {
      id: 'item-2',
      name: 'Margherita Pizza',
      description: 'Tomato and fresh basil pizza',
      price: 15.0,
      imageUrl: 'pizza.jpg',
      category: 'Pizza',
    },
    {
      id: 'item-3',
      name: 'Caesar Salad',
      description: 'Crispy romaine and parmesan',
      price: 8.5,
      imageUrl: 'salad.jpg',
      category: 'Salads',
    },
  ];

  it('renders all menu items and category filters', () => {
    const onAdd = vi.fn();
    render(<MenuList items={sampleItems} isLoading={false} error={null} onAddToCart={onAdd} />);

    expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /burgers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pizza/i })).toBeInTheDocument();
  });

  it('filters items when user enters search query', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<MenuList items={sampleItems} isLoading={false} error={null} onAddToCart={onAdd} />);

    const searchInput = screen.getByPlaceholderText(/search dishes/i);
    await user.type(searchInput, 'pizza');

    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Cheeseburger')).not.toBeInTheDocument();
    expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
  });

  it('filters items when user clicks a category chip', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<MenuList items={sampleItems} isLoading={false} error={null} onAddToCart={onAdd} />);

    const burgersButton = screen.getByRole('button', { name: /^burgers$/i });
    await user.click(burgersButton);

    expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
    expect(screen.queryByText('Margherita Pizza')).not.toBeInTheDocument();
    expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(<MenuList items={[]} isLoading={true} error={null} onAddToCart={vi.fn()} />);
    expect(screen.getByText(/loading delicious menu/i)).toBeInTheDocument();
  });

  it('shows error state when error is provided', () => {
    render(<MenuList items={[]} isLoading={false} error="Failed to fetch menu" onAddToCart={vi.fn()} />);
    expect(screen.getByText(/failed to fetch menu/i)).toBeInTheDocument();
  });
});
