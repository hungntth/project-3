import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Import } from './entities/import.entity';
import { Export } from './entities/export.entity';
import { CreateImportDto } from './dto/create-import.dto';
import { CreateExportDto } from './dto/create-export.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { UpdateExportDto } from './dto/update-export.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Import)
    private importRepository: Repository<Import>,
    @InjectRepository(Export)
    private exportRepository: Repository<Export>,
    private productService: ProductService,
  ) {}

  async createImport(createImportDto: CreateImportDto, userId: number): Promise<Import> {
    // Kiểm tra sản phẩm tồn tại
    await this.productService.findOne(createImportDto.productId);

    // Tạo mã phiếu nhập
    const importCode = `NH${Date.now()}`;

    const importRecord = this.importRepository.create({
      ...createImportDto,
      importCode,
      createdById: userId,
    });

    const savedImport = await this.importRepository.save(importRecord);

    // Cập nhật số dư kho
    await this.productService.updateBalance(
      createImportDto.productId,
      createImportDto.quantity,
      'import',
    );

    return savedImport;
  }

  async createExport(createExportDto: CreateExportDto, userId: number): Promise<Export> {
    // Kiểm tra sản phẩm tồn tại
    await this.productService.findOne(createExportDto.productId);

    // Tạo mã phiếu xuất
    const exportCode = `XU${Date.now()}`;

    const exportRecord = this.exportRepository.create({
      ...createExportDto,
      exportCode,
      createdById: userId,
    });

    const savedExport = await this.exportRepository.save(exportRecord);

    // Cập nhật số dư kho
    await this.productService.updateBalance(
      createExportDto.productId,
      createExportDto.quantity,
      'export',
    );

    return savedExport;
  }

  async findAllImports(): Promise<Import[]> {
    return await this.importRepository.find({
      relations: ['product', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllExports(): Promise<Export[]> {
    return await this.exportRepository.find({
      relations: ['product', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneImport(id: number): Promise<Import> {
    const importRecord = await this.importRepository.findOne({
      where: { id },
      relations: ['product', 'createdBy'],
    });
    if (!importRecord) {
      throw new NotFoundException(`Phiếu nhập với ID ${id} không tồn tại`);
    }
    return importRecord;
  }

  async findOneExport(id: number): Promise<Export> {
    const exportRecord = await this.exportRepository.findOne({
      where: { id },
      relations: ['product', 'createdBy'],
    });
    if (!exportRecord) {
      throw new NotFoundException(`Phiếu xuất với ID ${id} không tồn tại`);
    }
    return exportRecord;
  }

  async updateImport(
    id: number,
    updateImportDto: UpdateImportDto,
  ): Promise<Import> {
    const importRecord = await this.findOneImport(id);
    const oldQuantity = Number(importRecord.quantity);
    const oldProductId = importRecord.productId;

    // Nếu thay đổi sản phẩm hoặc số lượng, cần cập nhật lại số dư kho
    if (updateImportDto.productId || updateImportDto.quantity !== undefined) {
      // Hoàn lại số dư cũ
      await this.productService.updateBalance(
        oldProductId,
        oldQuantity,
        'export', // Trừ đi số lượng cũ
      );

      // Cập nhật số dư mới
      const newProductId = updateImportDto.productId || oldProductId;
      const newQuantity = updateImportDto.quantity ?? oldQuantity;
      await this.productService.updateBalance(
        newProductId,
        newQuantity,
        'import', // Cộng số lượng mới
      );
    }

    // Cập nhật thông tin phiếu nhập
    Object.assign(importRecord, updateImportDto);
    return await this.importRepository.save(importRecord);
  }

  async updateExport(
    id: number,
    updateExportDto: UpdateExportDto,
  ): Promise<Export> {
    const exportRecord = await this.findOneExport(id);
    const oldQuantity = Number(exportRecord.quantity);
    const oldProductId = exportRecord.productId;

    // Nếu thay đổi sản phẩm hoặc số lượng, cần cập nhật lại số dư kho
    if (updateExportDto.productId || updateExportDto.quantity !== undefined) {
      // Hoàn lại số dư cũ
      await this.productService.updateBalance(
        oldProductId,
        oldQuantity,
        'import', // Cộng lại số lượng cũ (vì đã trừ trước đó)
      );

      // Cập nhật số dư mới
      const newProductId = updateExportDto.productId || oldProductId;
      const newQuantity = updateExportDto.quantity ?? oldQuantity;
      await this.productService.updateBalance(
        newProductId,
        newQuantity,
        'export', // Trừ số lượng mới
      );
    }

    // Cập nhật thông tin phiếu xuất
    Object.assign(exportRecord, updateExportDto);
    return await this.exportRepository.save(exportRecord);
  }

  async removeImport(id: number): Promise<void> {
    const importRecord = await this.findOneImport(id);
    const quantity = Number(importRecord.quantity);
    const productId = importRecord.productId;

    // Hoàn lại số dư kho
    await this.productService.updateBalance(productId, quantity, 'export');

    // Xóa phiếu nhập
    await this.importRepository.remove(importRecord);
  }

  async removeExport(id: number): Promise<void> {
    const exportRecord = await this.findOneExport(id);
    const quantity = Number(exportRecord.quantity);
    const productId = exportRecord.productId;

    // Hoàn lại số dư kho
    await this.productService.updateBalance(productId, quantity, 'import');

    // Xóa phiếu xuất
    await this.exportRepository.remove(exportRecord);
  }

  async getInventoryReport(productId?: number) {
    const products = productId
      ? [await this.productService.findOne(productId)]
      : await this.productService.findAll();

    const imports = await this.importRepository.find({
      where: productId ? { productId } : undefined,
      relations: ['product'],
    });

    const exports = await this.exportRepository.find({
      where: productId ? { productId } : undefined,
      relations: ['product'],
    });

    return products.map((product) => {
      const productImports = imports.filter((imp) => imp.productId === product.id);
      const productExports = exports.filter((exp) => exp.productId === product.id);

      const totalImport = productImports.reduce(
        (sum, imp) => sum + Number(imp.quantity),
        0,
      );
      const totalExport = productExports.reduce(
        (sum, exp) => sum + Number(exp.quantity),
        0,
      );

      return {
        product: {
          id: product.id,
          code: product.code,
          name: product.name,
          unit: product.unit,
        },
        openingBalance: Number(product.openingBalance),
        totalImport,
        totalExport,
        currentBalance: Number(product.currentBalance),
        endingBalance: Number(product.openingBalance) + totalImport - totalExport,
      };
    });
  }
}
