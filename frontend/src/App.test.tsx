import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { CartProvider } from './context/CartContext';
import { MenuItem } from './types';

const mockMenuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Artisan Margherita Pizza',
    description: 'Fresh mozzarella and basil',
    price: 14.5,
    imageUrl: 'pizza.jpg',
    category: 'Pizza',
  },
  {
    id: 'item-2',
    name: 'Classic Cheeseburger',
    description: 'Prime beef with cheddar',
    price: 11.99,
    imageUrl: 'burger.jpg',
    category: 'Burgers',
  },
];

describe('App Integration', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url === '/api/menu') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: mockMenuItems }),
          });
        }
        if (url === '/api/orders') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] }),
          });
        }
        return Promise.reject(new Error(`Unhandled URL: ${url}`));
      })
    );
  });

  it('renders application header and fetches menu items', async () => {
    render(
      <CartProvider>
        <App />
      </CartProvider>
    );

    expect(screen.getByText('QuickBite')).toBeInTheDocument();
    expect(screen.getByText('Food Delivery Management System')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Artisan Margherita Pizza')).toBeInTheDocument();
      expect(screen.getByText('Classic Cheeseburger')).toBeInTheDocument();
    });
  });

  it('adds item to cart and updates navbar badge', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <App />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Artisan Margherita Pizza')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(addButtons[0]!);

    // Cart badge should appear with count 1
    const cartButton = screen.getByRole('button', { name: /^cart/i });
    expect(cartButton).toHaveTextContent('1');
  });
});
