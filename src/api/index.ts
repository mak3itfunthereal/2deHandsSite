import { createApiClient, type ProductFilterParams } from "./client";
import type { Conversation, Product, UserProfile } from "../types";
import { initialConversations, products as defaultProducts } from "../utils/mockData";
import { defaultUser } from "../utils/mockData";
import { matchesCategory, matchesQuery } from "../utils/search";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const rawApiClient = createApiClient(API_BASE_URL || "/api");

// LocalStorage helpers for seamless offline/fallback development
const PRODUCTS_KEY = "bidzaar-products-cache";
const CONVERSATIONS_KEY = "bidzaar-conversations-cache";

function getLocalProducts(): Product[] {
  try {
    const raw = window.localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch {
    // ignore
  }
  return defaultProducts;
}

function saveLocalProducts(products: Product[]) {
  try {
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}

function getLocalConversations(): Conversation[] {
  try {
    const raw = window.localStorage.getItem(CONVERSATIONS_KEY);
    if (raw) return JSON.parse(raw) as Conversation[];
  } catch {
    // ignore
  }
  return initialConversations;
}

function saveLocalConversations(convs: Conversation[]) {
  try {
    window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
  } catch {
    // ignore
  }
}

/**
 * Unified Marketplace API:
 * Tries the real backend API first; falls back smoothly to local storage
 * so the application works out-of-the-box and is 100% plug-and-play ready for backend integration.
 */
export const api = {
  // PRODUCTS
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    if (API_BASE_URL) {
      try {
        return await rawApiClient.getProducts(params);
      } catch (err) {
        console.warn("Backend API unavailable, falling back to local data:", err);
      }
    }

    let list = getLocalProducts();
    if (params?.query) {
      list = list.filter((p) => matchesQuery(p, params.query!));
    }
    if (params?.category) {
      list = list.filter((p) => matchesCategory(p, params.category!));
    }
    if (params?.state) {
      list = list.filter((p) => p.state === params.state);
    }
    if (params?.minPrice != null) {
      list = list.filter((p) => (p.priceAmount ?? 0) >= params.minPrice!);
    }
    if (params?.maxPrice != null) {
      list = list.filter((p) => (p.priceAmount ?? 0) <= params.maxPrice!);
    }
    return list;
  },

  async getProductById(id: number | string): Promise<Product | undefined> {
    if (API_BASE_URL) {
      try {
        return await rawApiClient.getProductById(id);
      } catch (err) {
        console.warn(`Backend API getProductById(${id}) failed, checking local cache:`, err);
      }
    }
    const numId = Number(id);
    return getLocalProducts().find((p) => p.id === numId);
  },

  async createProduct(newProductData: Omit<Product, "id"> & { id?: number }): Promise<Product> {
    if (API_BASE_URL) {
      try {
        return await rawApiClient.createProduct(newProductData);
      } catch (err) {
        console.warn("Backend API createProduct failed, saving to local store:", err);
      }
    }

    const current = getLocalProducts();
    const newId = newProductData.id || Math.max(0, ...current.map((p) => p.id)) + 1;
    const created: Product = {
      ...newProductData,
      id: newId,
      createdAt: "Just now",
      isUserAd: true,
      images: newProductData.images || [newProductData.image],
    };
    const updated = [created, ...current];
    saveLocalProducts(updated);
    return created;
  },

  async deleteProduct(id: number | string): Promise<boolean> {
    if (API_BASE_URL) {
      try {
        const res = await rawApiClient.deleteProduct(id);
        return res.success;
      } catch (err) {
        console.warn(`Backend API deleteProduct(${id}) failed:`, err);
      }
    }
    const current = getLocalProducts();
    const updated = current.filter((p) => p.id !== Number(id));
    saveLocalProducts(updated);
    return true;
  },

  // CONVERSATIONS
  async getConversations(): Promise<Conversation[]> {
    if (API_BASE_URL) {
      try {
        return await rawApiClient.getConversations();
      } catch (err) {
        console.warn("Backend API getConversations failed, using local conversations:", err);
      }
    }
    return getLocalConversations();
  },

  async sendMessage(
    conversationId: string,
    text: string,
    sender: "me" | "them" = "me",
  ): Promise<Conversation | undefined> {
    if (API_BASE_URL) {
      try {
        return await rawApiClient.sendMessage(conversationId, { text, sender });
      } catch (err) {
        console.warn("Backend API sendMessage failed, using local store:", err);
      }
    }

    const conversations = getLocalConversations();
    const target = conversations.find((c) => c.id === conversationId);
    if (!target) return undefined;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      time: "Just now",
    };
    target.messages.push(newMsg);
    target.msg = text;
    target.time = "Just now";

    saveLocalConversations([...conversations]);
    return { ...target };
  },

  async startOrGetConversation(product: Product): Promise<Conversation> {
    const conversations = getLocalConversations();
    let existing = conversations.find((c) => c.productId === product.id);
    if (!existing) {
      existing = {
        id: `conv-prod-${product.id}`,
        productId: product.id,
        productTitle: product.title,
        productImage: product.image,
        productPrice: product.price,
        initials: product.sellerInitials || product.sellerName?.slice(0, 2).toUpperCase() || "VK",
        name: product.sellerName || "Seller",
        msg: `Interested in ${product.title}`,
        time: "Just now",
        unread: 0,
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            sender: "them",
            text: `Hello! You're viewing my listing for "${product.title}". Do you have any questions?`,
            time: "Just now",
          },
        ],
      };
      conversations.unshift(existing);
      saveLocalConversations(conversations);
    }
    return existing;
  },

  // USER PROFILE
  async getUserProfile(): Promise<UserProfile> {
    if (API_BASE_URL) {
      try {
        return await rawApiClient.getUserProfile();
      } catch (err) {
        console.warn("Backend API getUserProfile failed:", err);
      }
    }
    try {
      const stored = window.localStorage.getItem("bidzaar-user");
      if (stored) return JSON.parse(stored) as UserProfile;
    } catch {
      // ignore
    }
    return defaultUser;
  },
};
