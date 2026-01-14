import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Category } from '../product/entities/category.entity';
import { Brand } from '../product/entities/brand.entity';
import { Warehouse } from '../product/entities/warehouse.entity';
import { Customer } from '../order/entities/customer.entity';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { Import } from '../inventory/entities/import.entity';
import { Export } from '../inventory/entities/export.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Import)
    private importRepository: Repository<Import>,
    @InjectRepository(Export)
    private exportRepository: Repository<Export>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async clearAllData() {
    console.log('Đang xóa tất cả dữ liệu...');
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Xóa theo thứ tự để tránh lỗi foreign key
      await queryRunner.query('DELETE FROM order_items');
      await queryRunner.query('DELETE FROM orders');
      await queryRunner.query('DELETE FROM exports');
      await queryRunner.query('DELETE FROM imports');
      await queryRunner.query('DELETE FROM products');
      await queryRunner.query('DELETE FROM customers');
      await queryRunner.query('DELETE FROM categories');
      await queryRunner.query('DELETE FROM brands');
      await queryRunner.query('DELETE FROM warehouses');
      
      await queryRunner.commitTransaction();
      console.log('Đã xóa tất cả dữ liệu!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async seedData() {
    console.log('Bắt đầu seed dữ liệu mẫu...');

    // 1. Tạo Categories
    const categories = await this.createCategories();
    console.log(`Đã tạo ${categories.length} nhóm hàng`);

    // 2. Tạo Brands
    const brands = await this.createBrands();
    console.log(`Đã tạo ${brands.length} thương hiệu`);

    // 3. Tạo Warehouses
    const warehouses = await this.createWarehouses();
    console.log(`Đã tạo ${warehouses.length} kho`);

    // 4. Tạo Products
    const products = await this.createProducts(categories, brands, warehouses);
    console.log(`Đã tạo ${products.length} sản phẩm`);

    // 5. Tạo Customers
    const customers = await this.createCustomers();
    console.log(`Đã tạo ${customers.length} khách hàng`);

    // 6. Tạo Orders (2 tháng gần đây)
    const orders = await this.createOrders(customers, products);
    console.log(`Đã tạo ${orders.length} đơn hàng`);

    // 7. Tạo Imports/Exports
    const adminUser = await this.userRepository.findOne({ where: { username: 'admin' } });
    if (adminUser) {
      await this.createImportsExports(products, adminUser);
      console.log('Đã tạo phiếu nhập/xuất kho');
    }

    console.log('Hoàn thành seed dữ liệu!');
  }

  private async createCategories(): Promise<Category[]> {
    const categoryData = [
      { name: 'CPU' },
      { name: 'VGA (Card đồ họa)' },
      { name: 'RAM' },
      { name: 'PSU (Nguồn)' },
      { name: 'Case (Vỏ máy)' },
      { name: 'Ổ cứng' },
    ];

    const categories: Category[] = [];
    for (let i = 0; i < categoryData.length; i++) {
      const category = this.categoryRepository.create({
        name: categoryData[i].name,
      });
      const saved = await this.categoryRepository.save(category);
      categories.push(saved);
    }
    return categories;
  }

  private async createBrands(): Promise<Brand[]> {
    const brandData = [
      { name: 'Intel' },
      { name: 'AMD' },
      { name: 'NVIDIA' },
      { name: 'ASUS' },
      { name: 'MSI' },
      { name: 'Gigabyte' },
      { name: 'Corsair' },
      { name: 'Kingston' },
      { name: 'Samsung' },
      { name: 'Western Digital' },
      { name: 'Seagate' },
      { name: 'Cooler Master' },
      { name: 'EVGA' },
      { name: 'NZXT' },
      { name: 'Fractal Design' },
    ];

    const brands: Brand[] = [];
    for (let i = 0; i < brandData.length; i++) {
      const brand = this.brandRepository.create({
        name: brandData[i].name,
      });
      const saved = await this.brandRepository.save(brand);
      brands.push(saved);
    }
    return brands;
  }

  private async createWarehouses(): Promise<Warehouse[]> {
    const warehouseData = [
      { name: 'Kho Hà Nội' },
      { name: 'Kho TP.HCM' },
      { name: 'Kho Đà Nẵng' },
    ];

    const warehouses: Warehouse[] = [];
    for (let i = 0; i < warehouseData.length; i++) {
      const warehouse = this.warehouseRepository.create({
        name: warehouseData[i].name,
      });
      const saved = await this.warehouseRepository.save(warehouse);
      warehouses.push(saved);
    }
    return warehouses;
  }

  private async createProducts(categories: Category[], brands: Brand[], warehouses: Warehouse[]): Promise<Product[]> {
    const productsData = [
      // CPU
      { 
        name: 'Intel Core i5-12400F', 
        category: 'CPU', 
        brand: 'Intel', 
        price: 4500000, 
        warrantyPeriod: 36, 
        openingBalance: 50, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>CPU Intel Core i5-12400F là bộ xử lý 6 nhân 12 luồng với kiến trúc Alder Lake, tốc độ cơ bản 2.5GHz và boost lên đến 4.4GHz. Sản phẩm không có GPU tích hợp, phù hợp cho các build PC gaming với card đồ họa rời. Hiệu năng mạnh mẽ, tiết kiệm điện năng, là lựa chọn lý tưởng cho gaming và công việc văn phòng.</p>'
      },
      { 
        name: 'Intel Core i7-12700K', 
        category: 'CPU', 
        brand: 'Intel', 
        price: 9500000, 
        warrantyPeriod: 36, 
        openingBalance: 30, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>CPU Intel Core i7-12700K với 8 nhân P-core và 4 nhân E-core (tổng 20 luồng), tốc độ boost lên đến 5.0GHz. Hỗ trợ ép xung, hiệu năng vượt trội cho gaming và các tác vụ đa nhiệm nặng. Tích hợp GPU Intel UHD Graphics 770, phù hợp cho các build PC cao cấp.</p>'
      },
      { 
        name: 'AMD Ryzen 5 5600X', 
        category: 'CPU', 
        brand: 'AMD', 
        price: 5200000, 
        warrantyPeriod: 36, 
        openingBalance: 45, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>CPU AMD Ryzen 5 5600X với kiến trúc Zen 3, 6 nhân 12 luồng, tốc độ boost lên đến 4.6GHz. Hiệu năng đơn nhân xuất sắc, phù hợp cho gaming và streaming. TDP 65W, đi kèm tản nhiệt Wraith Stealth, là lựa chọn hàng đầu cho build PC tầm trung.</p>'
      },
      { 
        name: 'AMD Ryzen 7 5800X', 
        category: 'CPU', 
        brand: 'AMD', 
        price: 8500000, 
        warrantyPeriod: 36, 
        openingBalance: 25, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>CPU AMD Ryzen 7 5800X với 8 nhân 16 luồng, tốc độ boost lên đến 4.7GHz. Kiến trúc Zen 3 mang lại hiệu năng vượt trội cho gaming và đa nhiệm. TDP 105W, không có GPU tích hợp, phù hợp cho các build PC gaming và workstation cao cấp.</p>'
      },
      { 
        name: 'Intel Core i9-12900K', 
        category: 'CPU', 
        brand: 'Intel', 
        price: 12500000, 
        warrantyPeriod: 36, 
        openingBalance: 15, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>CPU Intel Core i9-12900K flagship với 8 nhân P-core và 8 nhân E-core (tổng 24 luồng), tốc độ boost lên đến 5.2GHz. Hiệu năng đỉnh cao cho gaming, streaming, và các tác vụ chuyên nghiệp. Hỗ trợ ép xung, tích hợp GPU Intel UHD Graphics 770.</p>'
      },
      
      // VGA
      { 
        name: 'NVIDIA RTX 3060 12GB', 
        category: 'VGA (Card đồ họa)', 
        brand: 'NVIDIA', 
        price: 12000000, 
        warrantyPeriod: 36, 
        openingBalance: 40, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Card đồ họa NVIDIA RTX 3060 với 12GB VRAM GDDR6, kiến trúc Ampere. Hỗ trợ Ray Tracing và DLSS, mang lại trải nghiệm gaming 1080p và 1440p mượt mà. Phù hợp cho gaming, streaming và các tác vụ đồ họa cơ bản.</p>'
      },
      { 
        name: 'NVIDIA RTX 3070 8GB', 
        category: 'VGA (Card đồ họa)', 
        brand: 'NVIDIA', 
        price: 18000000, 
        warrantyPeriod: 36, 
        openingBalance: 30, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Card đồ họa NVIDIA RTX 3070 với 8GB VRAM GDDR6, hiệu năng vượt trội RTX 2080 Ti. Hỗ trợ Ray Tracing và DLSS 2.0, gaming 1440p và 4K mượt mà. Lựa chọn lý tưởng cho các game thủ yêu thích đồ họa cao.</p>'
      },
      { 
        name: 'ASUS RTX 3080 10GB', 
        category: 'VGA (Card đồ họa)', 
        brand: 'ASUS', 
        price: 25000000, 
        warrantyPeriod: 36, 
        openingBalance: 20, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Card đồ họa ASUS RTX 3080 với 10GB VRAM GDDR6X, hiệu năng gaming 4K xuất sắc. Thiết kế tản nhiệt cao cấp, hỗ trợ Ray Tracing và DLSS. Phù hợp cho gaming 4K, streaming và các tác vụ đồ họa chuyên nghiệp.</p>'
      },
      { 
        name: 'MSI RTX 4060 8GB', 
        category: 'VGA (Card đồ họa)', 
        brand: 'MSI', 
        price: 11000000, 
        warrantyPeriod: 24, 
        openingBalance: 35, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Card đồ họa MSI RTX 4060 với 8GB VRAM GDDR6, kiến trúc Ada Lovelace. Hỗ trợ DLSS 3.0 và Frame Generation, hiệu năng gaming 1080p và 1440p mạnh mẽ. Thiết kế tản nhiệt hiệu quả, phù hợp cho build PC gaming tầm trung.</p>'
      },
      { 
        name: 'Gigabyte RTX 4070 12GB', 
        category: 'VGA (Card đồ họa)', 
        brand: 'Gigabyte', 
        price: 22000000, 
        warrantyPeriod: 36, 
        openingBalance: 25, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Card đồ họa Gigabyte RTX 4070 với 12GB VRAM GDDR6X, kiến trúc Ada Lovelace. Hỗ trợ DLSS 3.0, hiệu năng gaming 1440p và 4K xuất sắc. Thiết kế Windforce 3X với tản nhiệt cao cấp, phù hợp cho gaming và content creation.</p>'
      },
      
      // RAM
      { 
        name: 'Corsair Vengeance 16GB DDR4 3200MHz', 
        category: 'RAM', 
        brand: 'Corsair', 
        price: 1800000, 
        warrantyPeriod: 36, 
        openingBalance: 100, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Bộ nhớ RAM Corsair Vengeance 16GB (2x8GB) DDR4 3200MHz, độ trễ CL16. Thiết kế heatspreader nhôm cao cấp, hỗ trợ XMP 2.0. Phù hợp cho gaming và các tác vụ đa nhiệm, tương thích với các bo mạch chủ AMD và Intel.</p>'
      },
      { 
        name: 'Corsair Vengeance 32GB DDR4 3200MHz', 
        category: 'RAM', 
        brand: 'Corsair', 
        price: 3500000, 
        warrantyPeriod: 36, 
        openingBalance: 80, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Bộ nhớ RAM Corsair Vengeance 32GB (2x16GB) DDR4 3200MHz, độ trễ CL16. Dung lượng lớn phù hợp cho gaming, streaming, và các tác vụ chuyên nghiệp. Thiết kế heatspreader nhôm, hỗ trợ XMP 2.0, bảo hành trọn đời.</p>'
      },
      { 
        name: 'Kingston Fury 16GB DDR5 5600MHz', 
        category: 'RAM', 
        brand: 'Kingston', 
        price: 3200000, 
        warrantyPeriod: 36, 
        openingBalance: 60, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Bộ nhớ RAM Kingston Fury Beast 16GB (2x8GB) DDR5 5600MHz, độ trễ CL40. Công nghệ DDR5 mới nhất, hiệu năng vượt trội so với DDR4. Thiết kế heatspreader RGB, hỗ trợ XMP 3.0, phù hợp cho build PC thế hệ mới.</p>'
      },
      { 
        name: 'Kingston Fury 32GB DDR5 5600MHz', 
        category: 'RAM', 
        brand: 'Kingston', 
        price: 6200000, 
        warrantyPeriod: 36, 
        openingBalance: 50, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Bộ nhớ RAM Kingston Fury Beast 32GB (2x16GB) DDR5 5600MHz, độ trễ CL40. Dung lượng lớn với tốc độ cao, phù hợp cho gaming, content creation và workstation. Thiết kế RGB đẹp mắt, hỗ trợ XMP 3.0.</p>'
      },
      { 
        name: 'Corsair Dominator 64GB DDR5 6000MHz', 
        category: 'RAM', 
        brand: 'Corsair', 
        price: 12000000, 
        warrantyPeriod: 36, 
        openingBalance: 20, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Bộ nhớ RAM Corsair Dominator Platinum 64GB (2x32GB) DDR5 6000MHz, độ trễ CL30. Dòng cao cấp nhất với hiệu năng đỉnh cao, phù hợp cho workstation và server. Thiết kế premium với RGB, hỗ trợ iCUE software.</p>'
      },
      
      // PSU
      { 
        name: 'Cooler Master MWE 650W 80+ Bronze', 
        category: 'PSU (Nguồn)', 
        brand: 'Cooler Master', 
        price: 1800000, 
        warrantyPeriod: 36, 
        openingBalance: 70, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Nguồn máy tính Cooler Master MWE 650W 80+ Bronze, hiệu suất 85%. Thiết kế non-modular, quạt 120mm yên tĩnh, bảo vệ đầy đủ (OVP, UVP, OCP, SCP, OPP). Phù hợp cho build PC gaming tầm trung với GPU tầm trung.</p>'
      },
      { 
        name: 'Cooler Master MWE 750W 80+ Gold', 
        category: 'PSU (Nguồn)', 
        brand: 'Cooler Master', 
        price: 2800000, 
        warrantyPeriod: 36, 
        openingBalance: 60, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Nguồn máy tính Cooler Master MWE 750W 80+ Gold, hiệu suất 90%. Thiết kế semi-modular, quạt 120mm yên tĩnh, bảo vệ đầy đủ. Phù hợp cho build PC gaming cao cấp với GPU RTX 3070/3080, hiệu năng ổn định.</p>'
      },
      { 
        name: 'EVGA 850W 80+ Gold Modular', 
        category: 'PSU (Nguồn)', 
        brand: 'EVGA', 
        price: 4500000, 
        warrantyPeriod: 60, 
        openingBalance: 40, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Nguồn máy tính EVGA 850W 80+ Gold Fully Modular, hiệu suất 90%. Thiết kế modular hoàn toàn, quạt 135mm yên tĩnh, bảo hành 10 năm. Phù hợp cho build PC cao cấp, dễ dàng quản lý dây cáp, hiệu năng ổn định.</p>'
      },
      { 
        name: 'Corsair RM850x 850W 80+ Gold', 
        category: 'PSU (Nguồn)', 
        brand: 'Corsair', 
        price: 4800000, 
        warrantyPeriod: 60, 
        openingBalance: 35, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Nguồn máy tính Corsair RM850x 850W 80+ Gold Fully Modular, hiệu suất 90%. Thiết kế modular cao cấp, quạt 135mm Zero RPM mode, bảo hành 10 năm. Phù hợp cho build PC flagship, tản nhiệt tốt, yên tĩnh.</p>'
      },
      { 
        name: 'ASUS ROG Thor 1000W 80+ Platinum', 
        category: 'PSU (Nguồn)', 
        brand: 'ASUS', 
        price: 8500000, 
        warrantyPeriod: 60, 
        openingBalance: 15, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Nguồn máy tính ASUS ROG Thor 1000W 80+ Platinum Fully Modular, hiệu suất 92%. Thiết kế premium với màn hình OLED hiển thị công suất, quạt 135mm, RGB Aura Sync. Flagship PSU cho build PC cao cấp nhất.</p>'
      },
      
      // Case
      { 
        name: 'Cooler Master MasterBox Q300L', 
        category: 'Case (Vỏ máy)', 
        brand: 'Cooler Master', 
        price: 1200000, 
        warrantyPeriod: 12, 
        openingBalance: 80, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Vỏ máy tính Cooler Master MasterBox Q300L mATX, thiết kế compact với tấm acrylic trong suốt. Hỗ trợ GPU dài 360mm, CPU cooler cao 160mm, 2 quạt 120mm. Phù hợp cho build PC nhỏ gọn, giá cả phải chăng.</p>'
      },
      { 
        name: 'Cooler Master MasterBox TD500', 
        category: 'Case (Vỏ máy)', 
        brand: 'Cooler Master', 
        price: 2500000, 
        warrantyPeriod: 12, 
        openingBalance: 50, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Vỏ máy tính Cooler Master MasterBox TD500 Mesh ATX, thiết kế mesh front panel với RGB. Hỗ trợ GPU dài 410mm, CPU cooler cao 165mm, 3 quạt 120mm ARGB. Tản nhiệt tốt, phù hợp cho build PC gaming tầm trung.</p>'
      },
      { 
        name: 'Corsair 4000D Airflow', 
        category: 'Case (Vỏ máy)', 
        brand: 'Corsair', 
        price: 3200000, 
        warrantyPeriod: 24, 
        openingBalance: 45, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Vỏ máy tính Corsair 4000D Airflow ATX, thiết kế mesh front panel tối ưu tản nhiệt. Hỗ trợ GPU dài 360mm, CPU cooler cao 170mm, 2 quạt 120mm. Thiết kế đẹp mắt, tản nhiệt xuất sắc, phù hợp cho build PC cao cấp.</p>'
      },
      { 
        name: 'NZXT H510', 
        category: 'Case (Vỏ máy)', 
        brand: 'NZXT', 
        price: 2800000, 
        warrantyPeriod: 24, 
        openingBalance: 40, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Vỏ máy tính NZXT H510 ATX, thiết kế minimalist với tấm kính cường lực. Hỗ trợ GPU dài 381mm, CPU cooler cao 165mm, 2 quạt 120mm. Thiết kế đẹp mắt, phù hợp cho build PC gaming và workstation.</p>'
      },
      { 
        name: 'Fractal Design Meshify C', 
        category: 'Case (Vỏ máy)', 
        brand: 'Fractal Design', 
        price: 3500000, 
        warrantyPeriod: 24, 
        openingBalance: 30, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Vỏ máy tính Fractal Design Meshify C ATX, thiết kế mesh front panel với tấm kính cường lực. Hỗ trợ GPU dài 315mm, CPU cooler cao 170mm, 2 quạt 120mm. Tản nhiệt tốt, thiết kế đẹp, phù hợp cho build PC cao cấp.</p>'
      },
      
      // Ổ cứng
      { 
        name: 'Samsung 980 PRO 1TB NVMe SSD', 
        category: 'Ổ cứng', 
        brand: 'Samsung', 
        price: 3500000, 
        warrantyPeriod: 60, 
        openingBalance: 90, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Ổ cứng SSD Samsung 980 PRO 1TB NVMe PCIe 4.0, tốc độ đọc 7000MB/s, ghi 5000MB/s. Công nghệ V-NAND 3-bit MLC, bộ nhớ đệm 1GB LPDDR4. Phù hợp cho boot drive và lưu trữ game, hiệu năng đỉnh cao.</p>'
      },
      { 
        name: 'Samsung 980 PRO 2TB NVMe SSD', 
        category: 'Ổ cứng', 
        brand: 'Samsung', 
        price: 6500000, 
        warrantyPeriod: 60, 
        openingBalance: 60, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Ổ cứng SSD Samsung 980 PRO 2TB NVMe PCIe 4.0, tốc độ đọc 7000MB/s, ghi 5100MB/s. Dung lượng lớn với hiệu năng cao, bộ nhớ đệm 2GB LPDDR4. Phù hợp cho workstation và content creation, lưu trữ nhiều game.</p>'
      },
      { 
        name: 'Western Digital Blue 1TB SATA SSD', 
        category: 'Ổ cứng', 
        brand: 'Western Digital', 
        price: 2200000, 
        warrantyPeriod: 36, 
        openingBalance: 100, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Ổ cứng SSD Western Digital Blue 1TB SATA III, tốc độ đọc 560MB/s, ghi 530MB/s. Công nghệ 3D NAND, độ bền cao. Phù hợp cho boot drive và lưu trữ, giá cả phải chăng, hiệu năng ổn định.</p>'
      },
      { 
        name: 'Seagate Barracuda 2TB HDD', 
        category: 'Ổ cứng', 
        brand: 'Seagate', 
        price: 1800000, 
        warrantyPeriod: 24, 
        openingBalance: 120, 
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=500&fit=crop'],
        description: '<p>Ổ cứng HDD Seagate Barracuda 2TB 7200RPM, tốc độ đọc/ghi 220MB/s. Dung lượng lớn, giá cả phải chăng, phù hợp cho lưu trữ dữ liệu, backup và media files. Độ bền cao, hoạt động ổn định.</p>'
      },
      { 
        name: 'Western Digital Black 4TB HDD', 
        category: 'Ổ cứng', 
        brand: 'Western Digital', 
        price: 4500000, 
        warrantyPeriod: 36, 
        openingBalance: 50, 
        images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop'],
        description: '<p>Ổ cứng HDD Western Digital Black 4TB 7200RPM, tốc độ đọc/ghi 210MB/s. Dòng cao cấp với hiệu năng và độ bền cao, phù hợp cho workstation và server. Bảo hành 5 năm, hoạt động ổn định 24/7.</p>'
      },
    ];

    const products: Product[] = [];
    for (let i = 0; i < productsData.length; i++) {
      const data = productsData[i];
      const category = categories.find(c => c.name === data.category);
      const brand = brands.find(b => b.name === data.brand);
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];

      const product = this.productRepository.create({
        code: `SP${String(i + 1).padStart(6, '0')}`,
        name: data.name,
        categoryId: category?.id,
        brandId: brand?.id,
        warehouseId: warehouse?.id,
        price: data.price,
        warrantyPeriod: data.warrantyPeriod,
        openingBalance: data.openingBalance,
        currentBalance: data.openingBalance,
        unit: 'cái',
        weight: Math.floor(Math.random() * 2000) + 100,
        weightUnit: 'g',
        images: data.images ? JSON.stringify(data.images) : undefined,
        description: data.description || undefined,
      });

      const saved = await this.productRepository.save(product);
      products.push(saved);
    }
    return products;
  }

  private async createCustomers(): Promise<Customer[]> {
    const customerData = [
      { name: 'Nguyễn Văn An', phone: '0912345678' },
      { name: 'Trần Thị Bình', phone: '0923456789' },
      { name: 'Lê Văn Cường', phone: '0934567890' },
      { name: 'Phạm Thị Dung', phone: '0945678901' },
      { name: 'Hoàng Văn Em', phone: '0956789012' },
      { name: 'Vũ Thị Phương', phone: '0967890123' },
      { name: 'Đặng Văn Giang', phone: '0978901234' },
      { name: 'Bùi Thị Hoa', phone: '0989012345' },
      { name: 'Đỗ Văn Hùng', phone: '0990123456' },
      { name: 'Ngô Thị Lan', phone: '0901234567' },
    ];

    const customers: Customer[] = [];
    for (let i = 0; i < customerData.length; i++) {
      const customer = this.customerRepository.create({
        code: `KH${String(i + 1).padStart(6, '0')}`,
        name: customerData[i].name,
        phone: customerData[i].phone,
      });
      const saved = await this.customerRepository.save(customer);
      customers.push(saved);
    }
    return customers;
  }

  private async createOrders(customers: Customer[], products: Product[]): Promise<Order[]> {
    const orders: Order[] = [];
    const now = new Date();
    
    // Tạo đơn hàng trong 2 tháng gần đây (60 ngày)
    for (let day = 0; day < 60; day++) {
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - day);
      
      // Mỗi ngày có 0-3 đơn hàng
      const ordersPerDay = Math.floor(Math.random() * 4);
      
      for (let o = 0; o < ordersPerDay; o++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 sản phẩm
        
        const orderItems: Partial<OrderItem>[] = [];
        let total = 0;
        const selectedProducts: Product[] = [];
        
        for (let i = 0; i < numItems; i++) {
          const product = products[Math.floor(Math.random() * products.length)];
          if (selectedProducts.includes(product)) continue;
          selectedProducts.push(product);
          
          const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 sản phẩm
          const price = Number(product.price);
          const subtotal = price * quantity;
          total += subtotal;
          
          orderItems.push({
            productId: product.id,
            quantity,
            price,
            subtotal,
          });
        }

        if (orderItems.length === 0) continue;

        // Tạo đơn hàng với trạng thái ngẫu nhiên
        const statuses = [
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.SHIPPING,
          OrderStatus.COMPLETED,
          OrderStatus.COMPLETED,
          OrderStatus.COMPLETED, // Tăng tỷ lệ completed
        ];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const order = this.orderRepository.create({
          code: `DH${String(orders.length + 1).padStart(6, '0')}`,
          customerId: customer.id,
          total,
          status,
          notes: day < 7 ? 'Đơn hàng gần đây' : undefined,
          createdAt: new Date(orderDate.getTime() + o * 3600000), // Cách nhau 1 giờ
        });

        const savedOrder = await this.orderRepository.save(order);

        // Tạo order items và cập nhật tồn kho
        for (const item of orderItems) {
          const orderItem = this.orderItemRepository.create({
            ...item,
            orderId: savedOrder.id,
          });
          await this.orderItemRepository.save(orderItem);

          // Cập nhật tồn kho nếu đơn ở trạng thái đã trừ kho
          if ([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPING, OrderStatus.COMPLETED].includes(status)) {
            const product = await this.productRepository.findOne({ where: { id: item.productId } });
            if (product) {
              product.currentBalance = Number(product.currentBalance) - (item.quantity || 0);
              await this.productRepository.save(product);
            }
          }
        }

        orders.push(savedOrder);
      }
    }

    return orders;
  }

  private async createImportsExports(products: Product[], adminUser: User) {
    const now = new Date();
    let importCounter = 1;
    let exportCounter = 1;
    
    // Tạo phiếu nhập/xuất trong 2 tháng
    for (let day = 0; day < 60; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      // Mỗi ngày có 0-2 phiếu nhập
      const importsPerDay = Math.floor(Math.random() * 3);
      for (let i = 0; i < importsPerDay; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 50) + 10;
        const unitPrice = Number(product.price) * 0.8; // Giá nhập = 80% giá bán

        const importRecord = this.importRepository.create({
          importCode: `PN${String(importCounter++).padStart(6, '0')}`,
          productId: product.id,
          quantity,
          unitPrice,
          note: `Nhập kho ngày ${date.toLocaleDateString('vi-VN')}`,
          createdById: adminUser.id,
          createdAt: new Date(date.getTime() + i * 3600000),
        });

        await this.importRepository.save(importRecord);

        // Cập nhật tồn kho
        product.currentBalance = Number(product.currentBalance) + quantity;
        await this.productRepository.save(product);
      }

      // Mỗi ngày có 0-1 phiếu xuất
      if (Math.random() > 0.5) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 20) + 5;

        if (Number(product.currentBalance) >= quantity) {
          const exportRecord = this.exportRepository.create({
            exportCode: `PX${String(exportCounter++).padStart(6, '0')}`,
            productId: product.id,
            quantity,
            note: `Xuất kho ngày ${date.toLocaleDateString('vi-VN')}`,
            createdById: adminUser.id,
            createdAt: date,
          });

          await this.exportRepository.save(exportRecord);

          // Cập nhật tồn kho
          product.currentBalance = Number(product.currentBalance) - quantity;
          await this.productRepository.save(product);
        }
      }
    }
  }
}
