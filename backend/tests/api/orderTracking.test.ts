import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { createApp } from '../../src/app.js';
import { MockMenuRepository, MockOrderRepository } from '../mocks/MockRepositories.js';
import { MenuService } from '../../src/services/MenuService.js';
import { OrderService } from '../../src/services/OrderService.js';

describe('Order Tracking & SSE API', () => {
  let app: ReturnType<typeof createApp>;
  let orderService: OrderService;
  let menuService: MenuService;

  beforeEach(() => {
    const menuRepo = new MockMenuRepository();
    const orderRepo = new MockOrderRepository();
    menuService = new MenuService(menuRepo);
    orderService = new OrderService(orderRepo, menuRepo);
    app = createApp({ menuService, orderService });
  });

  it('POST /api/orders/:id/simulate advances status to next step', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .send({
        customer: {
          customerName: 'Carol White',
          deliveryAddress: '332 Maple Road',
          phoneNumber: '555-4321',
        },
        items: [{ menuItemId: 'item-1', quantity: 1 }],
      });

    const orderId = createRes.body.data.id;

    // Simulate next step
    const simRes = await request(app)
      .post(`/api/orders/${orderId}/simulate`)
      .send({ stepOnly: true });

    expect(simRes.status).toBe(200);
    expect(simRes.body.success).toBe(true);
    expect(simRes.body.data.status).toBe('CONFIRMED');
  });

  it('GET /api/orders/:id/tracking returns SSE stream headers and sends initial state', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .send({
        customer: {
          customerName: 'Carol White',
          deliveryAddress: '332 Maple Road',
          phoneNumber: '555-4321',
        },
        items: [{ menuItemId: 'item-1', quantity: 1 }],
      });

    const orderId = createRes.body.data.id;

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;

    try {
      const receivedData = await new Promise<string>((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/api/orders/${orderId}/tracking`, (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toContain('text/event-stream');

          res.on('data', (chunk) => {
            const text = chunk.toString();
            req.destroy();
            resolve(text);
          });
        });

        req.on('error', (err) => {
          // If aborted by destroy, ignore error
          if (!err.message.includes('socket hang up') && !err.message.includes('aborted')) {
            reject(err);
          }
        });
      });

      expect(receivedData).toContain('data: {"type":"STATUS_UPDATE"');
      expect(receivedData).toContain(orderId);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
