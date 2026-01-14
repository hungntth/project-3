import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  Tabs,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  Empty,
  message,
  Modal,
  Popconfirm,
  Row,
  Col,
  DatePicker,
  Upload,
  Image,
} from 'antd';
import {
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  FileTextOutlined,
  InboxOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { productService, type Product, type CreateProductDto, type UpdateProductDto } from '../services/productService';
import { categoryService, type Category, type CreateCategoryDto } from '../services/categoryService';
import { brandService, type Brand, type CreateBrandDto } from '../services/brandService';
import { warehouseService, type Warehouse, type CreateWarehouseDto } from '../services/warehouseService';
// ReactQuill không tương thích với React 19, sử dụng TextArea với rich text formatting
import {
  inventoryService,
  type CreateImportDto,
  type CreateExportDto,
  type UpdateImportDto,
  type UpdateExportDto,
  type InventoryReport,
  type Import,
  type Export,
} from '../services/inventoryService';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

type TabKey = 'products' | 'import' | 'export' | 'report';

export const Inventory = () => {
  const { isAdmin, isManager } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabKey;
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabFromUrl && ['products', 'import', 'export', 'report'].includes(tabFromUrl)
      ? tabFromUrl
      : 'products'
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [imports, setImports] = useState<Import[]>([]);
  const [exports, setExports] = useState<Export[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false);
  const [newBrandModalVisible, setNewBrandModalVisible] = useState(false);
  const [newWarehouseModalVisible, setNewWarehouseModalVisible] = useState(false);
  const [newCategoryForm] = Form.useForm();
  const [newBrandForm] = Form.useForm();
  const [newWarehouseForm] = Form.useForm();
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [editProductModalVisible, setEditProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [productFilter, setProductFilter] = useState<{ categoryId?: number; brandId?: number; warehouseId?: number; search?: string }>({});
  const [productForm] = Form.useForm();
  const [importForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const [editImportForm] = Form.useForm();
  const [editExportForm] = Form.useForm();
  const [editingImport, setEditingImport] = useState<Import | null>(null);
  const [editingExport, setEditingExport] = useState<Export | null>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [addImportModalVisible, setAddImportModalVisible] = useState(false);
  const [addExportModalVisible, setAddExportModalVisible] = useState(false);
  const [importFilter, setImportFilter] = useState<{ productId?: number; dateFrom?: string; dateTo?: string }>({});
  const [exportFilter, setExportFilter] = useState<{ productId?: number; dateFrom?: string; dateTo?: string }>({});

  const canManage = isAdmin || isManager;

  useEffect(() => {
    const tab = searchParams.get('tab') as TabKey;
    if (tab && ['products', 'import', 'export', 'report'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (activeTab === 'import') {
      loadImports();
    } else if (activeTab === 'export') {
      loadExports();
    } else if (activeTab === 'report') {
      loadReports();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      let filtered = data;
      
      // Filter by category
      if (productFilter.categoryId) {
        filtered = filtered.filter((item) => item.categoryId === productFilter.categoryId);
      }
      
      // Filter by brand
      if (productFilter.brandId) {
        filtered = filtered.filter((item) => item.brandId === productFilter.brandId);
      }
      
      // Filter by warehouse
      if (productFilter.warehouseId) {
        filtered = filtered.filter((item) => item.warehouseId === productFilter.warehouseId);
      }
      
      // Filter by search (name or code)
      if (productFilter.search) {
        const searchLower = productFilter.search.toLowerCase();
        filtered = filtered.filter((item) => 
          item.name.toLowerCase().includes(searchLower) ||
          item.code?.toLowerCase().includes(searchLower)
        );
      }
      
      setProducts(filtered);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err: any) {
      // Không hiển thị lỗi nếu API chưa sẵn sàng
      if (err.response?.status !== 404) {
        console.error('Không thể tải danh sách nhóm hàng', err);
      }
    }
  };

  const loadBrands = async () => {
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Không thể tải danh sách thương hiệu', err);
      }
    }
  };

  const loadWarehouses = async () => {
    try {
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Không thể tải danh sách kho', err);
      }
    }
  };

  const loadImports = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAllImports();
      let filtered = data;
      
      // Filter by product
      if (importFilter.productId) {
        filtered = filtered.filter((item) => item.productId === importFilter.productId);
      }
      
      // Filter by date range
      if (importFilter.dateFrom) {
        const fromDate = new Date(importFilter.dateFrom);
        filtered = filtered.filter((item) => new Date(item.createdAt) >= fromDate);
      }
      if (importFilter.dateTo) {
        const toDate = new Date(importFilter.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((item) => new Date(item.createdAt) <= toDate);
      }
      
      setImports(filtered);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  const loadExports = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAllExports();
      let filtered = data;
      
      // Filter by product
      if (exportFilter.productId) {
        filtered = filtered.filter((item) => item.productId === exportFilter.productId);
      }
      
      // Filter by date range
      if (exportFilter.dateFrom) {
        const fromDate = new Date(exportFilter.dateFrom);
        filtered = filtered.filter((item) => new Date(item.createdAt) >= fromDate);
      }
      if (exportFilter.dateTo) {
        const toDate = new Date(exportFilter.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((item) => new Date(item.createdAt) <= toDate);
      }
      
      setExports(filtered);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách phiếu xuất');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventoryReport();
      setReports(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (values: CreateProductDto) => {
    try {
      setLoading(true);
      // Nếu code rỗng hoặc undefined, không gửi lên (backend sẽ tự sinh)
      if (!values.code || values.code.trim() === '') {
        delete values.code;
      }

      // Gửi URLs đã upload
      if (productImageUrls.length > 0) {
        values.images = JSON.stringify(productImageUrls);
      }

      await productService.createProduct(values);
      message.success('Tạo sản phẩm thành công!');
      productForm.resetFields();
      setProductImageUrls([]);
      setAddProductModalVisible(false);
      await loadProducts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Tạo sản phẩm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    try {
      const urls = await productService.uploadImages([file]);
      if (urls.length > 0) {
        setProductImageUrls((prev) => [...prev, urls[0]]);
        return urls[0];
      }
      throw new Error('Upload không thành công');
    } catch (err: any) {
      message.error('Upload ảnh thất bại: ' + (err.response?.data?.message || err.message));
      throw err;
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    // Parse images từ JSON string
    let images: string[] = [];
    if (product.images) {
      try {
        images = JSON.parse(product.images);
      } catch (e) {
        images = [];
      }
    }
    setProductImageUrls(images);
    
    productForm.setFieldsValue({
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      brandId: product.brandId,
      price: product.price,
      warehouseId: product.warehouseId,
      weight: product.weight,
      weightUnit: product.weightUnit,
      description: product.description,
      unit: product.unit,
      openingBalance: product.openingBalance,
      warrantyPeriod: product.warrantyPeriod,
    });
    setEditProductModalVisible(true);
  };

  const handleUpdateProduct = async (values: UpdateProductDto) => {
    if (!editingProduct) return;
    
    try {
      setLoading(true);
      
      // Gửi URLs đã có (bao gồm ảnh cũ và ảnh mới đã upload)
      if (productImageUrls.length > 0) {
        values.images = JSON.stringify(productImageUrls);
      }

      await productService.updateProduct(editingProduct.id, values);
      message.success('Cập nhật sản phẩm thành công!');
      productForm.resetFields();
      setProductImageUrls([]);
      setEditingProduct(null);
      setEditProductModalVisible(false);
      await loadProducts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật sản phẩm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      setLoading(true);
      await productService.deleteProduct(id);
      message.success('Xóa sản phẩm thành công!');
      await loadProducts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xóa sản phẩm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (values: CreateCategoryDto) => {
    try {
      setLoading(true);
      const newCategory = await categoryService.createCategory(values);
      message.success('Tạo nhóm hàng thành công!');
      newCategoryForm.resetFields();
      setNewCategoryModalVisible(false);
      await loadCategories();
      // Cập nhật select trong form sản phẩm
      productForm.setFieldsValue({ categoryId: newCategory.id });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Tạo nhóm hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async (values: CreateBrandDto) => {
    try {
      setLoading(true);
      const newBrand = await brandService.createBrand(values);
      message.success('Tạo thương hiệu thành công!');
      newBrandForm.resetFields();
      setNewBrandModalVisible(false);
      await loadBrands();
      productForm.setFieldsValue({ brandId: newBrand.id });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Tạo thương hiệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = async (values: CreateWarehouseDto) => {
    try {
      setLoading(true);
      const newWarehouse = await warehouseService.createWarehouse(values);
      message.success('Tạo kho thành công!');
      newWarehouseForm.resetFields();
      setNewWarehouseModalVisible(false);
      await loadWarehouses();
      productForm.setFieldsValue({ warehouseId: newWarehouse.id });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Tạo kho thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (values: CreateImportDto) => {
    try {
      setLoading(true);
      await inventoryService.createImport(values);
      message.success('Nhập kho thành công!');
      importForm.resetFields();
      setAddImportModalVisible(false);
      await loadProducts();
      if (activeTab === 'import') {
        await loadImports();
      }
      if (activeTab === 'report') {
        await loadReports();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Nhập kho thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (values: CreateExportDto) => {
    try {
      setLoading(true);
      await inventoryService.createExport(values);
      message.success('Xuất kho thành công!');
      exportForm.resetFields();
      setAddExportModalVisible(false);
      await loadProducts();
      if (activeTab === 'export') {
        await loadExports();
      }
      if (activeTab === 'report') {
        await loadReports();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xuất kho thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleEditImport = async (importRecord: Import) => {
    try {
      const data = await inventoryService.getImportById(importRecord.id);
      setEditingImport(data);
      editImportForm.setFieldsValue({
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        note: data.note,
      });
      setImportModalVisible(true);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải thông tin phiếu nhập');
    }
  };

  const handleUpdateImport = async (values: UpdateImportDto) => {
    if (!editingImport) return;
    try {
      setLoading(true);
      await inventoryService.updateImport(editingImport.id, values);
      message.success('Cập nhật phiếu nhập thành công!');
      setImportModalVisible(false);
      setEditingImport(null);
      editImportForm.resetFields();
      await loadProducts();
      await loadImports();
      if (activeTab === 'report') {
        await loadReports();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật phiếu nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImport = async (id: number) => {
    try {
      setLoading(true);
      await inventoryService.deleteImport(id);
      message.success('Xóa phiếu nhập thành công!');
      await loadProducts();
      await loadImports();
      if (activeTab === 'report') {
        await loadReports();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xóa phiếu nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExport = async (exportRecord: Export) => {
    try {
      const data = await inventoryService.getExportById(exportRecord.id);
      setEditingExport(data);
      editExportForm.setFieldsValue({
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        note: data.note,
      });
      setExportModalVisible(true);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải thông tin phiếu xuất');
    }
  };

  const handleUpdateExport = async (values: UpdateExportDto) => {
    if (!editingExport) return;
    try {
      setLoading(true);
      await inventoryService.updateExport(editingExport.id, values);
      message.success('Cập nhật phiếu xuất thành công!');
      setExportModalVisible(false);
      setEditingExport(null);
      editExportForm.resetFields();
      await loadProducts();
      await loadExports();
      if (activeTab === 'report') {
        await loadReports();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật phiếu xuất thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExport = async (id: number) => {
    try {
      setLoading(true);
      await inventoryService.deleteExport(id);
      message.success('Xóa phiếu xuất thành công!');
      await loadProducts();
      await loadExports();
      if (activeTab === 'report') {
        await loadReports();
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xóa phiếu xuất thất bại');
    } finally {
      setLoading(false);
    }
  };

  const productColumns: ColumnsType<Product> = [
    {
      title: 'Mã SP',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ảnh',
      key: 'images',
      width: 120,
      render: (_: any, record: Product) => {
        let images: string[] = [];
        if (record.images) {
          try {
            images = JSON.parse(record.images);
          } catch (e) {
            images = [];
          }
        }
        if (images.length === 0) return '-';
        const firstImage = images[0];
        // Kiểm tra nếu là URL công khai (bắt đầu với http/https) thì dùng trực tiếp
        const imageSrc = firstImage.startsWith('http://') || firstImage.startsWith('https://')
          ? firstImage
          : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${firstImage}`;
        return (
            <Image
              src={imageSrc}
              alt={record.name}
              width={50}
              height={50}
              style={{ objectFit: 'cover' }}
              preview={{
                src: imageSrc,
              }}
            />
        );
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: 'Đầu kỳ',
      dataIndex: 'openingBalance',
      key: 'openingBalance',
      width: 120,
      align: 'right',
      render: (value) => Number(value).toLocaleString(),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      width: 120,
      align: 'right',
      render: (value) => (
        <Text strong style={{ color: '#1890ff' }}>
          {Number(value).toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Thời gian bảo hành',
      dataIndex: 'warrantyPeriod',
      key: 'warrantyPeriod',
      width: 150,
      render: (value) => {
        if (!value) return '-';
        if (value < 12) {
          return `${value} tháng`;
        }
        const years = Math.floor(value / 12);
        const months = value % 12;
        if (months === 0) {
          return `${years} năm`;
        }
        return `${years} năm ${months} tháng`;
      },
    },
    ...(canManage
      ? [
          {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right' as const,
            render: (_: any, record: Product) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEditProduct(record)}
                  size="small"
                >
                  Sửa
                </Button>
                <Popconfirm
                  title="Xóa sản phẩm"
                  description="Bạn có chắc chắn muốn xóa sản phẩm này?"
                  onConfirm={() => handleDeleteProduct(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const importColumns: ColumnsType<Import> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'importCode',
      key: 'importCode',
      width: 120,
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: any, record: Import) => (
        <div>
          <div className="font-medium">
            {record.product?.code} - {record.product?.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right',
      render: (value) => <Text style={{ color: '#52c41a' }}>+{Number(value).toLocaleString()}</Text>,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (value) => (value ? Number(value).toLocaleString() : '-'),
    },
    {
      title: 'Người tạo',
      key: 'createdBy',
      width: 150,
      render: (_: any, record: Import) => record.createdBy?.fullName || record.createdBy?.username || '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    ...(canManage
      ? [
          {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right' as const,
            render: (_: any, record: Import) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEditImport(record)}
                  size="small"
                >
                  Sửa
                </Button>
                <Popconfirm
                  title="Xóa phiếu nhập"
                  description="Bạn có chắc chắn muốn xóa phiếu nhập này?"
                  onConfirm={() => handleDeleteImport(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const exportColumns: ColumnsType<Export> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'exportCode',
      key: 'exportCode',
      width: 120,
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: any, record: Export) => (
        <div>
          <div className="font-medium">
            {record.product?.code} - {record.product?.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right',
      render: (value) => <Text style={{ color: '#ff4d4f' }}>-{Number(value).toLocaleString()}</Text>,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (value) => (value ? Number(value).toLocaleString() : '-'),
    },
    {
      title: 'Người tạo',
      key: 'createdBy',
      width: 150,
      render: (_: any, record: Export) => record.createdBy?.fullName || record.createdBy?.username || '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    ...(canManage
      ? [
          {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right' as const,
            render: (_: any, record: Export) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEditExport(record)}
                  size="small"
                >
                  Sửa
                </Button>
                <Popconfirm
                  title="Xóa phiếu xuất"
                  description="Bạn có chắc chắn muốn xóa phiếu xuất này?"
                  onConfirm={() => handleDeleteExport(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const reportColumns: ColumnsType<InventoryReport> = [
    {
      title: 'Mã SP',
      dataIndex: ['product', 'code'],
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'name',
    },
    {
      title: 'Đầu kỳ',
      dataIndex: 'openingBalance',
      key: 'openingBalance',
      width: 120,
      align: 'right',
      render: (value) => Number(value).toLocaleString(),
    },
    {
      title: 'Nhập',
      dataIndex: 'totalImport',
      key: 'totalImport',
      width: 120,
      align: 'right',
      render: (value) => (
        <Text style={{ color: '#52c41a' }}>+{Number(value).toLocaleString()}</Text>
      ),
    },
    {
      title: 'Xuất',
      dataIndex: 'totalExport',
      key: 'totalExport',
      width: 120,
      align: 'right',
      render: (value) => (
        <Text style={{ color: '#ff4d4f' }}>-{Number(value).toLocaleString()}</Text>
      ),
    },
    {
      title: 'Cuối kỳ',
      dataIndex: 'endingBalance',
      key: 'endingBalance',
      width: 120,
      align: 'right',
      render: (value) => (
        <Text strong style={{ color: '#722ed1' }}>
          {Number(value).toLocaleString()}
        </Text>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'products',
      label: (
        <Space>
          <InboxOutlined />
          <span>Sản phẩm</span>
        </Space>
      ),
      children: (
        <div className="space-y-6">
          <Card
            title="Danh sách sản phẩm"
            variant="outlined"
            className="shadow-sm"
            extra={
              canManage && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddProductModalVisible(true)}
                >
                  Thêm mới
                </Button>
              )
            }
          >
            {/* Filter */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Input
                    placeholder="Tìm kiếm (tên, mã)"
                    allowClear
                    value={productFilter.search}
                    onChange={(e) => {
                      setProductFilter({ ...productFilter, search: e.target.value });
                    }}
                    onPressEnter={loadProducts}
                    prefix={<SearchOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    placeholder="Lọc theo nhóm hàng"
                    allowClear
                    style={{ width: '100%' }}
                    value={productFilter.categoryId}
                    onChange={(value) => {
                      setProductFilter({ ...productFilter, categoryId: value });
                    }}
                  >
                    {categories.map((category) => (
                      <Select.Option key={category.id} value={category.id}>
                        {category.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    placeholder="Lọc theo thương hiệu"
                    allowClear
                    style={{ width: '100%' }}
                    value={productFilter.brandId}
                    onChange={(value) => {
                      setProductFilter({ ...productFilter, brandId: value });
                    }}
                  >
                    {brands.map((brand) => (
                      <Select.Option key={brand.id} value={brand.id}>
                        {brand.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    placeholder="Lọc theo kho"
                    allowClear
                    style={{ width: '100%' }}
                    value={productFilter.warehouseId}
                    onChange={(value) => {
                      setProductFilter({ ...productFilter, warehouseId: value });
                    }}
                  >
                    {warehouses.map((warehouse) => (
                      <Select.Option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={loadProducts}
                    >
                      Tìm kiếm
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setProductFilter({});
                        loadProducts();
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
            <Table
              columns={productColumns}
              dataSource={products}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} sản phẩm`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      <span>
                        <Text type="secondary">Chưa có sản phẩm nào</Text>
                        <br />
                        <Text type="secondary" className="text-sm">
                          {canManage ? 'Thêm sản phẩm để bắt đầu quản lý kho' : 'Chưa có sản phẩm trong hệ thống'}
                        </Text>
                      </span>
                    }
                  />
                ),
              }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'import',
      label: (
        <Space>
          <ImportOutlined />
          <span>Nhập kho</span>
        </Space>
      ),
      children: (
        <div className="space-y-6">
          <Card
            title="Danh sách phiếu nhập"
            variant="outlined"
            className="shadow-sm"
            extra={
              canManage && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddImportModalVisible(true)}
                >
                  Thêm mới
                </Button>
              )
            }
          >
            {/* Filter */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Select
                    placeholder="Lọc theo sản phẩm"
                    allowClear
                    style={{ width: '100%' }}
                    value={importFilter.productId}
                    onChange={(value) => {
                      setImportFilter({ ...importFilter, productId: value });
                    }}
                  >
                    {products.map((product) => (
                      <Select.Option key={product.id} value={product.id}>
                        {product.code} - {product.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <DatePicker
                    placeholder="Từ ngày"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    onChange={(date) => {
                      setImportFilter({
                        ...importFilter,
                        dateFrom: date ? date.format('YYYY-MM-DD') : undefined,
                      });
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Space>
                    <DatePicker
                      placeholder="Đến ngày"
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      onChange={(date) => {
                        setImportFilter({
                          ...importFilter,
                          dateTo: date ? date.format('YYYY-MM-DD') : undefined,
                        });
                      }}
                    />
                    <Button
                      icon={<SearchOutlined />}
                      onClick={loadImports}
                    >
                      Tìm
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setImportFilter({});
                        loadImports();
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
            <Table
              columns={importColumns}
              dataSource={imports}
              loading={loading}
              rowKey="id"
              scroll={{ x: 1000 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} phiếu nhập`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      <span>
                        <Text type="secondary">Chưa có phiếu nhập nào</Text>
                      </span>
                    }
                  />
                ),
              }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'export',
      label: (
        <Space>
          <ExportOutlined />
          <span>Xuất kho</span>
        </Space>
      ),
      children: (
        <div className="space-y-6">
          <Card
            title="Danh sách phiếu xuất"
            variant="outlined"
            className="shadow-sm"
            extra={
              canManage && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddExportModalVisible(true)}
                >
                  Thêm mới
                </Button>
              )
            }
          >
            {/* Filter */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Select
                    placeholder="Lọc theo sản phẩm"
                    allowClear
                    style={{ width: '100%' }}
                    value={exportFilter.productId}
                    onChange={(value) => {
                      setExportFilter({ ...exportFilter, productId: value });
                    }}
                  >
                    {products.map((product) => (
                      <Select.Option key={product.id} value={product.id}>
                        {product.code} - {product.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <DatePicker
                    placeholder="Từ ngày"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    onChange={(date) => {
                      setExportFilter({
                        ...exportFilter,
                        dateFrom: date ? date.format('YYYY-MM-DD') : undefined,
                      });
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Space>
                    <DatePicker
                      placeholder="Đến ngày"
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      onChange={(date) => {
                        setExportFilter({
                          ...exportFilter,
                          dateTo: date ? date.format('YYYY-MM-DD') : undefined,
                        });
                      }}
                    />
                    <Button
                      icon={<SearchOutlined />}
                      onClick={loadExports}
                    >
                      Tìm
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setExportFilter({});
                        loadExports();
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
            <Table
              columns={exportColumns}
              dataSource={exports}
              loading={loading}
              rowKey="id"
              scroll={{ x: 1000 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} phiếu xuất`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      <span>
                        <Text type="secondary">Chưa có phiếu xuất nào</Text>
                      </span>
                    }
                  />
                ),
              }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'report',
      label: (
        <Space>
          <FileTextOutlined />
          <span>Báo cáo</span>
        </Space>
      ),
      children: (
        <Card title="Báo cáo tồn kho" variant="outlined" className="shadow-sm">
          <Table
            columns={reportColumns}
            dataSource={reports}
            loading={loading}
            rowKey={(record) => record.product.id}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} sản phẩm`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description={
                    <span>
                      <Text type="secondary">Chưa có dữ liệu</Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        Thêm sản phẩm và thực hiện nhập xuất để xem báo cáo
                      </Text>
                    </span>
                  }
                />
              ),
            }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Title level={2} className="!mb-2">
          Quản lý Kho
        </Title>
        <Text type="secondary">
          Quản lý sản phẩm, nhập xuất kho và báo cáo tồn kho
        </Text>
      </div>

      <Card variant="outlined" className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            const tabKey = key as TabKey;
            setActiveTab(tabKey);
            setSearchParams({ tab: key }, { replace: true });
          }}
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Modal thêm phiếu nhập */}
      <Modal
        title="Thêm phiếu nhập"
        open={addImportModalVisible}
        onCancel={() => {
          setAddImportModalVisible(false);
          importForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={importForm}
          layout="vertical"
          onFinish={handleImport}
          autoComplete="off"
        >
          <Form.Item
            name="productId"
            label="Sản phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              showSearch
              optionFilterProp="children"
              disabled={products.length === 0}
            >
              {products.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                { type: 'number', min: 0.01, message: 'Số lượng phải lớn hơn 0!' },
              ]}
            >
              <InputNumber
                min={0.01}
                step={0.01}
                className="w-full"
                placeholder="Nhập số lượng"
              />
            </Form.Item>
            <Form.Item name="unitPrice" label="Đơn giá">
              <InputNumber
                min={0}
                step={0.01}
                className="w-full"
                placeholder="Nhập đơn giá"
              />
            </Form.Item>
          </div>
          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={products.length === 0}
              >
                Thêm mới
              </Button>
              <Button
                onClick={() => {
                  setAddImportModalVisible(false);
                  importForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm phiếu xuất */}
      <Modal
        title="Thêm phiếu xuất"
        open={addExportModalVisible}
        onCancel={() => {
          setAddExportModalVisible(false);
          exportForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={exportForm}
          layout="vertical"
          onFinish={handleExport}
          autoComplete="off"
        >
          <Form.Item
            name="productId"
            label="Sản phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              showSearch
              optionFilterProp="children"
              disabled={products.length === 0}
            >
              {products.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.code} - {product.name} (Tồn: {Number(product.currentBalance).toLocaleString()})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                { type: 'number', min: 0.01, message: 'Số lượng phải lớn hơn 0!' },
              ]}
            >
              <InputNumber
                min={0.01}
                step={0.01}
                className="w-full"
                placeholder="Nhập số lượng"
              />
            </Form.Item>
            <Form.Item name="unitPrice" label="Đơn giá">
              <InputNumber
                min={0}
                step={0.01}
                className="w-full"
                placeholder="Nhập đơn giá"
              />
            </Form.Item>
          </div>
          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={products.length === 0}
              >
                Thêm mới
              </Button>
              <Button
                onClick={() => {
                  setAddExportModalVisible(false);
                  exportForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm sản phẩm */}
      <Modal
        title="Thêm sản phẩm mới"
        open={addProductModalVisible}
        onCancel={() => {
          setAddProductModalVisible(false);
          productForm.resetFields();
          setProductImageUrls([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={productForm}
          layout="vertical"
          onFinish={handleCreateProduct}
          autoComplete="off"
          initialValues={{
            weightUnit: 'g',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã hàng"
              tooltip="Để trống sẽ tự động sinh mã"
            >
              <Input placeholder="Nhập mã hàng (để trống sẽ tự động sinh)" />
            </Form.Item>
            <Form.Item
              name="name"
              label="Tên hàng"
              rules={[{ required: true, message: 'Vui lòng nhập tên hàng!' }]}
            >
              <Input placeholder="Nhập tên hàng" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="categoryId"
              label="Nhóm hàng"
            >
              <Select
                placeholder="Chọn nhóm hàng"
                showSearch
                optionFilterProp="children"
                allowClear
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewCategoryModalVisible(true);
                        }}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        Thêm nhóm hàng mới
                      </Button>
                    </div>
                  </>
                )}
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="brandId"
              label="Thương hiệu"
            >
              <Select
                placeholder="Chọn thương hiệu"
                showSearch
                optionFilterProp="children"
                allowClear
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewBrandModalVisible(true);
                        }}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        Thêm thương hiệu mới
                      </Button>
                    </div>
                  </>
                )}
              >
                {brands.map((brand) => (
                  <Select.Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="price"
              label="Giá bán"
              rules={[
                { required: true, message: 'Vui lòng nhập giá bán!' },
                { type: 'number', min: 0, message: 'Giá bán phải lớn hơn hoặc bằng 0!' },
              ]}
            >
              <InputNumber
                min={0}
                step={1000}
                className="w-full"
                placeholder="Nhập giá bán"
              />
            </Form.Item>
            <Form.Item
              name="warehouseId"
              label="Tên kho"
            >
              <Select
                placeholder="Chọn kho"
                showSearch
                optionFilterProp="children"
                allowClear
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewWarehouseModalVisible(true);
                        }}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        Thêm kho mới
                      </Button>
                    </div>
                  </>
                )}
              >
                {warehouses.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Trọng lượng">
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="weight" noStyle>
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '70%' }}
                    placeholder="Nhập trọng lượng"
                  />
                </Form.Item>
                <Form.Item name="weightUnit" noStyle>
                  <Select
                    style={{ width: '30%' }}
                    placeholder="Đơn vị"
                  >
                    <Select.Option value="g">g</Select.Option>
                    <Select.Option value="kg">kg</Select.Option>
                  </Select>
                </Form.Item>
              </Space.Compact>
            </Form.Item>
            <Form.Item
              name="unit"
              label="Đơn vị tính"
            >
              <Select
                placeholder="Chọn đơn vị tính"
                allowClear
              >
                <Select.Option value="cái">cái</Select.Option>
                <Select.Option value="chiếc">chiếc</Select.Option>
                <Select.Option value="bộ">bộ</Select.Option>
                <Select.Option value="thùng">thùng</Select.Option>
                <Select.Option value="hộp">hộp</Select.Option>
                <Select.Option value="kg">kg</Select.Option>
                <Select.Option value="g">g</Select.Option>
                <Select.Option value="lít">lít</Select.Option>
                <Select.Option value="ml">ml</Select.Option>
                <Select.Option value="m">m</Select.Option>
                <Select.Option value="cm">cm</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="openingBalance"
              label="Số dư đầu kỳ"
              rules={[
                { required: true, message: 'Vui lòng nhập số dư đầu kỳ!' },
                { type: 'number', min: 1, message: 'Số dư đầu kỳ phải là số nguyên dương!' },
              ]}
            >
              <InputNumber
                min={1}
                step={1}
                precision={0}
                className="w-full"
                placeholder="Nhập số dư đầu kỳ"
              />
            </Form.Item>
            <Form.Item
              name="warrantyPeriod"
              label="Thời gian bảo hành"
            >
              <Select
                placeholder="Chọn thời gian bảo hành"
                className="w-full"
                allowClear
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map((month) => (
                  <Select.Option key={month} value={month}>
                    {month < 12
                      ? `${month} tháng`
                      : month === 12
                      ? '1 năm'
                      : `${Math.floor(month / 12)} năm ${month % 12 === 0 ? '' : `${month % 12} tháng`}`.trim()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            label="Ảnh sản phẩm"
            tooltip="Tối đa 5 ảnh, mỗi ảnh tối đa 2MB"
          >
            <Upload
              listType="picture-card"
              maxCount={5}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const url = await handleUploadImage(file as File);
                  onSuccess?.(url);
                } catch (err) {
                  onError?.(err as Error);
                }
              }}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('Chỉ chấp nhận file ảnh!');
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('Ảnh phải nhỏ hơn 2MB!');
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
              onRemove={(file) => {
                const fullUrl = file.url || '';
                // Kiểm tra nếu là URL công khai thì dùng trực tiếp, nếu không thì extract path
                if (fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) {
                  // Tìm URL trong productImageUrls để xóa
                  setProductImageUrls((prev) => prev.filter((url) => {
                    const imageUrl = url.startsWith('http://') || url.startsWith('https://')
                      ? url
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`;
                    return imageUrl !== fullUrl;
                  }));
                } else {
                  const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}`;
                  const urlPath = fullUrl.replace(baseUrl, '');
                  setProductImageUrls((prev) => prev.filter((url) => url !== urlPath));
                }
              }}
              fileList={productImageUrls.map((url, index) => {
                // Kiểm tra nếu là URL công khai (bắt đầu với http/https) thì dùng trực tiếp
                const imageUrl = url.startsWith('http://') || url.startsWith('https://')
                  ? url
                  : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`;
                return {
                  uid: `image-${index}`,
                  name: `image-${index}.jpg`,
                  status: 'done' as const,
                  url: imageUrl,
                };
              })}
            >
              {productImageUrls.length < 5 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={6}
              placeholder="Nhập mô tả sản phẩm..."
              showCount
              maxLength={2000}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo sản phẩm
              </Button>
              <Button
                onClick={() => {
                  setAddProductModalVisible(false);
                  productForm.resetFields();
                  setProductImageUrls([]);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa sản phẩm */}
      <Modal
        title="Sửa sản phẩm"
        open={editProductModalVisible}
        onCancel={() => {
          setEditProductModalVisible(false);
          productForm.resetFields();
          setProductImageUrls([]);
          setEditingProduct(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={productForm}
          layout="vertical"
          onFinish={handleUpdateProduct}
          autoComplete="off"
          initialValues={{
            weightUnit: 'g',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã hàng"
            >
              <Input placeholder="Nhập mã hàng" />
            </Form.Item>
            <Form.Item
              name="name"
              label="Tên hàng"
              rules={[{ required: true, message: 'Vui lòng nhập tên hàng!' }]}
            >
              <Input placeholder="Nhập tên hàng" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="categoryId"
              label="Nhóm hàng"
            >
              <Select
                placeholder="Chọn nhóm hàng"
                showSearch
                optionFilterProp="children"
                allowClear
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewCategoryModalVisible(true);
                        }}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        Thêm nhóm hàng mới
                      </Button>
                    </div>
                  </>
                )}
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="brandId"
              label="Thương hiệu"
            >
              <Select
                placeholder="Chọn thương hiệu"
                showSearch
                optionFilterProp="children"
                allowClear
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewBrandModalVisible(true);
                        }}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        Thêm thương hiệu mới
                      </Button>
                    </div>
                  </>
                )}
              >
                {brands.map((brand) => (
                  <Select.Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="price"
              label="Giá bán"
              rules={[
                { required: true, message: 'Vui lòng nhập giá bán!' },
                { type: 'number', min: 0, message: 'Giá bán phải lớn hơn hoặc bằng 0!' },
              ]}
            >
              <InputNumber
                min={0}
                step={1000}
                className="w-full"
                placeholder="Nhập giá bán"
              />
            </Form.Item>
            <Form.Item
              name="warehouseId"
              label="Tên kho"
            >
              <Select
                placeholder="Chọn kho"
                showSearch
                optionFilterProp="children"
                allowClear
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewWarehouseModalVisible(true);
                        }}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        Thêm kho mới
                      </Button>
                    </div>
                  </>
                )}
              >
                {warehouses.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Trọng lượng">
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="weight" noStyle>
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '70%' }}
                    placeholder="Nhập trọng lượng"
                  />
                </Form.Item>
                <Form.Item name="weightUnit" noStyle>
                  <Select
                    style={{ width: '30%' }}
                    placeholder="Đơn vị"
                  >
                    <Select.Option value="g">g</Select.Option>
                    <Select.Option value="kg">kg</Select.Option>
                  </Select>
                </Form.Item>
              </Space.Compact>
            </Form.Item>
            <Form.Item
              name="unit"
              label="Đơn vị tính"
            >
              <Select
                placeholder="Chọn đơn vị tính"
                allowClear
              >
                <Select.Option value="cái">cái</Select.Option>
                <Select.Option value="chiếc">chiếc</Select.Option>
                <Select.Option value="bộ">bộ</Select.Option>
                <Select.Option value="thùng">thùng</Select.Option>
                <Select.Option value="hộp">hộp</Select.Option>
                <Select.Option value="kg">kg</Select.Option>
                <Select.Option value="g">g</Select.Option>
                <Select.Option value="lít">lít</Select.Option>
                <Select.Option value="ml">ml</Select.Option>
                <Select.Option value="m">m</Select.Option>
                <Select.Option value="cm">cm</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="openingBalance"
              label="Số dư đầu kỳ"
              rules={[
                { required: true, message: 'Vui lòng nhập số dư đầu kỳ!' },
                { type: 'number', min: 1, message: 'Số dư đầu kỳ phải là số nguyên dương!' },
              ]}
            >
              <InputNumber
                min={1}
                step={1}
                precision={0}
                className="w-full"
                placeholder="Nhập số dư đầu kỳ"
              />
            </Form.Item>
            <Form.Item
              name="warrantyPeriod"
              label="Thời gian bảo hành"
            >
              <Select
                placeholder="Chọn thời gian bảo hành"
                className="w-full"
                allowClear
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map((month) => (
                  <Select.Option key={month} value={month}>
                    {month < 12
                      ? `${month} tháng`
                      : month === 12
                      ? '1 năm'
                      : `${Math.floor(month / 12)} năm ${month % 12 === 0 ? '' : `${month % 12} tháng`}`.trim()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            label="Ảnh sản phẩm"
            tooltip="Tối đa 5 ảnh, mỗi ảnh tối đa 2MB"
          >
            <Upload
              listType="picture-card"
              maxCount={5}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const url = await handleUploadImage(file as File);
                  onSuccess?.(url);
                } catch (err) {
                  onError?.(err as Error);
                }
              }}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('Chỉ chấp nhận file ảnh!');
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('Ảnh phải nhỏ hơn 2MB!');
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
              onRemove={(file) => {
                const fullUrl = file.url || '';
                // Kiểm tra nếu là URL công khai thì dùng trực tiếp, nếu không thì extract path
                if (fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) {
                  // Tìm URL trong productImageUrls để xóa
                  setProductImageUrls((prev) => prev.filter((url) => {
                    const imageUrl = url.startsWith('http://') || url.startsWith('https://')
                      ? url
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`;
                    return imageUrl !== fullUrl;
                  }));
                } else {
                  const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}`;
                  const urlPath = fullUrl.replace(baseUrl, '');
                  setProductImageUrls((prev) => prev.filter((url) => url !== urlPath));
                }
              }}
              fileList={productImageUrls.map((url, index) => {
                // Kiểm tra nếu là URL công khai (bắt đầu với http/https) thì dùng trực tiếp
                const imageUrl = url.startsWith('http://') || url.startsWith('https://')
                  ? url
                  : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`;
                return {
                  uid: `image-${index}`,
                  name: `image-${index}.jpg`,
                  status: 'done' as const,
                  url: imageUrl,
                };
              })}
            >
              {productImageUrls.length < 5 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={6}
              placeholder="Nhập mô tả sản phẩm..."
              showCount
              maxLength={2000}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
              <Button
                onClick={() => {
                  setEditProductModalVisible(false);
                  productForm.resetFields();
                  setProductImageUrls([]);
                  setEditingProduct(null);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm nhóm hàng */}
      <Modal
        title="Thêm nhóm hàng mới"
        open={newCategoryModalVisible}
        onCancel={() => {
          setNewCategoryModalVisible(false);
          newCategoryForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={newCategoryForm}
          layout="vertical"
          onFinish={handleCreateCategory}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Tên nhóm hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm hàng!' }]}
          >
            <Input placeholder="Nhập tên nhóm hàng" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo mới
              </Button>
              <Button
                onClick={() => {
                  setNewCategoryModalVisible(false);
                  newCategoryForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm thương hiệu */}
      <Modal
        title="Thêm thương hiệu mới"
        open={newBrandModalVisible}
        onCancel={() => {
          setNewBrandModalVisible(false);
          newBrandForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={newBrandForm}
          layout="vertical"
          onFinish={handleCreateBrand}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Tên thương hiệu"
            rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
          >
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo mới
              </Button>
              <Button
                onClick={() => {
                  setNewBrandModalVisible(false);
                  newBrandForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm kho */}
      <Modal
        title="Thêm kho mới"
        open={newWarehouseModalVisible}
        onCancel={() => {
          setNewWarehouseModalVisible(false);
          newWarehouseForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={newWarehouseForm}
          layout="vertical"
          onFinish={handleCreateWarehouse}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Tên kho"
            rules={[{ required: true, message: 'Vui lòng nhập tên kho!' }]}
          >
            <Input placeholder="Nhập tên kho" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo mới
              </Button>
              <Button
                onClick={() => {
                  setNewWarehouseModalVisible(false);
                  newWarehouseForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa phiếu nhập */}
      <Modal
        title="Sửa phiếu nhập"
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          setEditingImport(null);
          editImportForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editImportForm}
          layout="vertical"
          onFinish={handleUpdateImport}
          autoComplete="off"
        >
          <Form.Item
            name="productId"
            label="Sản phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              showSearch
              optionFilterProp="children"
              disabled={products.length === 0}
            >
              {products.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                { type: 'number', min: 0.01, message: 'Số lượng phải lớn hơn 0!' },
              ]}
            >
              <InputNumber
                min={0.01}
                step={0.01}
                className="w-full"
                placeholder="Nhập số lượng"
              />
            </Form.Item>
            <Form.Item name="unitPrice" label="Đơn giá">
              <InputNumber
                min={0}
                step={0.01}
                className="w-full"
                placeholder="Nhập đơn giá"
              />
            </Form.Item>
          </div>
          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Cập nhật
              </Button>
              <Button
                onClick={() => {
                  setImportModalVisible(false);
                  setEditingImport(null);
                  editImportForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa phiếu xuất */}
      <Modal
        title="Sửa phiếu xuất"
        open={exportModalVisible}
        onCancel={() => {
          setExportModalVisible(false);
          setEditingExport(null);
          editExportForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editExportForm}
          layout="vertical"
          onFinish={handleUpdateExport}
          autoComplete="off"
        >
          <Form.Item
            name="productId"
            label="Sản phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              showSearch
              optionFilterProp="children"
              disabled={products.length === 0}
            >
              {products.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                { type: 'number', min: 0.01, message: 'Số lượng phải lớn hơn 0!' },
              ]}
            >
              <InputNumber
                min={0.01}
                step={0.01}
                className="w-full"
                placeholder="Nhập số lượng"
              />
            </Form.Item>
            <Form.Item name="unitPrice" label="Đơn giá">
              <InputNumber
                min={0}
                step={0.01}
                className="w-full"
                placeholder="Nhập đơn giá"
              />
            </Form.Item>
          </div>
          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Cập nhật
              </Button>
              <Button
                onClick={() => {
                  setExportModalVisible(false);
                  setEditingExport(null);
                  editExportForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
