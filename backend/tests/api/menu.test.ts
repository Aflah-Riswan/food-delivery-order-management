import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { MockMenuRepository } from '../mocks/MockRepositories.js';
import { MenuService } from '../../src/services/MenuService.js';

describe('GET /api/menu API', () => {
  it('should return 200 and list of menu items', async () => {
    const menuRepo = new MockMenuRepository();
    const menuService = new MenuService(menuRepo);
    const app = createApp({ menuService });

    const response = await request(app).get('/api/menu');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty('id');
    expect(response.body.data[0]).toHaveProperty('name');
    expect(response.body.data[0]).toHaveProperty('price');
  });

  it('should return 200 and single item for valid ID', async () => {
    const menuRepo = new MockMenuRepository();
    const menuService = new MenuService(menuRepo);
    const app = createApp({ menuService });

    const response = await request(app).get('/api/menu/item-1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe('item-1');
  });

  it('should return 404 for unknown menu item ID', async () => {
    const menuRepo = new MockMenuRepository();
    const menuService = new MenuService(menuRepo);
    const app = createApp({ menuService });

    const response = await request(app).get('/api/menu/unknown-id');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not found');
  });
});
