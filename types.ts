
export type IntentType = 'Birthday' | 'Anniversary' | 'Surprise' | 'Custom Gifts';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  category: IntentType;
  story: string;
  customizableFields: string[];
  materials?: string;
  process?: string;
  care?: string;
  created_at?: string;
}

export interface CustomizationState {
  text: string;
  color: string;
  options: Record<string, string>;
}

export interface CartItem extends CustomizationState {
  cartId: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  payment_method_last4: string;
  onboarding_complete: boolean;
  updated_at: string;
}
