import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuCard } from './MenuCard';
import { MenuItem } from '../types';

describe('MenuCard Component', () => {
  const sampleItem: MenuItem = {
    id: 'item-1',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheese',
    price: 11.99,
    imageUrl: 'https://example.com/burger.jpg',
    category: 'Burgers',
  };

  it('renders item details correctly', () => {
    const onAdd = vi.fn();
    render(<MenuCard item={sampleItem} onAddToCart={onAdd} />);

    expect(screen.getByText('Classic Cheeseburger')).toBeInTheDocument();
    expect(screen.getByText('Juicy beef patty with cheese')).toBeInTheDocument();
    expect(screen.getByText('$11.99')).toBeInTheDocument();
    expect(screen.getByText('Burgers')).toBeInTheDocument();
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/burger.jpg');
    expect(image).toHaveAttribute('alt', 'Classic Cheeseburger');
  });

  it('calls onAddToCart callback when clicking Add button', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<MenuCard item={sampleItem} onAddToCart={onAdd} />);

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    await user.click(addButton);

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(sampleItem);
  });
});
