import request from 'supertest';
import express from 'express';
import { AppDataSource, initializeDatabase, closeDatabase } from '../src/config/database';
import userRoutes from '../src/routes/userRoutes';
import { errorHandler } from '../src/middleware/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use(errorHandler);

describe('User API Integration Tests', () => {
  let createdUserId: string;

  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(async () => {
    if (createdUserId) {
      await AppDataSource.query('DELETE FROM users WHERE id = ?', [createdUserId]);
    }
    await closeDatabase();
  });

  const validUser = {
    name: 'John Doe',
    email: `john.doe.${Date.now()}@example.com`,
    primaryMobile: '9876543210',
    secondaryMobile: '8765432109',
    aadhaar: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    pan: 'ABCDE1234F',
    dateOfBirth: '1990-01-15',
    placeOfBirth: 'Mumbai',
    currentAddress: '123 Street, Mumbai, Maharashtra 400001',
    permanentAddress: '456 Avenue, Pune, Maharashtra 411001',
  };

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(validUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(validUser.name);
      expect(response.body.data.email).toBe(validUser.email);

      createdUserId = response.body.data.id;
    });

    it('should fail when creating user with duplicate email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(validUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ ...validUser, email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid mobile number', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          ...validUser,
          email: `test.${Date.now()}@example.com`,
          primaryMobile: '1234567890',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const response = await request(app)
        .get(`/api/users/${createdUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdUserId);
      expect(response.body.data.name).toBe(validUser.name);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    it('should get all users with pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should search users by name', async () => {
      const response = await request(app)
        .get(`/api/users?search=${validUser.name}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      const updatedName = 'Jane Doe Updated';
      const response = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send({ name: updatedName })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updatedName);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/550e8400-e29b-41d4-a716-446655440000')
        .send({ name: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should soft delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for deleted user', async () => {
      const response = await request(app)
        .get(`/api/users/${createdUserId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/:id/restore', () => {
    it('should restore soft-deleted user', async () => {
      const response = await request(app)
        .post(`/api/users/${createdUserId}/restore`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdUserId);
    });
  });

  describe('GET /api/users/stats', () => {
    it('should get user statistics', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('inactive');
      expect(response.body.data).toHaveProperty('suspended');
    });
  });
});
