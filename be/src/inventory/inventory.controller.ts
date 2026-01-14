import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateImportDto } from './dto/create-import.dto';
import { CreateExportDto } from './dto/create-export.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { UpdateExportDto } from './dto/update-export.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('import')
  async createImport(@Body() createImportDto: CreateImportDto, @Request() req) {
    return await this.inventoryService.createImport(createImportDto, req.user.id);
  }

  @Post('export')
  async createExport(@Body() createExportDto: CreateExportDto, @Request() req) {
    return await this.inventoryService.createExport(createExportDto, req.user.id);
  }

  @Get('imports')
  async findAllImports() {
    return await this.inventoryService.findAllImports();
  }

  @Get('exports')
  async findAllExports() {
    return await this.inventoryService.findAllExports();
  }

  @Get('imports/:id')
  async findOneImport(@Param('id', ParseIntPipe) id: number) {
    return await this.inventoryService.findOneImport(id);
  }

  @Get('exports/:id')
  async findOneExport(@Param('id', ParseIntPipe) id: number) {
    return await this.inventoryService.findOneExport(id);
  }

  @Put('imports/:id')
  async updateImport(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImportDto: UpdateImportDto,
  ) {
    return await this.inventoryService.updateImport(id, updateImportDto);
  }

  @Put('exports/:id')
  async updateExport(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExportDto: UpdateExportDto,
  ) {
    return await this.inventoryService.updateExport(id, updateExportDto);
  }

  @Delete('imports/:id')
  async removeImport(@Param('id', ParseIntPipe) id: number) {
    await this.inventoryService.removeImport(id);
    return { message: 'Xóa phiếu nhập thành công' };
  }

  @Delete('exports/:id')
  async removeExport(@Param('id', ParseIntPipe) id: number) {
    await this.inventoryService.removeExport(id);
    return { message: 'Xóa phiếu xuất thành công' };
  }

  @Get('report')
  async getInventoryReport(@Query('productId') productId?: string) {
    return await this.inventoryService.getInventoryReport(
      productId ? +productId : undefined,
    );
  }
}
