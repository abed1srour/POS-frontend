import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Comprehensive translation function
const translations = {
  en: {
    // Common
    'common.dashboard': 'Dashboard',
    'common.products': 'Products',
    'common.categories': 'Categories',
    'common.suppliers': 'Suppliers',
    'common.customers': 'Customers',
    'common.orders': 'Orders',
    'common.payments': 'Payments',
    'common.company_payments': 'Company Payments',
    'common.purchase_orders': 'Purchase Orders',
    'common.inventory': 'Inventory',
    'common.employees': 'Employees',
    'common.invoices': 'Invoices',
    'common.warranties': 'Warranties',
    'common.settings': 'Settings',
    'common.logout': 'Logout',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.no_data': 'No data found',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.home': 'Home',
    'common.people': 'People',
    'common.other': 'Other',
    'common.reports': 'Reports',
    'common.sign_out': 'Sign out',
    'common.switch_language': 'Switch Language',
    'common.switch_to_light_mode': 'Switch to light mode',
    'common.switch_to_dark_mode': 'Switch to dark mode',
    
    // Dashboard
    'dashboard.total_sales': 'Total Sales',
    'dashboard.total_orders': 'Total Orders',
    'dashboard.total_customers': 'Total Customers',
    'dashboard.total_products': 'Total Products',
    'dashboard.average_order_value': 'Average Order Value',
    'dashboard.conversion_rate': 'Conversion Rate',
    'dashboard.inventory_value': 'Inventory Value',
    'dashboard.low_stock_items': 'Low Stock Items',
    'dashboard.vs_previous_period': 'vs previous period',
    'dashboard.orders_processed': 'orders processed',
    'dashboard.unique_customers': 'unique customers',
    'dashboard.units_sold': 'units sold',
    'dashboard.per_transaction': 'per transaction',
    'dashboard.visitor_to_customer': 'visitor to customer',
    'dashboard.total_stock_value': 'total stock value',
    'dashboard.need_restocking': 'need restocking',
    
    // Navigation
    'navigation.sales': 'Sales',
    'navigation.purchases': 'Purchases',
    'navigation.inventory_management': 'Inventory Management',
    'navigation.people': 'People',
    'navigation.reports': 'Reports',
    
    // Products
    'products.add_product': 'Add Product',
    'products.product_name': 'Product Name',
    'products.price': 'Price',
    'products.cost_price': 'Cost Price',
    'products.stock': 'Stock',
    'products.category': 'Category',
    'products.supplier': 'Supplier',
    'products.sku': 'SKU',
    'products.barcode': 'Barcode',
    'products.description': 'Description',
    
    // Orders
    'orders.order_id': 'Order ID',
    'orders.customer': 'Customer',
    'orders.total_amount': 'Total Amount',
    'orders.status': 'Status',
    'orders.date': 'Date',
    'orders.pending': 'Pending',
    'orders.completed': 'Completed',
    'orders.cancelled': 'Cancelled',
    'orders.processing': 'Processing',
    
    // Invoices
    'invoices.title': 'Invoices & Receipts',
    'invoices.subtitle': 'Manage invoices and payment receipts',
    'invoices.add_invoice': 'Add Invoice',
    'invoices.edit_invoice': 'Edit Invoice',
    'invoices.delete_invoice': 'Delete Invoice',
    'invoices.delete_invoice_confirmation': 'Are you sure you want to delete invoice #{id}?',
    'invoices.invoice_deleted_successfully': 'Invoice deleted successfully',
    'invoices.authentication_required': 'Authentication required',
    'invoices.generating_pdf': 'Generating PDF...',
    'invoices.download_invoice_pdf': 'Download PDF',
    'invoices.customer_name': 'Customer Name',
    'invoices.order_id': 'Order ID',
    'invoices.total_amount': 'Total Amount',
    'invoices.due_date': 'Due Date',
    'invoices.search_placeholder': 'Search invoices...',
    'invoices.loading_invoices': 'Loading invoices...',
    'invoices.no_invoices_found': 'No invoices found',
    'invoices.invoice_status.unpaid': 'Unpaid',
    'invoices.invoice_status.paid': 'Paid',
    'invoices.invoice_status.overdue': 'Overdue',
    
    // Common UI
    'ui.failed_to_load': 'Failed to load',
    'ui.failed_to_save': 'Failed to save',
    'ui.saving': 'Saving...',
    'ui.export_csv': 'Export CSV',
    'ui.actions': 'Actions',
    'ui.previous': 'Previous',
    'ui.next': 'Next',
    'ui.page': 'Page',
    'ui.of': 'of',
    'ui.items_per_page': 'items per page'
  },
  ar: {
    // Common
    'common.dashboard': 'لوحة التحكم',
    'common.products': 'المنتجات',
    'common.categories': 'الفئات',
    'common.suppliers': 'الموردون',
    'common.customers': 'العملاء',
    'common.orders': 'الطلبات',
    'common.payments': 'المدفوعات',
    'common.company_payments': 'مدفوعات الشركة',
    'common.purchase_orders': 'أوامر الشراء',
    'common.inventory': 'المخزون',
    'common.employees': 'الموظفون',
    'common.invoices': 'الفواتير',
    'common.warranties': 'الضمانات',
    'common.settings': 'الإعدادات',
    'common.logout': 'تسجيل الخروج',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.loading': 'جاري التحميل...',
    'common.no_data': 'لا توجد بيانات',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.home': 'الرئيسية',
    'common.people': 'الأشخاص',
    'common.other': 'أخرى',
    'common.reports': 'التقارير',
    'common.sign_out': 'تسجيل الخروج',
    'common.switch_language': 'تبديل اللغة',
    'common.switch_to_light_mode': 'التبديل إلى الوضع الفاتح',
    'common.switch_to_dark_mode': 'التبديل إلى الوضع الداكن',
    
    // Dashboard
    'dashboard.total_sales': 'إجمالي المبيعات',
    'dashboard.total_orders': 'إجمالي الطلبات',
    'dashboard.total_customers': 'إجمالي العملاء',
    'dashboard.total_products': 'إجمالي المنتجات',
    'dashboard.average_order_value': 'متوسط قيمة الطلب',
    'dashboard.conversion_rate': 'معدل التحويل',
    'dashboard.inventory_value': 'قيمة المخزون',
    'dashboard.low_stock_items': 'عناصر المخزون المنخفض',
    'dashboard.vs_previous_period': 'مقارنة بالفترة السابقة',
    'dashboard.orders_processed': 'طلبات معالجة',
    'dashboard.unique_customers': 'عملاء فريدون',
    'dashboard.units_sold': 'وحدات مباعة',
    'dashboard.per_transaction': 'لكل معاملة',
    'dashboard.visitor_to_customer': 'زائر إلى عميل',
    'dashboard.total_stock_value': 'إجمالي قيمة المخزون',
    'dashboard.need_restocking': 'تحتاج إعادة تخزين',
    
    // Navigation
    'navigation.sales': 'المبيعات',
    'navigation.purchases': 'المشتريات',
    'navigation.inventory_management': 'إدارة المخزون',
    'navigation.people': 'الأشخاص',
    'navigation.reports': 'التقارير',
    
    // Products
    'products.add_product': 'إضافة منتج',
    'products.product_name': 'اسم المنتج',
    'products.price': 'السعر',
    'products.cost_price': 'سعر التكلفة',
    'products.stock': 'المخزون',
    'products.category': 'الفئة',
    'products.supplier': 'المورد',
    'products.sku': 'رمز المنتج',
    'products.barcode': 'الباركود',
    'products.description': 'الوصف',
    
    // Orders
    'orders.order_id': 'رقم الطلب',
    'orders.customer': 'العميل',
    'orders.total_amount': 'المبلغ الإجمالي',
    'orders.status': 'الحالة',
    'orders.date': 'التاريخ',
    'orders.pending': 'معلق',
    'orders.completed': 'مكتمل',
    'orders.cancelled': 'ملغي',
    'orders.processing': 'قيد المعالجة',
    
    // Invoices
    'invoices.title': 'الفواتير والإيصالات',
    'invoices.subtitle': 'إدارة الفواتير وإيصالات الدفع',
    'invoices.add_invoice': 'إضافة فاتورة',
    'invoices.edit_invoice': 'تعديل الفاتورة',
    'invoices.delete_invoice': 'حذف الفاتورة',
    'invoices.delete_invoice_confirmation': 'هل أنت متأكد من حذف الفاتورة رقم #{id}؟',
    'invoices.invoice_deleted_successfully': 'تم حذف الفاتورة بنجاح',
    'invoices.authentication_required': 'مطلوب المصادقة',
    'invoices.generating_pdf': 'جاري إنشاء PDF...',
    'invoices.download_invoice_pdf': 'تحميل PDF',
    'invoices.customer_name': 'اسم العميل',
    'invoices.order_id': 'رقم الطلب',
    'invoices.total_amount': 'المبلغ الإجمالي',
    'invoices.due_date': 'تاريخ الاستحقاق',
    'invoices.search_placeholder': 'البحث في الفواتير...',
    'invoices.loading_invoices': 'جاري تحميل الفواتير...',
    'invoices.no_invoices_found': 'لم يتم العثور على فواتير',
    'invoices.invoice_status.unpaid': 'غير مدفوعة',
    'invoices.invoice_status.paid': 'مدفوعة',
    'invoices.invoice_status.overdue': 'متأخرة',
    
    // Common UI
    'ui.failed_to_load': 'فشل في التحميل',
    'ui.failed_to_save': 'فشل في الحفظ',
    'ui.saving': 'جاري الحفظ...',
    'ui.export_csv': 'تصدير CSV',
    'ui.actions': 'الإجراءات',
    'ui.previous': 'السابق',
    'ui.next': 'التالي',
    'ui.page': 'صفحة',
    'ui.of': 'من',
    'ui.items_per_page': 'عنصر في الصفحة'
  }
};

export const useTranslation = () => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Get current language from localStorage
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const t = (key, options = {}) => {
    return translations[language]?.[key] || key;
  };

  return { t, language };
};
