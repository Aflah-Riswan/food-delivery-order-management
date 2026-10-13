import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from './CartContext';
import { MenuItem } from '../types';

const mockItem1: MenuItem = {
  id: 'item-1',
  name: 'Cheeseburger',
  description: 'Juicy burger',
  price: 10.5,
  imageUrl: 'burger.jpg',
  category: 'Burgers',
};

const mockItem2: MenuItem = {
  id: 'item-2',
  name: 'Margherita Pizza',
  description: 'Classic pizza',
  price: 14.0,
  imageUrl: 'pizza.jpg',
  category: 'Pizza',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext & useCart hook', () => {
  it('starts with an empty cart and 0 total', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.cartTotal).toBe(0);
    expect(result.current.totalCount).toBe(0);
  });

  it('adds items to cart and computes total price correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockItem1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.item.id).toBe('item-1');
    expect(result.current.items[0]?.quantity).toBe(1);
    expect(result.current.cartTotal).toBe(10.5);
    expect(result.current.totalCount).toBe(1);

    // Adding same item increases quantity
    act(() => {
      result.current.addToCart(mockItem1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(2);
    expect(result.current.cartTotal).toBe(21.0);
    expect(result.current.totalCount).toBe(2);

    // Adding different item
    act(() => {
      result.current.addToCart(mockItem2);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.cartTotal).toBe(35.0);
    expect(result.current.totalCount).toBe(3);
  });

  it('updates item quantity and removes if quantity drops to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockItem1);
      result.current.updateQuantity('item-1', 5);
    });

    expect(result.current.items[0]?.quantity).toBe(5);
    expect(result.current.cartTotal).toBe(52.5);

    act(() => {
      result.current.updateQuantity('item-1', 0);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.cartTotal).toBe(0);
  });

  it('removes item directly from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockItem1);
      result.current.addToCart(mockItem2);
      result.current.removeFromCart('item-1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.item.id).toBe('item-2');
    expect(result.current.cartTotal).toBe(14.0);
  });

  it('clears all items from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockItem1);
      result.current.addToCart(mockItem2);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.cartTotal).toBe(0);
  });
});
