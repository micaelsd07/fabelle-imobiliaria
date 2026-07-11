import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { AuthGuard } from '../auth/auth.guard';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_FILES = 40;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB
const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20 MB — PDFs de contrato podem ser maiores

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DOC_MIME = ['application/pdf'];

const storage = diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase() || '';
    const safe = randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${safe}${ext}`);
  },
});

const fileToPayload = (f: Express.Multer.File) => ({
  url: `/uploads/${f.filename}`,
  originalName: f.originalname,
  size: f.size,
  mimeType: f.mimetype,
});

@Controller('upload')
export class UploadController {
  @UseGuards(AuthGuard)
  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      storage,
      limits: { fileSize: MAX_IMAGE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!IMAGE_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException(`Tipo de imagem não suportado: ${file.mimetype}`), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Nenhum arquivo enviado.');
    return { files: files.map(fileToPayload) };
  }

  @UseGuards(AuthGuard)
  @Post('document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: MAX_DOC_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!DOC_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException(`Só é permitido enviar PDF.`), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    return fileToPayload(file);
  }
}
