import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { AuthGuard } from '../auth/auth.guard';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_FILES = 40;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const safe = randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${safe}${ext}`);
  },
});

@Controller('upload')
export class UploadController {
  @UseGuards(AuthGuard)
  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      storage,
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException(`Tipo de arquivo não suportado: ${file.mimetype}`), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Nenhum arquivo enviado.');
    return {
      files: files.map((f) => ({
        url: `/uploads/${f.filename}`,
        originalName: f.originalname,
        size: f.size,
        mimeType: f.mimetype,
      })),
    };
  }
}
