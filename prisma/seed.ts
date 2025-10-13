import { Prisma } from '@prisma/client';
import hashUtils from '../src/utils/hash';
import prisma from '../src/lib/prisma';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function seedDatabase(): Promise<void> {

  let retries = 0;
  let seedingSuccessful = false;

  while (retries < MAX_RETRIES && !seedingSuccessful) {
    try {

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await Promise.all<Prisma.BatchPayload>([
          tx.notification.deleteMany({}),
          tx.productLike.deleteMany({}),
          tx.articleLike.deleteMany({}),
          tx.articleComment.deleteMany({}),
          tx.productComment.deleteMany({}),
          tx.product.deleteMany({}),
          tx.article.deleteMany({}),
          tx.user.deleteMany({}),
        ]);

        const hashedPasswordKim = await hashUtils.hashingPassword('passwordKim1!');
        const userKim = await tx.user.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            username: '개발자김',
            email: 'dev.kim@example.com',
            password: hashedPasswordKim,
            address: '서울시 강남구 테헤란로',
            imageUrl: 'https://picsum.photos/seed/userkim/200/200',
          },
        });

        const hashedPasswordLee = await hashUtils.hashingPassword('passwordLee2!');
        const userLee = await tx.user.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            username: '디자이너이',
            email: 'designer.lee@example.com',
            password: hashedPasswordLee,
            address: '경기도 성남시 분당구',
            imageUrl: 'https://picsum.photos/seed/userlee/200/200',
          },
        });

        const hashedPasswordPark = await hashUtils.hashingPassword('passwordPark3!');
        const userPark = await tx.user.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440003',
            username: '기획자박',
            email: 'planner.park@example.com',
            password: hashedPasswordPark,
            address: '부산시 해운대구',
            imageUrl: 'https://picsum.photos/seed/userpark/200/200',
          },
        });

        const productNodejs = await tx.product.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655441001',
            name: '노드JS 마스터 가이드 북 (새상품)',
            description: 'Node.js의 비동기 처리, 스트림, 클러스터링 등 심화 내용을 다룹니다. 초보자부터 숙련자까지.',
            price: 45000,
            isSold: false,
            tags: ['NEW_PRODUCT', 'BOOKS', 'FREE_SHIPPING', 'IMAGE_UPLOADED'],
            stock: 3,
            userId: userKim.id,
            imageUrl: 'https://picsum.photos/seed/nodejsbook/600/400',
          },
        });

        const productIphone = await tx.product.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655441002',
            name: '중고 아이폰 13 프로 (A급)',
            description: '배터리 효율 90%, 생활 기스 약간. 케이스와 필름 부착하고 사용하여 깨끗합니다.',
            price: 850000,
            isSold: false,
            tags: ['A_GRADE', 'ELECTRONICS', 'PRICE_NEGOTIABLE', 'IMAGE_UPLOADED'],
            stock: 1,
            userId: userLee.id,
            imageUrl: 'https://picsum.photos/seed/iphone13/600/400',
          },
        });

        const productSneakers = await tx.product.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655441003',
            name: '리미티드 에디션 스니커즈 (270mm)',
            description: '수집가들을 위한 한정판 스니커즈. 미개봉 상태입니다.',
            price: 300000,
            isSold: false,
            tags: ['LIMITED_EDITION', 'CLOTHING', 'DIRECT_DEAL', 'IMAGE_UPLOADED'],
            stock: 1,
            userId: userPark.id,
            imageUrl: 'https://picsum.photos/seed/sneakers/600/400',
          },
        });

        const articlePrisma = await tx.article.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655442001',
            title: 'Prisma 마이그레이션 전략에 대한 고찰',
            content: '개발 초기 단계와 운영 단계에서의 Prisma 마이그레이션 전략에 대해 깊이 있게 다뤄봅니다. 여러분의 경험도 공유해주세요!',
            imageUrl: 'https://picsum.photos/seed/prisma/600/400',
            userId: userKim.id,
          },
        });

        const articleExpress = await tx.article.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655442002',
            title: 'Express 미들웨어 최적화 방법',
            content: '수많은 미들웨어를 효율적으로 관리하고 Express 앱의 성능을 최적화하는 팁들을 공유합니다.',
            imageUrl: 'https://picsum.photos/seed/express/600/400',
            userId: userLee.id,
          },
        });

        await tx.productComment.create({
          data: {
            content: '이 책 정말 내용이 알차 보여요! 혹시 목차 사진 볼 수 있을까요?',
            product: { connect: { id: productNodejs.id } },
            user: { connect: { id: userLee.id } },
          },
        });

        await tx.productComment.create({
          data: {
            content: '직거래 시 가격 네고 가능할까요? 구매 희망합니다!',
            product: { connect: { id: productIphone.id } },
            user: { connect: { id: userKim.id } },
          },
        });

        await tx.articleComment.create({
          data: {
            content: '좋은 글 감사합니다. 저도 마이그레이션 때문에 고민이 많았는데 큰 도움이 됐어요.',
            article: { connect: { id: articlePrisma.id } },
            user: { connect: { id: userPark.id } },
          },
        });

        await tx.articleComment.create({
          data: {
            content: 'Render.com 배포 관련해서 더 자세한 내용도 알려주실 수 있나요?',
            article: { connect: { id: articleExpress.id } },
            user: { connect: { id: userKim.id } },
          },
        });

        // --- 좋아요 시딩 ---
        await tx.productLike.create({
          data: {
            userId: userLee.id,
            productId: productNodejs.id,
          },
        });

        await tx.productLike.create({
          data: {
            userId: userPark.id,
            productId: productIphone.id,
          },
        });

        await tx.articleLike.create({
          data: {
            userId: userLee.id,
            articleId: articlePrisma.id,
          },
        });

        await tx.articleLike.create({
          data: {
            userId: userKim.id,
            articleId: articleExpress.id,
          },
        });
      });

      seedingSuccessful = true;
      if (process.env.NODE_ENV !== 'test') {
        console.log('✅ Seeding completed successfully');
      }
    } catch (e: unknown) {
      console.error(`❌ Seeding attempt ${retries + 1} failed:`, e);
      retries++;

      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error(`❌ Maximum retry attempts reached. Seeding failed.`);
      }
    }
  }

  if (!seedingSuccessful) {
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase()
    .catch(async (e) => {
      console.error('Seeding failed:', e);
      await prisma.$disconnect();
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

  export default seedDatabase