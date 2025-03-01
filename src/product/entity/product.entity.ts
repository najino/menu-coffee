import Decimal from "decimal.js";

export interface Product {
    name: string;
    price: Decimal
    img: string;
    model: string[]
    description: string
    status: boolean
}