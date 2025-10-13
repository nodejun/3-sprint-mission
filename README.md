# My Project

![Coverage](./coverage/badges.svg)

---

## 🚀 프로젝트 개요

본 프로젝트는 Node.js와 Express.js를 활용하여 구축된 RESTful API 서버입니다. PostgreSQL 데이터베이스를 기반으로 중고마켓과 자유게시판의 핵심 기능을 구현했습니다.

---

## ✨ 주요 기능(요구사항)

### 👤 사용자 (User)

- **사용자 관리**: 사용자 정보 등록 (회원가입), 조회, 수정, 삭제 API 제공.

### 🛍️ 중고마켓

- **상품 CRUD**: 상품 등록, 상세 조회, 수정, 삭제 API 제공.
- **상품 목록**: Offset 기반 페이지네이션, 최신순 정렬, 이름/설명 검색 기능 포함.

### ✍️ 자유게시판

- **게시글 CRUD**: 게시글 등록, 상세 조회, 수정, 삭제 API 제공.
- **게시글 목록**: Offset 기반 페이지네이션, 최신순 정렬, 제목/내용 검색 기능 포함.

### 💬 댓글

- **댓글 등록**: 중고마켓 상품 및 자유게시판 게시글에 댓글 등록 가능.
- **댓글 관리**: 댓글 수정 및 삭제 API 제공.
- **댓글 목록**: Cursor 기반 페이지네이션 포함.

### 🛠️ 공통 구현

- **데이터베이스**: PostgreSQL 사용, 데이터 모델 간 **`onDelete`** 관계 설정, **데이터베이스 시딩** 코드 제공.
- **에러 처리**: 모든 예외 상황을 처리하는 **전역 에러 핸들러 미들웨어** 구현 (HTTP 500, 400, 404 등).
- **유효성 검증**: 상품 및 게시글 등록 시 입력 데이터 유효성 검증 미들웨어 적용.
- **이미지 업로드**: \*\*`multer`\*\*를 사용한 이미지 업로드 API 구현 및 서버 저장.
- **코드 구조**: \*\*`app.route()`\*\*를 통한 라우트 중복 제거, \*\*`express.Router()`\*\*를 활용한 모듈별 라우트 분리.
- **환경 설정**: **`.env`** 파일을 통한 환경 변수 관리, **CORS** 설정.
- **배포**: **Render.com**을 통한 클라우드 배포.

---

## 📁 파일 구조

프로젝트의 핵심 파일 및 디렉토리 구조는 다음과 같습니다:

```
.
├── prisma/                          # Prisma ORM 관련 파일
│   ├── migrations/                  # 데이터베이스 마이그레이션 파일
│   ├── schema.prisma                # Prisma 데이터베이스 스키마 정의
│   └── seed.js                      # 데이터베이스 시딩 스크립트 (초기 데이터 주입)
├── src/                             # 소스 코드 디렉토리
│   ├── middlewares/                 # Express 미들웨어 정의
│   │   ├── validation.middleware.js # 유효성 검증 미들웨어 (Superstruct 스키마 포함)
│   │   └── upload.middleware.js     # Multer 이미지 업로드 미들웨어
│   ├── routes/                      # API 라우트 정의 (Express Router)
│   │   ├── products.router.js
│   │   ├── users.router.js
│   │   ├── articles.router.js
│   │   ├── productComments.router.js
│   │   └── articleComments.router.js
│   ├── services/                    # 비즈니스 로직 처리 (데이터베이스와 상호작용)
│   │   ├── products.service.js
│   │   ├── users.service.js
│   │   ├── articles.service.js
│   │   ├── productComments.service.js
│   │   └── articleComments.service.js
│   ├── utils/                       # 공통 유틸리티 함수
│   │   ├── asyncHandler.js          # 비동기 에러 핸들링 유틸리티
│   │   ├── queryHelpers.js          # 쿼리 관련 헬퍼 함수
│   │   └── uploadDataConverter.js   # 업로드 데이터 변환 헬퍼 함수
│   ├── app.js                       # Express 애플리케이션 초기 설정 및 미들웨어, 라우터 연결
│   └── server.js                    # 서버 시작 (app.js를 import하여 포트 리스닝)
├── .env                             # 환경 변수 설정 파일 (민감 정보)
├── .gitignore                       # Git 추적에서 제외할 파일 목록
├── package.json                     # 프로젝트 의존성 및 스크립트 정의
└── README.md                        # 프로젝트 설명 문서 (현재 파일)
```

---

## 💻 기술 스택

- **백엔드**: Node.js, Express.js
- **데이터베이스**: PostgreSQL
- **미들웨어**: multer, CORS
- **배포**: Render.com
- **유효성검사**: superstruct, isEmail, isUuid

---

## 멘토에게

- 전체적인 코드의 적합성이 궁굼합니다
- multer를 이용하여 이미지 업로드를 구현하기는 했으나 아직잘 모르겠습니다
- 오류처리 방식이 올바르게 되어있는지 궁굼합니다

## ✨ 구현 내용

- Product, ElectronicProduct, Article 클래스 정의
- Panda Market API 기반의 Product/Article 관련 함수 구현
- Article 클래스에 생성일자(createdAt) 필드 추가
- 파일 분리 및 비동기 처리 방식 적용

---

## 🔍 상세 구현 사항

### 🧱 클래스 설계

#### ✅ Product 클래스

- 필드: `name`, `description`, `price`, `tags[]`, `images[]`, `favoriteCount`
- 메서드: `favorite()` → 호출 시 찜 수 +1

#### ✅ ElectronicProduct 클래스

- `Product` 상속
- 추가 필드: `manufacturer`

#### ✅ Article 클래스

- 필드: `title`, `content`, `writer`, `likeCount`, `createdAt`
- 메서드: `like()` → 호출 시 좋아요 수 +1
- 생성 시점에 `createdAt` 자동 저장

> ⚙️ 모든 클래스는 `constructor` 포함, 객체지향 4대 원칙(추상화/캡슐화/상속/다형성) 고려

---

## 🔗 API 기능 구현

### 📄 Article API (`fetch`, `.then`, `.catch` 사용)

- `getArticleList(page, pageSize, keyword)`
- `getArticle(id)`
- `createArticle(title, content, image)`
- `patchArticle(id, data)`
- `deleteArticle(id)`

### 🛒 Product API (`async/await`, `try/catch` 사용)

- `getProductList(page, pageSize, keyword)`
- `getProduct(id)`
- `createProduct(name, description, price, tags, images)`
- `patchProduct(id, data)`
- `deleteProduct(id)`

---

## 📁 파일 구조 및 모듈화

- `ProductService.js`: Product API 관련 함수 export
- `ArticleService.js`: Article API 관련 함수 export
- `main.js`: 전체 기능 import 및 실행

---

## 📦 상품 인스턴스 처리 로직

- `getProductList()` 호출 결과 → `products[]` 배열로 저장
- `tags`에 `"전자제품"` 포함 시 → `ElectronicProduct` 인스턴스로 생성
- 그 외 → `Product` 인스턴스로 생성

---

## ✅ 테스트 방법

- `main.js`에서 각 클래스와 API 함수 실행
- 메서드(favorite, like) 호출 확인
- 생성일자(createdAt) 자동 설정 확인
- 콘솔 출력을 통한 결과 검증

---

## ❗ 기타 참고사항

- 오류 처리 방식 통일: Article API는 `.then/.catch`, Product API는 `async/await + try/catch`
- 모든 메서드 정상 작동 및 분기 처리 완료
