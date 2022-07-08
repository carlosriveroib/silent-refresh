import { Context } from 'koa';
import Router from '@koa/router';
import jwt from 'jsonwebtoken';

const router = new Router();

const ACCESS_TOKEN_EXPIRES_IN = 10;
const EMAIL = 'rive.46@gmail.com';
const SECRET = 'secret';

router.post('/generateToken', (ctx: Context) => {
  const accessToken = jwt.sign({ email: EMAIL }, SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ email: EMAIL }, SECRET, {
    expiresIn: 6000000,
  });

  ctx.cookies.set('refreshToken', refreshToken, {
    // secure: true,
    httpOnly: true,
  });
  ctx.body = {
    accessToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  };
});

router.post('/needTokenForThis', (ctx: Context) => {
  const accessToken = ctx.headers['authorization'];

  ctx.assert(accessToken, 401, 'No access token');

  try {
    jwt.verify(accessToken.replace('Bearer ', ''), SECRET);
    ctx.status = 200;
    ctx.body = {
      email: EMAIL,
    };
  } catch (error) {
    ctx.status = 401;
    ctx.body = {
      type: 'TokenExpired',
      message: 'Access token expired',
    };
  }
});

router.post('/refreshToken', (ctx: Context) => {
  const refreshToken = ctx.cookies.get('refreshToken');

  ctx.assert(refreshToken, 401, 'No refresh token provided');

  try {
    jwt.verify(refreshToken, SECRET);

    const newAccessToken = jwt.sign({ email: EMAIL }, SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    ctx.status = 200;
    ctx.body = {
      accessToken: newAccessToken,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    };
  } catch (error) {
    if (error instanceof Error) {
      ctx.status = 401;
      ctx.body = { type: 'RefreshTokenError', message: error.message };
    }
  }
});

export default router;
