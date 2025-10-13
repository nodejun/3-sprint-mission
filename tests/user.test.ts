import { beforeAll, beforeEach, afterAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import seedDatabase from '../prisma/seed';
import prisma from '../src/lib/prisma';

beforeEach(async () => {
  await seedDatabase();
});

describe('[유저 통합 테스트]', () => {
  describe('[회원 가입 테스트]', () => {
    test('POST /api/users (회원가입)성공', async () => {
      const userData = {
        username: 'kimcode',
        email: 'kimcode@code.com',
        password: 'passsword1',
      };
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send(userData);
      // 성공 응답
      expect(response.body.message).toBe('회원가입이 성공적으로 완료되었습니다.');
      expect(response.status).toBe(201);
      // user 객체 검증
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.username).toBe('kimcode');
      expect(response.body.user.email).toBe('kimcode@code.com');
      expect(response.body.user.createdAt).toBeDefined();
      expect(response.body.user.password).toBeUndefined();

      // 비밀번호는 반환되지 않아야 함
      expect(response.body.user.password).toBeUndefined();
    });

    test('POST /api/users(회원가입)userName중복', async () => {
      const userData = {
        username: '개발자김',
        email: 'kimcode@code.com',
        password: 'passsword1',
      };
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send(userData);

      expect(response.body.message).toBe('이미 사용 중인 사용자 이름입니다.');
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message');
      expect(response.body.user).toBeUndefined();
    });

    test('POST /api/users(회원가입)email중복', async () => {
      const userData = {
        username: 'kimcode',
        email: 'dev.kim@example.com',
        password: 'passsword1',
      };
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send(userData);

      expect(response.body.message).toBe('이미 사용 중인 이메일입니다.');
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message');
      expect(response.body.user).toBeUndefined();
    });
  });

  describe('[로그인 테스트]', () => {
    test('POST /api/users/login (로그인)성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };
      const response = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(response.body.message).toBe('로그인 성공!');
      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();

      // user 객체 검증
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.email).toBe('dev.kim@example.com');
      expect(response.body.user.password).toBeUndefined();
    });

    test('POST /api/users/login (로그인)없는 이메일', async () => {
      const loginData = {
        email: 'non-exist@example.com',
        password: 'passwordKim1!',
      };
      const response = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(response.body.message).toBe('이메일 또는 비밀번호를 확인해주세요.');
      expect(response.status).toBe(500);
      expect(response.body.accessToken).toBeUndefined();

      // user 객체 검증
      expect(response.body.user).toBeUndefined();
    });

    test('POST /api/users/login (로그인)틀린 비밀번호', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'wrongPassword!',
      };
      const response = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(response.body.message).toBe('이메일 또는 비밀번호를 확인해주세요.');
      expect(response.status).toBe(500);
      expect(response.body.accessToken).toBeUndefined();

      // user 객체 검증
      expect(response.body.user).toBeUndefined();
    });
  });

  describe('[로그아웃 테스트]', () => {
    test('POST /api/users/logout (로그아웃)성공', async () => {
      const agent = request.agent(app);

      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await agent
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();

      // 로그아웃 (Authorization 헤더 + 쿠키 자동 전송)
      const response = await agent
        .post('/api/users/logout')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send();

      expect(response.body.message).toBe('로그아웃이 성공적으로 완료되었습니다.');
      expect(response.status).toBe(200);

      // refreshToken 쿠키 삭제 확인
      expect(response.headers['set-cookie']).toBeDefined();
      const setCookieHeader = response.headers['set-cookie'];
      const cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader as string];
      const refreshTokenCookie = cookies.find((cookie) => cookie.includes('refreshToken'));
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toMatch(/refreshToken=.*Expires=Thu, 01 Jan 1970/);
    });

    test('POST /api/users/logout (로그아웃)엑세스 토큰 없음', async () => {
      const agent = request.agent(app);

      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인 (refreshToken 쿠키 자동 저장)
      const loginResponse = await agent
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.headers['set-cookie']).toBeDefined();

      // 로그아웃 (Authorization 헤더 + 쿠키 자동 전송)
      const response = await agent.post('/api/users/logout').send();

      expect(response.body.message).toBe('액세스 토큰이 제공되지 않았습니다.');
      expect(response.status).toBe(401);

      // refreshToken 쿠키 삭제 확인
      expect(response.headers['set-cookie']).toBeUndefined();
    });
  });

  describe('[유저 상세조회, 수정, 삭제]', () => {
    test('GET /api/users/me (유저 상세조회)성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인해서 토큰 받기
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();

      // 유저 상세조회
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.email).toBe('dev.kim@example.com');
      expect(response.body.user.username).toBeDefined();
      expect(response.body.user.createdAt).toBeDefined();

      // 비밀번호는 반환되지 않아야 함
      expect(response.body.user.password).toBeUndefined();
    });

    test('GET /api/users/me (유저 상세조회)탈퇴한 회원', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 1. 로그인해서 토큰 받기
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.body.user.id).toBeDefined();

      // 2. 사용자 삭제 (관리자가 삭제했다고 가정)
      await prisma.user.delete({
        where: { id: loginResponse.body.user.id },
      });

      // 3. 유효한 토큰이지만 삭제된 사용자로 상세조회 시도
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send();

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('사용자 프로필을 찾을 수 없습니다.');
    });

    test('PATCH /api/users/me (유저 수정)성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인해서 토큰 받기
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();

      const updateData = {
        username: '수정된김개발자',
        address: '테스트용 주소입니다.',
      };

      // 유저 정보 수정
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('회원 정보가 성공적으로 업데이트되었습니다.');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('수정된김개발자');
      expect(response.body.user.address).toBe('테스트용 주소입니다.');
      expect(response.body.user.email).toBe('dev.kim@example.com');

      // 비밀번호는 반환되지 않아야 함
      expect(response.body.user.password).toBeUndefined();
    });

    test('PATCH /api/users/me (유저 수정)중복된 username', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인해서 토큰 받기
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();

      // 이미 존재하는 username으로 수정 시도
      const updateData = {
        username: '기획자박', // seed 데이터에 이미 존재하는 username
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(updateData);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('이미 사용 중인 사용자 이름입니다.');
    });

    test('PATCH /api/users/me (유저 수정)유효하지 않은 데이터', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인해서 토큰 받기
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();

      // 유효하지 않은 데이터로 수정 시도
      const updateData = {
        username: 'a', // 너무 짧은 username
        email: 'invalid-email', // 잘못된 이메일 형식
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .set('Content-Type', 'application/json')
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('유효성 검사 오류');
    });
    test('PATCH /api/users/me (유저 삭제)성공', async () => {
      const loginData = {
        email: 'dev.kim@example.com',
        password: 'passwordKim1!',
      };

      // 로그인해서 토큰 받기
      const loginResponse = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send(loginData);

      expect(loginResponse.body.accessToken).toBeDefined();

      // 유저 삭제 시도
      const response = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

      expect(response.status).toBe(204);
      expect(response.body.user).toBeUndefined();
    });
  });
});
