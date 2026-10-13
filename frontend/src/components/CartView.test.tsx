import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartView } from './CartView';
import { CartItem } from '../types';

describe('CartView Component', () => {
  const mockItems: CartItem[] = [
    {
      item: {
        id: 'item-1',
        name: 'Crispy Pepperoni Pizza',
        description: 'Spicy pepperoni',
        price: 16.0,
        imageUrl: 'pizza.jpg',
        category: 'Pizza',
      },
      quantity: 2,
    },
    {
      item: {
        id: 'item-2',
        name: 'Lemonade',
        description: 'Fresh mint lemonade',
        price: 4.5,
        imageUrl: 'lemonade.jpg',
        category: 'Drinks',
      },
      quantity: 1,
    },
  ];

  it('renders empty cart message when items is empty', () => {
    render(
      <CartView
        items={[]}
        total={0}
        onUpdateQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
        onClearCart={vi.fn()}
        onProceedToCheckout={vi.fn()}
      />
    );

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('renders cart items, quantities, and calculates grand total', () => {
    render(
      <CartView
        items={mockItems}
        total={36.5}
        onUpdateQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
        onClearCart={vi.fn()}
        onProceedToCheckout={vi.fn()}
      />
    );

    expect(screen.getByText('Crispy Pepperoni Pizza')).toBeInTheDocument();
    expect(screen.getByText('Lemonade')).toBeInTheDocument();
    expect(screen.getByText('$36.50')).toBeInTheDocument();
  });

  it('calls onUpdateQuantity when clicking plus and minus buttons', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    render(
      <CartView
        items={mockItems}
        total={36.5}
        onUpdateQuantity={onUpdate}
        onRemoveItem={vi.fn()}
        onClearCart={vi.fn()}
        onProceedToCheckout={vi.fn()}
      />
    );

    const plusButtons = screen.getAllByRole('button', { name: /\+/i });
    await user.click(plusButtons[0]!);
    expect(onUpdate).toHaveBeenCalledWith('item-1', 3);

    const minusButtons = screen.getAllByRole('button', { name: /−/i });
    await user.click(minusButtons[0]!);
    expect(onUpdate).toHaveBeenCalledWith('item-1', 1);
  });

  it('calls onProceedToCheckout when clicking checkout button', async () => {
    const user = userEvent.setup();
    const onCheckout = vi.fn();

    render(
      <CartView
        items={mockItems}
        total={36.5}
        onUpdateQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
        onClearCart={vi.fn()}
        onProceedToCheckout={onCheckout}
      />
    );

    const checkoutBtn = screen.getByRole('button', { name: /proceed to checkout/i });
    await user.click(checkoutBtn);
    expect(onCheckout).toHaveBeenCalledTimes(1);
  });
});
