import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import router from './routes';

const app = new Koa();

app.use(bodyParser());
app.use(cors());
app.use(router.routes());

app.listen(3001, () => {
  console.log(`Server listening on port 3001`);
});
