import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import productRouter from './routes/productRouter';
import userRouter from './routes/userRouter';
import articleRouter from './routes/articleRouter';
import productCommentRouter from './routes/productCommentsRouter';
import articleCommentsRouter from './routes/articleCommentsRouter';
import errorHandler from './middlewares/errorHandler';
import notificationRouter from './routes/notificationRouter';

const app = express();

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/products/:productId/comments', productCommentRouter);
app.use('/api/articles', articleRouter);
app.use('/api/articles/:articleId/comments', articleCommentsRouter);
app.use('/api/notifications', notificationRouter);

app.use(errorHandler);

export default app;