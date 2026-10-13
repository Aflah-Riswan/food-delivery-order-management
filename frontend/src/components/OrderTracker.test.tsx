import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderTracker } from './OrderTracker';
import { Order } from '../types';

describe('OrderTracker Component', () => {
  const sampleOrder: Order = {
    id: 'ord_12345',
    customer: {
      customerName: 'Alice',
      deliveryAddress: '789 Broadway Ave',
      phoneNumber: '555-9876',
    },
    items: [
      {
        menuItemId: 'item-1',
        name: 'Classic Cheeseburger',
        unitPrice: 11.99,
        quantity: 2,
        subtotal: 23.98,
      },
    ],
    totalAmount: 23.98,
    status: 'PREPARING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders order summary, items, and active timeline status', () => {
    render(
      <OrderTracker
        order={sampleOrder}
        onSimulateStep={vi.fn()}
        onCancelOrder={vi.fn()}
      />
    );

    expect(screen.getByText(/order #ord_12345/i)).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('789 Broadway Ave')).toBeInTheDocument();
    expect(screen.getByText('Classic Cheeseburger')).toBeInTheDocument();
    expect(screen.getAllByText('$23.98').length).toBeGreaterThan(0);
    expect(screen.getByText('PREPARING')).toBeInTheDocument();
  });

  it('calls onSimulateStep when clicking advance button', async () => {
    const user = userEvent.setup();
    const onSimulate = vi.fn();

    render(
      <OrderTracker
        order={sampleOrder}
        onSimulateStep={onSimulate}
        onCancelOrder={vi.fn()}
      />
    );

    const advanceBtn = screen.getByRole('button', { name: /simulate next status/i });
    await user.click(advanceBtn);
    expect(onSimulate).toHaveBeenCalledTimes(1);
    expect(onSimulate).toHaveBeenCalledWith('ord_12345');
  });

  it('allows cancellation when order is cancellable', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <OrderTracker
        order={sampleOrder}
        onSimulateStep={vi.fn()}
        onCancelOrder={onCancel}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel order/i });
    await user.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledWith('ord_12345');
  });
});
