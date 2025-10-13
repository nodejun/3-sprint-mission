
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 기본 업로드 디렉토리 (최상위 uploads 폴더)
const baseUploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Multer DiskStorage 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetUploadDir = req.uploadPath || baseUploadDir;

    if (!fs.existsSync(targetUploadDir)) {
      fs.mkdirSync(targetUploadDir, { recursive: true });
    }
    cb(null, targetUploadDir);
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, png, gif) are allowed!'), false);
  }
};
const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

export default uploadImage;