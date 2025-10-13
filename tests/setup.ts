// Jest 테스트 환경 설정
import { afterAll } from '@jest/globals';

// console.error 필터링 (seed 에러는 출력, 다른 에러는 억제)
const originalConsoleError = console.error;
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
  const message = args[0];

  // seed 관련 에러는 출력
  if (typeof message === 'string' && message.includes('Seeding')) {
    originalConsoleError(...args);
    return;
  }
});

// 테스트 완료 후 원래 상태로 복원
afterAll(() => {
  consoleErrorSpy.mockRestore();
});
