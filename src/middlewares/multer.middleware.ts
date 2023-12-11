import { diskStorage } from 'multer';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { Request } from 'express';

const createRoute = (req: Request) => {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = date.getMonth().toString();
  const day = date.getDate().toString();
  const directory = join(process.cwd(), 'public', 'uploads', year, month, day);
  req.body.fileUploadPath = join('uploads', year, month, day);
  mkdirSync(directory, { recursive: true });
  return directory;
};

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

export const multerConfig = {
  storage: diskStorage({
    destination: (
      request: Request,
      file: Express.Multer.File,
      callback: DestinationCallback,
    ): void => {
      if (file?.originalname) {
        const filePath = createRoute(request);
        return callback(null, filePath);
      }
    },
    filename: (
      request: Request,
      file: Express.Multer.File,
      callback: FileNameCallback,
    ): void => {
      if (file.originalname) {
        const fileName = String(file.originalname);
        request.body.filename = fileName;
        return callback(null, fileName);
      }
    },
  }),
};
