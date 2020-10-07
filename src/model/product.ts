export interface Product {
  id: number;
  name: string;
  cost: number;
  color: 'white' | 'blue' | 'green' | 'red';
  size: 'small' | 'medium' | 'large';
  retired: number;
}
