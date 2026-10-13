import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { InMemoryMenuRepository } from '../../src/repositories/InMemoryMenuRepository.js';
import { InMemoryOrderRepository } from '../../src/repositories/InMemoryOrderRepository.js';
import { MenuService } from '../../src/services/MenuService.js';
import { OrderService } from '../../src/services/OrderService.js';

describe('Order API Endpoints', () => {
  let app: ReturnType<typeof createApp>;
  let orderService: OrderService;
  let menuService: MenuService;

  beforeEach(() => {
    const menuRepo = new InMemoryMenuRepository();
    const orderRepo = new InMemoryOrderRepository();
    menuService = new MenuService(menuRepo);
    orderService = new OrderService(orderRepo, menuRepo);
    app = createApp({ menuService, orderService });
  });

  describe('POST /api/orders', () => {
    it('creates an order with valid body and returns 201', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            customerName: 'Alice Smith',
            deliveryAddress: '789 Broadway Ave',
            phoneNumber: '+1-555-0199',
          },
          items: [{ menuItemId: 'item-1', quantity: 2 }],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.customer.customerName).toBe('Alice Smith');
      expect(response.body.data.totalAmount).toBe(23.98); // 11.99 * 2
    });

    it('returns 400 when validation fails (invalid customer)', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            customerName: '',
            deliveryAddress: 'short',
            phoneNumber: 'invalid',
          },
          items: [{ menuItemId: 'item-1', quantity: 1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('returns 404 when menu item does not exist', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            customerName: 'Alice Smith',
            deliveryAddress: '789 Broadway Ave',
            phoneNumber: '+1-555-0199',
          },
          items: [{ menuItemId: 'ghost-item-999', quantity: 1 }],
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders & GET /api/orders/:id', () => {
    it('lists orders and retrieves single order by id', async () => {
      // Create an order first
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            customerName: 'Alice Smith',
            deliveryAddress: '789 Broadway Ave',
            phoneNumber: '+1-555-0199',
          },
          items: [{ menuItemId: 'item-1', quantity: 1 }],
        });

      const orderId = createRes.body.data.id;

      // GET /api/orders
      const listRes = await request(app).get('/api/orders');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data).toHaveLength(1);

      // GET /api/orders/:id
      const getRes = await request(app).get(`/api/orders/${orderId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.id).toBe(orderId);
    });

    it('returns 404 for non-existent order ID', async () => {
      const res = await request(app).get('/api/orders/ord_nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('updates order status for valid transition', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            customerName: 'Alice Smith',
            deliveryAddress: '789 Broadway Ave',
            phoneNumber: '+1-555-0199',
          },
          items: [{ menuItemId: 'item-1', quantity: 1 }],
        });

      const orderId = createRes.body.data.id;

      const patchRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'CONFIRMED' });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.status).toBe('CONFIRMED');
    });

    it('returns 400 for illegal status transition', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            customerName: 'Alice Smith',
            deliveryAddress: '789 Broadway Ave',
            phoneNumber: '+1-555-0199',
          },
          items: [{ menuItemId: 'item-1', quantity: 1 }],
        });

      const orderId = createRes.body.data.id;

      const patchRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'DELIVERED' });

      expect(patchRes.status).toBe(400);
      expect(patchRes.body.message).toContain('Invalid status transition');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('deletes pending order and returns 200', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            customerName: 'Alice Smith',
            deliveryAddress: '789 Broadway Ave',
            phoneNumber: '+1-555-0199',
          },
          items: [{ menuItemId: 'item-1', quantity: 1 }],
        });

      const orderId = createRes.body.data.id;

      const deleteRes = await request(app).delete(`/api/orders/${orderId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const getRes = await request(app).get(`/api/orders/${orderId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
