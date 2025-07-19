# E-commerce Integration Hub - Design Document

## Overview

The E-commerce Integration Hub module serves as AdVantage's comprehensive e-commerce marketing solution, providing deep integrations with major e-commerce platforms, intelligent product-based automation, and sophisticated sales attribution. This module transforms product data into marketing opportunities and revenue insights.

### Design Principles
- **Platform-Agnostic Integration**: Seamless connectivity across all major e-commerce platforms
- **Real-Time Synchronization**: Instant product and inventory data updates
- **Revenue-Focused Analytics**: Direct correlation between marketing activities and sales
- **Intelligent Automation**: AI-driven product marketing and inventory optimization
- **Scalable Architecture**: Support for high-volume product catalogs and transactions
- **Compliance-Ready**: Built-in support for e-commerce regulations and standards

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Mobile App                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   E-commerce    │  │   Product       │  │  Sales      │ │
│  │   Dashboard     │  │   Catalog       │  │  Analytics  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    E-commerce API Gateway                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Integration   │  │   Product       │  │  Attribution│ │
│  │   Manager       │  │   Sync Engine   │  │  Engine     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    E-commerce Processing Layer              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Inventory     │  │   Campaign      │  │  Revenue    │ │
│  │   Automation    │  │   Optimization  │  │  Tracking   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    E-commerce Data Layer                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Product       │  │   Order         │  │  Customer   │ │
│  │   Database      │  │   Database      │  │  Database   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### E-commerce Integration

```typescript
interface EcommerceStore {
  id: string;
  userId: string;
  businessId: string;
  platform: EcommercePlatform;
  name: string;
  url: string;
  currency: string;
  timezone: string;
  configuration: StoreConfiguration;
  authentication: StoreAuthentication;
  syncSettings: SyncSettings;
  status: StoreStatus;
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

type EcommercePlatform = 
  | 'shopify'
  | 'amazon'
  | 'etsy'
  | 'woocommerce'
  | 'bigcommerce'
  | 'magento'
  | 'squarespace'
  | 'ebay'
  | 'custom';

interface Product {
  id: string;
  storeId: string;
  externalId: string;
  title: string;
  description: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  variants: ProductVariant[];
  images: ProductImage[];
  seo: ProductSEO;
  pricing: ProductPricing;
  inventory: ProductInventory;
  analytics: ProductAnalytics;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

interface ProductVariant {
  id: string;
  productId: string;
  externalId: string;
  title: string;
  sku: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  weight: number;
  weightUnit: string;
  inventory: VariantInventory;
  options: VariantOption[];
  image?: ProductImage;
  status: VariantStatus;
}

interface Order {
  id: string;
  storeId: string;
  externalId: string;
  orderNumber: string;
  customer: OrderCustomer;
  lineItems: OrderLineItem[];
  shippingAddress: Address;
  billingAddress: Address;
  financials: OrderFinancials;
  fulfillment: OrderFulfillment;
  attribution: OrderAttribution;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}
```

## Data Models

### Database Schema

```sql
-- E-commerce Stores
CREATE TABLE public.ecommerce_stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  url TEXT,
  currency VARCHAR(3) NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  authentication JSONB NOT NULL DEFAULT '{}',
  sync_settings JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'inactive',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.ecommerce_stores(id) ON DELETE CASCADE NOT NULL,
  external_id VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  handle VARCHAR(200),
  vendor VARCHAR(200),
  product_type VARCHAR(100),
  tags JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  seo JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  inventory JSONB DEFAULT '{}',
  analytics JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(store_id, external_id)
);

-- Orders
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.ecommerce_stores(id) ON DELETE CASCADE NOT NULL,
  external_id VARCHAR(100) NOT NULL,
  order_number VARCHAR(100) NOT NULL,
  customer JSONB NOT NULL,
  line_items JSONB NOT NULL DEFAULT '[]',
  shipping_address JSONB,
  billing_address JSONB,
  financials JSONB NOT NULL DEFAULT '{}',
  fulfillment JSONB DEFAULT '{}',
  attribution JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(store_id, external_id)
);
```

This design document provides the foundation for implementing the E-commerce Integration Hub module.