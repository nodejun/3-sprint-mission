import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import path from 'path';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY_ID!,
  },
});

const bucketName = process.env.AWS_S3_BUCKET!;
// Multer memoryStorage 설정
const storage = (subpath: string) => multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, png, gif) are allowed!'));
  }
};
// S3에 파일 업로드 함수
const uploadToS3 = async (file: Express.Multer.File, subpath: string): Promise<string> => {
  const extname = path.extname(file.originalname);
  const fileName = `${subpath}/${file.fieldname}-${Date.now()}${extname}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;
};

export const uploadImage = (subpath: string) => {
  const upload = multer({
    storage: storage(subpath),
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  return (req: Request, res: any, next: any) => {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return next(err);
      }

      if (req.file) {
        try {
          const imageUrl = await uploadToS3(req.file, subpath);
          req.file.location = imageUrl;
          next();
        } catch (uploadErr) {
          next(uploadErr);
        }
      } else {
        next();
      }
    });
  };
};
