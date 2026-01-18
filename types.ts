
export interface Product {
  id: string;
  name: string;
  capacity: string;
  price: number;
  emi: number;
  savings: number;
  image: string;
  description: string;
  features: string[];
  quantity: number;
  stockStatus: 'in_stock' | 'out_of_stock';
  updatedAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  latestBillURL?: string;
  billUpdatedAt?: number;
  createdAt: number;
}

export interface Quote {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  status: 'pending' | 'draft' | 'sent' | 'approved' | 'rejected';
  basePrice: number;
  finalPrice?: number;
  adminNotes?: string;
  address: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
}
