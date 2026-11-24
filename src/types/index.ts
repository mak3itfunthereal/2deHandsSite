export type Page =
  | "home"
  | "search"
  | "detail"
  | "chat"
  | "sell"
  | "account"
  | "my-ads"
  | "settings"
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password";

export type Account = {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  role: string;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
};

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
};

export type ConsentPreferences = {
  personalization: boolean;
  location: boolean;
};

export type LocationPreference = {
  city: string;
  postcode: string;
  radius: number;
  lat: number;
  lon: number;
};

export type Product = {
  id: number;
  title: string;
  price: string;
  priceAmount?: number;
  city: string;
  distance: string;
  state: string;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  top?: boolean;
  lat: number;
  lon: number;
  sellerName?: string;
  sellerInitials?: string;
  sellerVerified?: boolean;
  createdAt?: string;
  isUserAd?: boolean;
  calculatedDistance?: number;
  adStatus?: "active" | "reserved" | "sold";
  allowsShipping?: boolean;
  allowsPickup?: boolean;
  allowsOffers?: boolean;
  allowsProtection?: boolean;
  bids?: Array<{
    id: string;
    bidderName: string;
    amount: number;
    time: string;
    status?: "pending" | "accepted" | "declined";
  }>;
};

export type ChatMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  productId?: number;
  productTitle?: string;
  productImage?: string;
  productPrice?: string;
  initials: string;
  name: string;
  msg: string;
  time: string;
  unread?: number;
  messages: ChatMessage[];
};
