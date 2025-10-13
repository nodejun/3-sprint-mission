import { beforeAll, beforeEach, afterAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import seedDatabase from '../prisma/seed';

beforeEach(async () => {
  await seedDatabase();
});

describe('[상품 통합 테스트]', () => {
  describe('[비 인가 상품API 테스트]', () => {
    test('GET /api/products (목록 조회)성공', async () => {
      // 상품 조회
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '상품 목록 조회 성공!');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const firstProduct = response.body.data[0];
      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('name');
      expect(firstProduct).toHaveProperty('price');
      expect(firstProduct).toHaveProperty('isSold');
      expect(firstProduct).toHaveProperty('tags');
      expect(firstProduct).toHaveProperty('stock');
      expect(firstProduct).toHaveProperty('description');
      expect(firstProduct).toHaveProperty('imageUrl');
      expect(firstProduct).toHaveProperty('createdAt');
      expect(firstProduct).toHaveProperty('updatedAt');
      expect(firstProduct).toHaveProperty('userId');
      expect(firstProduct).toHaveProperty('username');
      expect(firstProduct).toHaveProperty('likeCount');
    });

    test('GET /api/products/:productId (상세 조회) 성공', async () => {
      // 먼저 상품 목록을 조회해서 존재하는 상품 ID를 가져옴
      const listResponse = await request(app).get('/api/products');
      const productId = listResponse.body.data[0].id;

      // 조회한 상품 목록의 productId로 비인가 상세 조회
      const response = await request(app).get(`/api/products/${productId}`);

      // 응답 구조
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '상품 상세 조회 성공!');
      expect(response.body).toHaveProperty('data');
      // 응답 데이터 구조
      const product = response.body.data;
      expect(product).toHaveProperty('id', productId);
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('isSold');
      expect(product).toHaveProperty('tags');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('imageUrl');
      expect(product).toHaveProperty('createdAt');
      expect(product).toHaveProperty('updatedAt');
      expect(product).toHaveProperty('userId');
      expect(product).toHaveProperty('username');
      expect(product).toHaveProperty('likeCount');
      expect(product.isLiked).toBe(false);
    });

    test('GET /api/products/:productId (상세 조회) 유효 하지 않은 Id', async () => {
      const productId = '99999999999';
      // 존재하지 않는 productId로 비인가 상세 조회
      const response = await request(app).get(`/api/products/${productId}`);

      // 응답 구조
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', '유효성 검사 오류');
      expect(response.body.data).toBeUndefined();
    });

    test('GET /api/products/:productId (상세 조회) 존재하지 않는 상품', async () => {
      // 유효한 UUID v4 형식이지만 존재하지 않는 ID
      const productId = '550e8400-e29b-41d4-a716-446655440000';
      // 존재하지 않는 productId로 비인가 상세 조회
      const response = await request(app).get(`/api/products/${productId}`);

      // 응답 구조
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', '상품을 찾을 수 없습니다.');
      expect(response.body.data).toBeUndefined();
    });
  });
  describe('[인가 상품 API 테스트]', () => {
    test('POST /api/products (상품 생성)성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();

      // 상품 생성 (Authorization 헤더 + 쿠키 자동 전송)
      const productData = {
        userId: loginResponse.body.userId,
        name: '테스트 상품',
        price: 10000,
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(productData);
      // 응답 구조
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', '상품 등록 성공!');
      expect(response.body.data).toBeDefined();
      // 응답 데이터 구조
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', '테스트 상품');
      expect(response.body.data).toHaveProperty('price', 10000);
      expect(response.body.data).toHaveProperty('isSold', false);
      expect(response.body.data).toHaveProperty('tags');
      expect(response.body.data).toHaveProperty('stock', 0);
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('imageUrl');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('likeCount');
      expect(response.body.data.likeCount).toBe(0);
    });

    test('POST /api/products (상품 생성)필수값 누락<가격>', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();

      // 상품 생성 (Authorization 헤더 + 쿠키 자동 전송)
      const productData = {
        userId: loginResponse.body.userId,
        name: '테스트 상품',
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(productData);

      // 응답 구조
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', '유효성 검사 오류');
      expect(response.body.data).toBeUndefined();
    });

    test('GET /api/products/liked-products (좋아요한 상품 조회) 성공', async () => {
      const loginData = {
        email: 'designer.lee@example.com',
        password: 'passwordLee2!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();

      const response = await request(app)
        .get('/api/products/liked-products')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '좋아요 상품 조회 성공!');
      expect(response.body.data).toBeDefined();
      // 응답 데이터 구조
      const product = response.body.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('isSold');
      expect(product).toHaveProperty('tags');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('imageUrl');
      expect(product).toHaveProperty('createdAt');
      expect(product).toHaveProperty('updatedAt');
      expect(product).toHaveProperty('userId');
    });

    test('GET /api/products/liked-products (좋아요한 상품 조회) 좋아요한 상품이 없는 경우', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();

      const response = await request(app)
        .get('/api/products/liked-products')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', '상품을 찾을 수 없습니다.');
      expect(response.body.data).toBeUndefined();
    });

    test('GET /api/products/:productId (상품 상세조회) 성공', async () => {
      const loginData = {
        email: 'designer.lee@example.com',
        password: 'passwordLee2!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();
      // 상품 리스트 조회
      const listResponse = await request(app).get('/api/products');
      const productId = listResponse.body.data[0].id;
      // 리스트에서 받은 상품Id로 조회
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '상품 상세 조회 성공!');
      expect(response.body.data).toBeDefined();
      // 응답 데이터 구조
      const product = response.body.data;
      expect(product).toHaveProperty('id', productId);
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('isSold');
      expect(product).toHaveProperty('tags');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('imageUrl');
      expect(product).toHaveProperty('createdAt');
      expect(product).toHaveProperty('updatedAt');
      expect(product).toHaveProperty('userId');
      expect(product).toHaveProperty('username');
      expect(product).toHaveProperty('likeCount');
      expect(product).toHaveProperty('isLiked');
    });

    test('GET /api/products/:productId (상품 수정) 성공', async () => {
      const spyOn = jest.spyOn(
        require('../src/services/realtimeNotificationService'),
        'sendRealtimeNotification',
      );
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();
      // 김의 상품 ID (고정)
      const productId = '550e8400-e29b-41d4-a716-446655441001';
      // 리스트에서 받은 상품Id로 수정
      const productData = {
        userId: loginResponse.body.userId,
        name: '테스트 수정 상품',
        price: 30000,
      };
      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(productData);
      // 응답 구조
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '상품 정보 수정 성공!');
      expect(response.body.data).toBeDefined();
      // 알림 발송 감시
      expect(spyOn).toHaveBeenCalled();
      // 응답 데이터 구조
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', '테스트 수정 상품');
      expect(response.body.data).toHaveProperty('price', 30000);
      expect(response.body.data).toHaveProperty('isSold');
      expect(response.body.data).toHaveProperty('tags');
      expect(response.body.data).toHaveProperty('stock');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('imageUrl');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('likeCount');
    });

    test('GET /api/products/:productId (상품 수정) 권한 없음', async () => {
      const loginData = {
        email: 'designer.lee@example.com',
        password: 'passwordLee2!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();
      // 김의 상품 ID (이가 수정 권한 없음)
      const productId = '550e8400-e29b-41d4-a716-446655441001';
      // 리스트에서 받은 상품Id로 수정
      const productData = {
        userId: loginResponse.body.userId,
        name: '테스트 수정 상품',
        price: 30000,
      };
      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(productData);
      // 응답 구조
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', '상품을 수정하거나 삭제할 권한이 없습니다.');
      expect(response.body.data).toBeUndefined();
    });

    test('GET /api/products/:productId (상품 삭제) 성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();
      // 김의 상품 ID (고정)
      const productId = '550e8400-e29b-41d4-a716-446655441001';
      // 리스트에서 받은 상품Id로 수정
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(204);
      expect(response.body.message).toBeUndefined();
      expect(response.body.data).toBeUndefined();
    });

    test('GET /api/products/:productId (상품 삭제) 권한 없음', async () => {
      const loginData = {
        email: 'designer.lee@example.com',
        password: 'passwordLee2!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();
      // 김의 상품 ID (이가 삭제 권한 없음)
      const productId = '550e8400-e29b-41d4-a716-446655441001';
      // 리스트에서 받은 상품Id로 수정
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', '상품을 수정하거나 삭제할 권한이 없습니다.');
      expect(response.body.data).toBeUndefined();
    });

    test('GET /api/products/:productId/like (상품 좋아요) 성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();
      // 김이 좋아요하지 않은 상품 (박의 상품)
      const productId = '550e8400-e29b-41d4-a716-446655441003';
      // 리스트에서 받은 상품Id로 좋아요 추가
      const firstResponse = await request(app)
        .post(`/api/products/${productId}/like`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body).toHaveProperty('message', '좋아요가 추가되었습니다');
      expect(firstResponse.body.data).toBeUndefined();
      // 리스트에서 받은 상품Id로 좋아요 취소
      const secondResponse = await request(app)
        .post(`/api/products/${productId}/like`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body).toHaveProperty('message', '좋아요를 취소하였습니다');
      expect(secondResponse.body.data).toBeUndefined();
    });
  });
});
