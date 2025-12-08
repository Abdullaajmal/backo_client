import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Layout from './Layout';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, draft, archived

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching products from API...');
      const response = await api.getProducts();
      console.log('📥 Products API response:', response);
      
      if (response && response.success !== false) {
        // Handle different response structures
        const productsData = response.data || response;
        if (Array.isArray(productsData)) {
          setProducts(productsData);
          console.log(`✅ Loaded ${productsData.length} products`);
          // Refresh Layout's product list
          window.dispatchEvent(new Event('productsUpdated'));
        } else {
          console.error('❌ Products data is not an array:', productsData);
          setProducts([]);
          setError('Invalid products data received');
        }
      } else {
        console.error('❌ Failed to fetch products:', response.message || 'Unknown error');
        setProducts([]);
        setError(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
      alert(err.message || 'Failed to fetch products. Please check your Shopify connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError('');
      await api.syncProducts();
      // Refresh products after sync
      await fetchProducts();
      alert('Products synced successfully!');
    } catch (err) {
      setError(err.message || 'Failed to sync products');
      alert(err.message || 'Failed to sync products');
    } finally {
      setSyncing(false);
    }
  };

  // Filter products based on search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.productType?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'draft':
        return 'status-draft';
      case 'archived':
        return 'status-archived';
      default:
        return 'status-unknown';
    }
  };

  return (
    <Layout>
      <div className="products-main">
        <div className="products-header">
          <div>
            <h1 className="products-title">Products</h1>
            <p className="products-subtitle">Manage your Shopify products</p>
          </div>
          <button 
            className="sync-button"
            onClick={handleSync}
            disabled={syncing || loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.51 15C4.37139 17.2645 5.87321 19.2156 7.80451 20.5815C9.73582 21.9474 12.0045 22.6702 14.33 22.66C16.6555 22.6702 18.9242 21.9474 20.8555 20.5815C22.7868 19.2156 24.2886 17.2645 25.15 15M20.49 9C19.6286 6.73546 18.1268 4.78441 16.1955 3.41852C14.2642 2.05263 11.9955 1.32978 9.67 1.34C7.34453 1.32978 5.07582 2.05263 3.14451 3.41852C1.21321 4.78441 -0.288611 6.73546 -1.15 9L3.51 9H20.49Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {syncing ? 'Syncing...' : 'Sync from Shopify'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="products-filters">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V11C16 10.4696 15.7893 9.96086 15.4142 9.58579C15.0391 9.21071 14.5304 9 14 9H10C9.46957 9 8.96086 9.21071 8.58579 9.58579C8.21071 9.96086 8 10.4696 8 11V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10L12 3L22 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No products found</h3>
            <p>{searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Sync products from Shopify to get started'}</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].src} 
                      alt={product.images[0].alt || product.title}
                      className="product-image"
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 21V11C16 10.4696 15.7893 9.96086 15.4142 9.58579C15.0391 9.21071 14.5304 9 14 9H10C9.46957 9 8.96086 9.21071 8.58579 9.58579C8.21071 9.96086 8 10.4696 8 11V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 10L12 3L22 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <span className={`status-badge ${getStatusBadgeClass(product.status)}`}>
                    {product.status || 'Unknown'}
                  </span>
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  {product.vendor && (
                    <p className="product-vendor">{product.vendor}</p>
                  )}
                  {product.variants && product.variants.length > 0 && (
                    <div className="product-price">
                      {formatPrice(product.variants[0].price)}
                      {product.variants[0].compareAtPrice && (
                        <span className="compare-price">
                          {formatPrice(product.variants[0].compareAtPrice)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="product-meta">
                    {product.variants && (
                      <span className="product-variants">
                        {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {product.productType && (
                      <span className="product-type">{product.productType}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Count */}
        {!loading && filteredProducts.length > 0 && (
          <div className="products-footer">
            <p>Showing {filteredProducts.length} of {products.length} products</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Products;

