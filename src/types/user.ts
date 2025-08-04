export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  birthDate?: Date;
  gender?: 'male' | 'female';
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  termsAgree: boolean;
  privacyAgree: boolean;
  marketingAgree: boolean;
}

export interface UserProfile extends User {
  addresses: Address[];
  preferences: UserPreferences;
  point: number;
  grade: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface Address {
  id: string;
  name: string;
  recipient: string;
  phone: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UserPreferences {
  favoriteCategories: string[];
  favoriteBrands: string[];
  sizes: {
    top?: string;
    bottom?: string;
    shoes?: string;
  };
  newsletter: boolean;
  smsMarketing: boolean;
}
