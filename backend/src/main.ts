import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não definido no ambiente. Configure em backend/.env antes de iniciar.');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
  app.enableCors({
    origin: frontendUrl.split(',').map((s) => s.trim()),
    credentials: true,
  });

  const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  console.log(`Fabelle Imobiliária Backend running on: http://localhost:${port}`);
  console.log(`CORS liberado para: ${frontendUrl}`);
  console.log(`Uploads servidos em: /uploads/*  (pasta física: ${uploadsDir})`);
  if (process.env.NODE_ENV === 'production' && !process.env.PERSISTENT_STORAGE) {
    console.warn(
      '⚠️  AVISO: rodando em produção sem storage persistente. Uploads serão perdidos em cada deploy/restart.',
    );
    console.warn('   Configure Cloudflare R2 ou S3 antes de aceitar dados reais.');
  }
}
bootstrap();
