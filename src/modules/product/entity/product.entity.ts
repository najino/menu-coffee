import { ObjectId } from "mongodb";
import { Category } from "../../category/entity/category.entity";

export interface Product {
  name: string;
  price: string;
  img?: string;
  models: string[];
  description: string;
  status: boolean;
  category: Category
}
