import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    console.log('Bắt đầu reset dữ liệu...');
    await seedService.clearAllData();
    await seedService.seedData();
    console.log('Hoàn thành! Dữ liệu mẫu đã được tạo thành công.');
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
