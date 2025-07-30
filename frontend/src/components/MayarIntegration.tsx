import React, { useState, useEffect, useCallback } from 'react';
import { MayarApiClient } from '@/services/mayar-api';
import { 
  Product, 
  ProductType,
  CreateInvoiceRequest, 
  CreatePaymentRequestRequest,
  Invoice,
  PaymentRequest,
  MayarApiResponse 
} from '@/types/mayar';

interface MayarIntegrationProps {
  className?: string;
}

interface ProductListProps {
  onProductSelect: (product: Product) => void;
}

interface InvoiceFormProps {
  selectedProduct: Product | undefined;
  onInvoiceCreated: (invoice: Invoice) => void;
}

interface PaymentRequestFormProps {
  selectedProduct: Product | undefined;
  onPaymentRequestCreated: (paymentRequest: PaymentRequest) => void;
}

// Product List Component
const ProductList: React.FC<ProductListProps> = ({ onProductSelect }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const fetchProducts = useCallback(async (): Promise<void> => {
    const mayarClient = new MayarApiClient();
    
    try {
      setLoading(true);
      setError('');

      let response: MayarApiResponse<Product[]>;

      if (selectedType) {
        response = await mayarClient.getProductsByType({ type: selectedType as ProductType });
      } else {
        response = await mayarClient.getProducts();
      }

      if (response.data) {
        setProducts(response.data);
      } else {
        setError(response.messages || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, searchTerm]);

  const productTypes = [
    'generic_link',
    'physical_product',
    'event',
    'webinar',
    'digital_product',
    'coaching',
    'cohort_based',
    'fundraising',
    'ebook',
    'podcast',
    'audiobook',
    'membership'
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          {productTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onProductSelect(product)}
            >
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">
                Type: {product.type.replace('_', ' ')}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">
                  {product.amount ? `Rp ${product.amount.toLocaleString('id-ID')}` : 'Free'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products found
        </div>
      )}
    </div>
  );
};

// Invoice Form Component
const InvoiceForm: React.FC<InvoiceFormProps> = ({ selectedProduct, onInvoiceCreated }) => {
  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [],
    dueDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const mayarClient = new MayarApiClient();

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        items: [{
          name: selectedProduct.name,
          price: selectedProduct.amount || 0,
          quantity: 1,
          description: `Product: ${selectedProduct.name}`
        }]
      }));
    }
  }, [selectedProduct]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const response = await mayarClient.createInvoice(formData);

      if (response.data) {
        onInvoiceCreated(response.data);
        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          items: selectedProduct ? [{
            name: selectedProduct.name,
            price: selectedProduct.amount || 0,
            quantity: 1,
            description: `Product: ${selectedProduct.name}`
          }] : [],
          dueDate: '',
          notes: ''
        });
      } else {
        setError(response.messages || 'Failed to create invoice');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Create Invoice</h3>
      
      {selectedProduct && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            Selected Product: <strong>{selectedProduct.name}</strong>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleInputChange}
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <input
          type="email"
          name="customerEmail"
          placeholder="Customer Email"
          value={formData.customerEmail}
          onChange={handleInputChange}
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <input
          type="tel"
          name="customerPhone"
          placeholder="Customer Phone"
          value={formData.customerPhone || ''}
          onChange={handleInputChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <input
          type="date"
          name="dueDate"
          placeholder="Due Date"
          value={formData.dueDate || ''}
          onChange={handleInputChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <textarea
        name="notes"
        placeholder="Notes (optional)"
        value={formData.notes || ''}
        onChange={handleInputChange}
        rows={2}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Invoice...' : 'Create Invoice'}
      </button>
    </form>
  );
};

// Payment Request Form Component
const PaymentRequestForm: React.FC<PaymentRequestFormProps> = ({ selectedProduct, onPaymentRequestCreated }) => {
  const [formData, setFormData] = useState<CreatePaymentRequestRequest>({
    amount: 0,
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const mayarClient = new MayarApiClient();

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        amount: selectedProduct.amount || 0,
        description: `Payment for ${selectedProduct.name}`
      }));
    }
  }, [selectedProduct]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const response = await mayarClient.createPaymentRequest(formData);

      if (response.data) {
        onPaymentRequestCreated(response.data);
        // Reset form
        setFormData({
          amount: selectedProduct?.amount || 0,
          description: selectedProduct ? `Payment for ${selectedProduct.name}` : '',
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          expiryDate: ''
        });
      } else {
        setError(response.messages || 'Failed to create payment request');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Create Payment Request</h3>
      
      {selectedProduct && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800">
            Selected Product: <strong>{selectedProduct.name}</strong>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleInputChange}
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <input
          type="email"
          name="customerEmail"
          placeholder="Customer Email"
          value={formData.customerEmail}
          onChange={handleInputChange}
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleInputChange}
          required
          min="0"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <input
          type="tel"
          name="customerPhone"
          placeholder="Customer Phone (optional)"
          value={formData.customerPhone || ''}
          onChange={handleInputChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleInputChange}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <input
        type="date"
        name="expiryDate"
        placeholder="Expiry Date (optional)"
        value={formData.expiryDate || ''}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Payment Request...' : 'Create Payment Request'}
      </button>
    </form>
  );
};

// Main Mayar Integration Component
const MayarIntegration: React.FC<MayarIntegrationProps> = ({ className = '' }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [activeTab, setActiveTab] = useState<'products' | 'invoice' | 'payment'>('products');
  const [createdInvoices, setCreatedInvoices] = useState<Invoice[]>([]);
  const [createdPaymentRequests, setCreatedPaymentRequests] = useState<PaymentRequest[]>([]);

  const handleProductSelect = (product: Product): void => {
    setSelectedProduct(product);
    setActiveTab('invoice');
  };

  const handleInvoiceCreated = (invoice: Invoice): void => {
    setCreatedInvoices(prev => [invoice, ...prev]);
    alert('Invoice created successfully!');
  };

  const handlePaymentRequestCreated = (paymentRequest: PaymentRequest): void => {
    setCreatedPaymentRequests(prev => [paymentRequest, ...prev]);
    alert('Payment request created successfully!');
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: '🛍️' },
    { id: 'invoice', label: 'Create Invoice', icon: '📄' },
    { id: 'payment', label: 'Payment Request', icon: '💳' }
  ] as const;

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'products' && (
            <ProductList onProductSelect={handleProductSelect} />
          )}

          {activeTab === 'invoice' && (
            <InvoiceForm 
              selectedProduct={selectedProduct}
              onInvoiceCreated={handleInvoiceCreated}
            />
          )}

          {activeTab === 'payment' && (
            <PaymentRequestForm 
              selectedProduct={selectedProduct}
              onPaymentRequestCreated={handlePaymentRequestCreated}
            />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {(createdInvoices.length > 0 || createdPaymentRequests.length > 0) && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          
          {createdInvoices.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Recent Invoices</h4>
              <div className="space-y-2">
                {createdInvoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.customerName}</p>
                      <p className="text-sm text-gray-600">Rp {invoice.total.toLocaleString('id-ID')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {createdPaymentRequests.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recent Payment Requests</h4>
              <div className="space-y-2">
                {createdPaymentRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">{request.customerName}</p>
                      <p className="text-sm text-gray-600">Rp {request.amount.toLocaleString('id-ID')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MayarIntegration;