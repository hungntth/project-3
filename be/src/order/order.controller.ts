import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  createByAdmin(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Get(':id/invoice')
  async getInvoice(@Param('id') id: string, @Res() res: Response) {
    const order = await this.orderService.findOne(+id);
    const html = this.generateInvoiceHTML(order);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }

  private generateInvoiceHTML(order: any): string {
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    };

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa đơn ${order.code}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      padding: 20px;
      background: white;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border: 1px solid #ddd;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 10px;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .info-section {
      flex: 1;
    }
    .info-section h3 {
      font-size: 16px;
      color: #333;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .info-section p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    table th,
    table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    table th {
      background-color: #f5f5f5;
      font-weight: bold;
      color: #333;
    }
    table td {
      color: #666;
    }
    .text-right {
      text-align: right;
    }
    .total {
      margin-top: 20px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin: 5px 0;
    }
    .total-label {
      width: 150px;
      font-weight: bold;
      text-align: right;
      padding-right: 20px;
    }
    .total-value {
      width: 150px;
      text-align: right;
      font-size: 18px;
      color: #333;
    }
    .grand-total {
      font-size: 24px;
      font-weight: bold;
      color: #d32f2f;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>HÓA ĐƠN BÁN HÀNG</h1>
      <p>Mã đơn hàng: ${order.code}</p>
    </div>
    
    <div class="info">
      <div class="info-section">
        <h3>Thông tin khách hàng</h3>
        <p><strong>Mã KH:</strong> ${order.customer.code}</p>
        <p><strong>Tên:</strong> ${order.customer.name}</p>
        ${order.customer.phone ? `<p><strong>Điện thoại:</strong> ${order.customer.phone}</p>` : ''}
      </div>
      <div class="info-section">
        <h3>Thông tin đơn hàng</h3>
        <p><strong>Ngày tạo:</strong> ${formatDate(order.createdAt)}</p>
        <p><strong>Trạng thái:</strong> ${order.status === 'pending' ? 'Chờ xử lý' : order.status === 'confirmed' ? 'Đã xác nhận' : order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}</p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên sản phẩm</th>
          <th class="text-right">Số lượng</th>
          <th class="text-right">Đơn giá</th>
          <th class="text-right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((item: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.product.name}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${formatCurrency(item.price)}</td>
            <td class="text-right">${formatCurrency(item.subtotal)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="total">
      <div class="total-row">
        <div class="total-label">Tổng cộng:</div>
        <div class="total-value grand-total">${formatCurrency(order.total)}</div>
      </div>
    </div>
    
    ${order.notes ? `
    <div style="margin-top: 20px;">
      <strong>Ghi chú:</strong> ${order.notes}
    </div>
    ` : ''}
    
    <div class="footer">
      <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
