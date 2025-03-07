// src/components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <header className="bg-orange-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">BuildMart</Link>
          
          <div className="flex-1 mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="What can we help you find today?"
                className="w-full p-2 rounded text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-2 top-2 text-gray-600">
                <FaSearch />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/account" className="flex items-center gap-1">
              <FaUser />
              <span>Account</span>
            </Link>
            <Link to="/cart" className="flex items-center gap-1">
              <FaShoppingCart />
              <span>Cart</span>
            </Link>
          </div>
        </div>
        
        <nav className="mt-2">
          <ul className="flex gap-6">
            <li><Link to="/category/all-departments">All Departments</Link></li>
            <li><Link to="/category/tools">Tools</Link></li>
            <li><Link to="/category/building-materials">Building Materials</Link></li>
            <li><Link to="/category/electrical">Electrical</Link></li>
            <li><Link to="/category/plumbing">Plumbing</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

// src/components/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  return (
    <div className="border rounded p-4 hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-48 object-contain mb-4"
        />
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <div className="flex items-center mt-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'} 
              />
            ))}
          </div>
          <span className="ml-2 text-gray-600">({product.reviewCount})</span>
        </div>
        <p className="font-bold text-xl mt-2">${product.price.toFixed(2)}</p>
        {product.compareAtPrice && (
          <p className="text-gray-500 line-through text-sm">
            ${product.compareAtPrice.toFixed(2)}
          </p>
        )}
        {product.freeShipping && (
          <p className="text-green-600 text-sm mt-1">Free Shipping</p>
        )}
      </Link>
      <button 
        className="mt-3 w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;

// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { FaTools, FaHammer, FaLightbulb, FaSink } from 'react-icons/fa';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealsProducts, setDealsProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real application, these would be API calls
    const fetchProducts = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Placeholder data
        const featuredData = [
          {
            id: 1,
            name: 'Cordless Power Drill Set',
            price: 129.99,
            compareAtPrice: 149.99,
            rating: 4.5,
            reviewCount: 128,
            imageUrl: '/api/placeholder/200/200',
            freeShipping: true
          },
          {
            id: 2,
            name: 'Premium Paint Roller Kit',
            price: 24.99,
            compareAtPrice: null,
            rating: 4.2,
            reviewCount: 85,
            imageUrl: '/api/placeholder/200/200',
            freeShipping: false
          },
          // Add more products
        ];
        
        setFeaturedProducts(featuredData);
        setDealsProducts([...featuredData].reverse());
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const categories = [
    { name: 'Tools', icon: <FaTools size={24} />, url: '/category/tools' },
    { name: 'Building Materials', icon: <FaHammer size={24} />, url: '/category/building-materials' },
    { name: 'Electrical', icon: <FaLightbulb size={24} />, url: '/category/electrical' },
    { name: 'Plumbing', icon: <FaSink size={24} />, url: '/category/plumbing' },
  ];
  
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="bg-gray-200 rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Spring Home Improvement Sale</h1>
        <p className="text-xl mb-4">Save up to 40% on selected tools and materials</p>
        <button className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700">
          Shop Now
        </button>
      </div>
      
      {/* Category Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map((category, index) => (
          <a 
            key={index} 
            href={category.url}
            className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md"
          >
            <div className="text-orange-600 mb-2">{category.icon}</div>
            <span>{category.name}</span>
          </a>
        ))}
      </div>
      
      {/* Featured Products */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
      {/* Special Deals */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Special Deals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dealsProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

// src/pages/ProductDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaTruck, FaStore, FaCheck } from 'react-icons/fa';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Placeholder data (would come from API in real application)
        const productData = {
          id: productId,
          name: 'Cordless Power Drill Set',
          price: 129.99,
          compareAtPrice: 149.99,
          rating: 4.5,
          reviewCount: 128,
          imageUrl: '/api/placeholder/400/400',
          images: [
            '/api/placeholder/400/400',
            '/api/placeholder/400/400',
            '/api/placeholder/400/400'
          ],
          description: 'Professional 20V cordless drill with lithium-ion battery, charger, and carrying case. Features variable speed control and LED work light.',
          specifications: [
            { name: 'Power Source', value: 'Battery Powered' },
            { name: 'Voltage', value: '20V' },
            { name: 'Chuck Size', value: '1/2 inch' },
            { name: 'Speed', value: '0-1500 RPM' },
            { name: 'Weight', value: '3.5 lbs' }
          ],
          freeShipping: true,
          inStock: true,
          storeAvailability: [
            { store: 'Downtown', available: true, quantity: 5 },
            { store: 'Westside', available: true, quantity: 8 },
            { store: 'Northgate', available: false, quantity: 0 }
          ]
        };
        
        setProduct(productData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);
  
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  
  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full rounded-lg border"
          />
          <div className="grid grid-cols-3 gap-2 mt-4">
            {product.images.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`${product.name} - View ${index + 1}`} 
                className="border rounded cursor-pointer"
              />
            ))}
          </div>
        </div>
        
        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'} 
                />
              ))}
            </div>
            <span className="ml-2 text-blue-600 underline cursor-pointer">
              {product.reviewCount} reviews
            </span>
          </div>
          
          <div className="mb-4">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="ml-2 text-gray-500 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Delivery/Pickup Options */}
          <div className="mb-6 bg-gray-100 p-4 rounded">
            <div className="flex items-start mb-3">
              <FaTruck className="text-green-600 mt-1 mr-2" />
              <div>
                <p className="font-semibold">Delivery</p>
                <p className="text-sm text-gray-600">
                  {product.freeShipping ? 'Free shipping' : 'Standard shipping rates apply'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FaStore className="text-green-600 mt-1 mr-2" />
              <div>
                <p className="font-semibold">Store Pickup</p>
                <p className="text-sm text-gray-600">Check availability at nearby stores</p>
                <button className="text-blue-600 text-sm">View store availability</button>
              </div>
            </div>
          </div>
          
          {/* Add to Cart */}
          <div className="flex items-center mb-6">
            <div className="border rounded mr-4">
              <button 
                className="px-3 py-1"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-12 text-center"
              />
              <button 
                className="px-3 py-1"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
            
            <button className="bg-orange-600 text-white py-2 px-6 rounded font-semibold hover:bg-orange-700 flex-1">
              Add to Cart
            </button>
          </div>
          
          {/* In Stock Status */}
          {product.inStock ? (
            <p className="flex items-center text-green-600 mb-4">
              <FaCheck className="mr-2" /> In Stock
            </p>
          ) : (
            <p className="text-red-600 mb-4">Out of Stock</p>
          )}
        </div>
      </div>
      
      {/* Tabs - Description, Specifications, Reviews */}
      <div className="mt-8 border-t">
        <div className="flex border-b">
          <button 
            className={`py-3 px-4 font-medium ${selectedTab === 'description' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600'}`}
            onClick={() => setSelectedTab('description')}
          >
            Description
          </button>
          <button 
            className={`py-3 px-4 font-medium ${selectedTab === 'specifications' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600'}`}
            onClick={() => setSelectedTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`py-3 px-4 font-medium ${selectedTab === 'reviews' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600'}`}
            onClick={() => setSelectedTab('reviews')}
          >
            Reviews
          </button>
        </div>
        
        <div className="py-4">
          {selectedTab === 'description' && (
            <p>{product.description}</p>
          )}
          
          {selectedTab === 'specifications' && (
            <table className="w-full">
              <tbody>
                {product.specifications.map((spec, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                    <td className="py-2 px-4 font-medium">{spec.name}</td>
                    <td className="py-2 px-4">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {selectedTab === 'reviews' && (
            <div>
              <p>Product has {product.reviewCount} reviews with an average rating of {product.rating} stars.</p>
              {/* Reviews would be listed here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
