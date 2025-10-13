import { beforeAll, beforeEach, afterAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import seedDatabase from '../prisma/seed';

beforeEach(async () => {
  await seedDatabase();
});

describe('[게시글 통합 테스트]', () => {
  describe('[비 인가 게시글 API 테스트]', () => {
    test('GET /api/articles (목록 조회) 성공', async () => {
      // 게시글 조회
      const response = await request(app).get('/api/articles');
      // 응답 구조
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '조회하신 게시글 목록입니다.');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      // 응답 데이터 구조
      const firstArticle = response.body.data[0];
      expect(firstArticle).toHaveProperty('id');
      expect(firstArticle).toHaveProperty('title');
      expect(firstArticle).toHaveProperty('content');
      expect(firstArticle).toHaveProperty('userId');
      expect(firstArticle).toHaveProperty('imageUrl');
      expect(firstArticle).toHaveProperty('createdAt');
      expect(firstArticle).toHaveProperty('updatedAt');
      expect(firstArticle).toHaveProperty('username');
      expect(firstArticle).toHaveProperty('likeCount');
    });

    test('GET /api/articles/:articleId (상세 조회) 성공', async () => {
      // 게시글 목록 조회
      const listResponse = await request(app).get('/api/articles');
      // 응답 구조
      expect(listResponse.status).toBe(200);
      // 목록 조회한 Id로 상세 조회
      const articleId = listResponse.body.data[0].id;
      const response = await request(app).get(`/api/articles/${articleId}`);
      // 응답 구조
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '조회하신 게시글입니다');
      expect(response.body).toHaveProperty('data');
      // 응답 데이터 구조
      const article = response.body.data;
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('userId');
      expect(article).toHaveProperty('imageUrl');
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
      expect(article).toHaveProperty('isLiked');
      expect(article).toHaveProperty('username');
      expect(article).toHaveProperty('likeCount');
    });

    test('GET /api/articles/:articleId (상세 조회) 유효하지않은 ID', async () => {
      const articleId = '99999999999';
      const response = await request(app).get(`/api/articles/${articleId}`);
      // 응답 구조
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', '유효성 검사 오류');
      expect(response.body.data).toBeUndefined();
    });

    test('GET /api/articles/:articleId (상세 조회) 존재하지 않는 ID', async () => {
      const articleId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app).get(`/api/articles/${articleId}`);
      // 응답 구조
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', '게시글을 찾을 수 없습니다.');
      expect(response.body.data).toBeUndefined();
    });
  });
  describe('[인가 게시글 API 테스트]', () => {
    test('PORT /api/articles (게시글 생성) 성공', async () => {
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

      // 게시글 생성 (Authorization 헤더 + 쿠키 자동 전송)
      const articleData = {
        userId: loginResponse.body.userId,
        title: '테스트 게시글',
        content: '테스트용 게시글 컨텐트 입니다',
      };

      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(articleData);
      // 응답 구조
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', '게시글 등록 완료');
      expect(response.body).toHaveProperty('data');
      // 응답 데이터 구조
      const article = response.body.data;
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title', '테스트 게시글');
      expect(article).toHaveProperty('content', '테스트용 게시글 컨텐트 입니다');
      expect(article).toHaveProperty('userId');
      expect(article).toHaveProperty('imageUrl');
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
      expect(article).toHaveProperty('username');
      expect(article).toHaveProperty('likeCount');
    });

    test('PORT /api/articles (게시글 생성) 필수값 누락<title>', async () => {
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

      // 게시글 생성 (Authorization 헤더 + 쿠키 자동 전송)
      const articleData = {
        userId: loginResponse.body.userId,
        content: '테스트용 게시글 컨텐트 입니다',
      };

      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(articleData);
      // 응답 구조
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', '유효성 검사 오류');
      expect(response.body.data).toBeUndefined();
    });

    test('GET /api/articles/liked-articles (좋아요한 게시글 조회) 성공', async () => {
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
      // 목록 조회한 Id로 상세 조회
      const response = await request(app)
        .get(`/api/articles/liked-articles`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '좋아요한 게시글 목록입니다.');
      expect(response.body).toHaveProperty('data');
      // 응답 데이터 구조
      const article = response.body.data[0];
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('userId');
      expect(article).toHaveProperty('imageUrl');
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
    });

    test('GET /api/articles/liked-articles (좋아요한 게시글 조회) 좋아요한 게시글이 없는 경우', async () => {
      const loginData = {
        email: 'planner.park@example.com',
        password: 'passwordPark3!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();
      // 목록 조회한 Id로 상세 조회
      const response = await request(app)
        .get(`/api/articles/liked-articles`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', '게시글을 찾을 수 없습니다.');
      expect(response.body.data).toBeUndefined();
    });

    test('GET /api/articles/:articleId (인가 상세 조회) 성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);
      // 게시글 목록 조회
      const listResponse = await request(app).get('/api/articles');
      // 응답 구조
      expect(listResponse.status).toBe(200);
      // 목록 조회한 Id로 상세 조회
      const articleId = listResponse.body.data[1].id;
      const response = await request(app)
        .get(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '조회하신 게시글입니다');
      expect(response.body).toHaveProperty('data');
      // 응답 데이터 구조 <좋아요 한경우isLiked = true>
      const article = response.body.data;
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('userId');
      expect(article).toHaveProperty('imageUrl');
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
      expect(article).toHaveProperty('isLiked', true);
      expect(article).toHaveProperty('username');
      expect(article).toHaveProperty('likeCount');
    });

    test('PATCH /api/articles/:articleId (게시글 수정) 성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);
      // 김의 게시글 ID (고정)
      const articleId = '550e8400-e29b-41d4-a716-446655442001';
      const updateData = {
        userId: loginResponse.body.userId,
        title: '수정한 게시글',
        content: '수정한 게시글 컨텐트 입니다',
      };
      const response = await request(app)
        .patch(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(updateData);
      // 응답 구조
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '수정하신 게시글입니다');
      expect(response.body).toHaveProperty('data');
      // 응답 데이터 구조 <좋아요 한경우isLiked = true>
      const article = response.body.data;
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title', '수정한 게시글');
      expect(article).toHaveProperty('content', '수정한 게시글 컨텐트 입니다');
      expect(article).toHaveProperty('userId');
      expect(article).toHaveProperty('imageUrl');
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
      expect(article).toHaveProperty('username');
      expect(article).toHaveProperty('likeCount');
    });

    test('PATCH /api/articles/:articleId (게시글 수정) 권한 없음', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);
      // 이의 게시글 ID (김이 수정 권한 없음)
      const articleId = '550e8400-e29b-41d4-a716-446655442002';
      const updateData = {
        userId: loginResponse.body.userId,
        title: '수정한 게시글',
        content: '수정한 게시글 컨텐트 입니다',
      };
      const response = await request(app)
        .patch(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(updateData);
      // 응답 구조
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'message',
        '게시글을 수정하거나 삭제할 권한이 없습니다.',
      );
      expect(response.body.data).toBeUndefined;
    });

    test('PATCH /api/articles/:articleId (게시글 삭제) 성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);
      // 김의 게시글 ID (고정)
      const articleId = '550e8400-e29b-41d4-a716-446655442001';
      const response = await request(app)
        .delete(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(204);
      expect(response.body.message).toBeUndefined();
      expect(response.body.data).toBeUndefined();
    });

    test('PATCH /api/articles/:articleId (게시글 삭제) 권한 없음', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);
      // 이의 게시글 ID (김이 삭제 권한 없음)
      const articleId = '550e8400-e29b-41d4-a716-446655442002';
      const response = await request(app)
        .patch(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'message',
        '게시글을 수정하거나 삭제할 권한이 없습니다.',
      );
      expect(response.body.data).toBeUndefined;
    });

    test('post /api/articles/:articleId/like (게시글 좋아요) 성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);
      // 김이 좋아요하지 않은 게시글 (김 자신의 게시글)
      const articleId = '550e8400-e29b-41d4-a716-446655442001';
      const firstResponse = await request(app)
        .post(`/api/articles/${articleId}/like`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body).toHaveProperty('message', '좋아요가 추가되었습니다');
      expect(firstResponse.body.data).toBeUndefined();

      const secondResponse = await request(app)
        .post(`/api/articles/${articleId}/like`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);
      // 응답 구조
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body).toHaveProperty('message', '좋아요를 취소하였습니다');
      expect(secondResponse.body.data).toBeUndefined();
    });
  });
});
