import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads', 'products');

  constructor() {
    // Tạo thư mục uploads nếu chưa có
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadPath, fileName);
    
    fs.writeFileSync(filePath, file.buffer);
    
    // Trả về đường dẫn tương đối để lưu vào DB
    return `/uploads/products/${fileName}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async deleteFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      await this.deleteFile(filePath);
    }
  }
}
