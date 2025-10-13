# 전역 설치
npm install -g pm2

# 설치 확인
pm2 --version

vi ecosystem.config.js              # 파일 생성 및 편집

# 실행 
pm2 start ecosystem.config.js --env production  //프로덕션 실행