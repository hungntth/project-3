import { Controller, Get, Post, Body, UseGuards, Param, Put, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { UploadService } from './upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { memoryStorage } from 'multer';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)'), false);
        }
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { urls: [] };
    }

    const imagePaths: string[] = [];
    for (const file of files) {
      const path = await this.uploadService.saveFile(file);
      imagePaths.push(path);
    }

    return { urls: imagePaths };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Get()
  async findAll() {
    return await this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async remove(@Param('id') id: string) {
    await this.productService.remove(+id);
    return { message: 'Xóa sản phẩm thành công' };
  }
}
