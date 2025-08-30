import { Category } from '../../category/entity/category.entity';
export type DiscountType = 'flat' | 'percentage';

export interface Product {
  name: string;
  price: string;
  img?: string;
  models: string[];
  description: string;
  status: boolean;
  category: Category;
  discount?: {
    type: DiscountType;
    value: number;
    isActive: boolean;
    appliedAt?: Date;
    expiresAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
