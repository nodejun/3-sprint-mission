import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/tests/**/*.test.ts', '**/*.spec.ts'],

  // 변환 설정
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // 모듈 확장자
  moduleFileExtensions: ['ts', 'js', 'json'],

  // 커버리지 설정
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov', 'json-summary'],

  // 커버리지 수집 대상 (선택사항)
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],

  // 커버리지에서 제외할 파일 패턴
  coveragePathIgnorePatterns: [
    'src/controllers/.*Comment.*',
    'src/controllers/notificationController.ts',
    'src/repositories/.*Comment.*',
    'src/repositories/notificationRepository.ts',
    'src/services/.*Comment.*',
    'src/services/notificationService.ts',
    'src/routes/.*Comment.*',
    'src/routes/notificationRouter.ts',
    'src/middlewares/errorHandler.ts',
    'src/middlewares/uploadMiddleware.ts',
    'src/middlewares/auth.ts',
    'src/server.ts',
    'src/utils/queryHelpers.ts',
    'src/utils/hash.ts',
  ],

  // 테스트 상세 출력
  verbose: true,

  // 테스트 타임아웃
  testTimeout: 10000,

  // 병렬 실행 제어
  maxWorkers: 1,

  // 각 테스트 전에 mock 초기화 (선택사항)
  clearMocks: true,

  // 테스트 환경 설정 파일
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};

export default config;
