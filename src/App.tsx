import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type {
  ConsentPreferences,
  Conversation,
  LocationPreference,
  Page,
  Product,
  UserProfile,
} from "./types";
import {
  distanceBetween,
  initialConversations,
  loadStoredLocation,
  loadStoredUser,
  locations,
  products as defaultProducts,
} from "./utils/marketplace";
import { CookieConsent, Footer, Header, Icon, MobileNav } from "./components/ui";
import { api } from "./api";
import HomePage from "./pages/HomePage";
const SearchPage = lazy(() => import("./pages/SearchPage"));
const DetailPage = lazy(() => import("./pages/DetailPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const SellPage = lazy(() => import("./pages/SellPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const MyAdsPage = lazy(() => import("./pages/MyAdsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
import { loadFavorites, saveFavorites } from "./api/favorites";

function loadStoredFavorites(): Set<number> {
  return new Set(loadFavorites());
}

function loadStoredTheme(): boolean {
  try {
    const stored = window.localStorage.getItem("bidzaar-theme");
    if (stored != null) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function parseHash(): {
  page: Page;
  productId?: number;
  query?: string;
  category?: string;
  convId?: string;
} {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) return { page: "home" };

  const [path, search] = hash.split("?");
  const params = new URLSearchParams(search || "");
  const query = params.get("q") || undefined;
  const category = params.get("cat") || undefined;

  if (path.startsWith("product/")) {
    const id = Number(path.replace("product/", ""));
    return { page: "detail", productId: isNaN(id) ? 1 : id };
  }
  if (path.startsWith("chat/")) {
    const convId = path.replace("chat/", "");
    return { page: "chat", convId };
  }

  const validPages: Page[] = [
    "home",
    "search",
    "detail",
    "chat",
    "sell",
    "account",
    "my-ads",
    "settings",
    "login",
    "register",
  ];
  const matched = validPages.find((p) => p === path);
  return {
    page: matched || "home",
    query,
    category,
  };
}

export default function App() {
  const initialRoute = useMemo(parseHash, []);

  const [page, setPageState] = useState<Page>(initialRoute.page);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    initialRoute.productId ?? 1,
  );
  const [searchQuery, setSearchQuery] = useState<string>(initialRoute.query || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialRoute.category || null,
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialRoute.convId || null,
  );

  const [productsList, setProductsList] = useState<Product[]>(defaultProducts);
  const [conversationsList, setConversationsList] =
    useState<Conversation[]>(initialConversations);

  const [dark, setDark] = useState<boolean>(loadStoredTheme);
  const [loggedIn, setLoggedIn] = useState(
    () => window.localStorage.getItem("bidzaar-auth") !== "false",
  );
  const [user, setUser] = useState<UserProfile>(loadStoredUser);
  const [location, setLocation] = useState<LocationPreference>(loadStoredLocation);
  const [favorites, setFavorites] = useState<Set<number>>(loadStoredFavorites);
  const [notice, setNotice] = useState("");
  const [showConsent, setShowConsent] = useState(
    () => !document.cookie.includes("bidzaar_cookie_consent="),
  );

  // Fetch initial data from API / Local Storage cache
  useEffect(() => {
    void api.getProducts().then(setProductsList);
    void api.getConversations().then(setConversationsList);
  }, []);

  // Sync hash routing with browser history (back/forward support)
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHash();
      setPageState(route.page);
      if (route.productId != null) setSelectedProductId(route.productId);
      if (route.query != null) setSearchQuery(route.query);
      if (route.category != null) setSelectedCategory(route.category);
      if (route.convId != null) setActiveConversationId(route.convId);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const setPage = (
    newPage: Page,
    options?: { productId?: number; query?: string; category?: string; convId?: string },
  ) => {
    setPageState(newPage);
    if (options?.productId != null) setSelectedProductId(options.productId);
    if (options?.query != null) setSearchQuery(options.query);
    if (options?.category !== undefined) setSelectedCategory(options.category);
    if (options?.convId != null) setActiveConversationId(options.convId);

    // Update browser URL hash
    let hashTarget = `#/${newPage === "home" ? "" : newPage}`;
    if (newPage === "detail" && (options?.productId || selectedProductId)) {
      hashTarget = `#/product/${options?.productId || selectedProductId}`;
    } else if (newPage === "chat" && (options?.convId || activeConversationId)) {
      hashTarget = `#/chat/${options?.convId || activeConversationId}`;
    } else if (newPage === "search") {
      const searchParams = new URLSearchParams();
      const q = options?.query ?? searchQuery;
      const cat = options?.category ?? selectedCategory;
      if (q) searchParams.set("q", q);
      if (cat) searchParams.set("cat", cat);
      const str = searchParams.toString();
      if (str) hashTarget = `#/search?${str}`;
    }

    if (window.location.hash !== hashTarget) {
      window.location.hash = hashTarget;
    }
  };

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    window.localStorage.setItem("bidzaar-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const titles: Record<Page, string> = {
      home: "Bidzaar — Buy and sell second-hand, consciously",
      search: searchQuery
        ? `Search “${searchQuery}” — Bidzaar`
        : selectedCategory
          ? `${selectedCategory} — Bidzaar`
          : "Discover listings — Bidzaar",
      detail: (() => {
        const prod = productsList.find((p) => p.id === selectedProductId);
        return prod ? `${prod.title} — Bidzaar` : "Listing details — Bidzaar";
      })(),
      chat: "Messages — Bidzaar",
      sell: "Post a listing — Bidzaar",
      account: "My profile — Bidzaar",
      "my-ads": "My listings — Bidzaar",
      settings: "Settings — Bidzaar",
      login: "Log in — Bidzaar",
      register: "Create an account — Bidzaar",
    };
    document.title = titles[page] || "Bidzaar";
  }, [page, searchQuery, selectedCategory, selectedProductId, productsList]);

  useEffect(() => {
    window.localStorage.setItem("bidzaar-user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem("bidzaar-location", JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, selectedProductId]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const toggle = (id: number) =>
    setFavorites((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const saveConsent = (preferences: ConsentPreferences) => {
    const value = preferences.personalization || preferences.location ? "custom" : "necessary";
    document.cookie = `bidzaar_cookie_consent=${value}; Max-Age=31536000; Path=/; SameSite=Lax`;
    window.localStorage.setItem("bidzaar-consent", JSON.stringify(preferences));
    setShowConsent(false);
    if (!preferences.location) {
      setNotice(`Cookie preferences saved. Your location remains ${location.city}.`);
      return;
    }
    if (!navigator.geolocation) {
      setNotice("Location is unavailable. Choose a city and distance manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = { lat: coords.latitude, lon: coords.longitude };
        const nearest = locations.reduce((best, candidate) =>
          distanceBetween(coordinates, candidate) < distanceBetween(coordinates, best)
            ? candidate
            : best,
        );
        setLocation({
          ...nearest,
          lat: coordinates.lat,
          lon: coordinates.lon,
          radius: 25,
        });
        setNotice(`Location found. You will now see listings within 25 km of ${nearest.city}.`);
      },
      () => {
        setNotice("No location access. Choose your city manually using the location button.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  };

  const handleCreateProduct = async (newProduct: Omit<Product, "id">) => {
    const created = await api.createProduct(newProduct);
    setProductsList((prev) => [created, ...prev]);
    setSelectedProductId(created.id);
    setNotice("Your listing has been posted successfully!");
    return created;
  };

  const handleDeleteProduct = async (id: number) => {
    await api.deleteProduct(id);
    setProductsList((prev) => prev.filter((p) => p.id !== id));
    setNotice("Listing deleted.");
  };

  const handleUpdateProduct = (updated: Product) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
    setNotice("Listing updated successfully.");
  };

  const handleProductStatusChange = (
    productId: number,
    status: "active" | "reserved" | "sold",
  ) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, adStatus: status } : p)),
    );
    setNotice(
      status === "sold"
        ? "Listing marked as sold."
        : status === "reserved"
          ? "Listing reserved."
          : "Listing is active again.",
    );
  };

  const handleBuyProduct = (productId: number) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, adStatus: "sold" } : p)),
    );
    setNotice("Order placed! Your purchase is protected by Buyer Protection.");
  };

  const handleAddBid = (
    productId: number,
    bid: { id: string; bidderName: string; amount: number; time: string },
  ) => {
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const currentBids = p.bids || [];
        return {
          ...p,
          bids: [bid, ...currentBids],
        };
      }),
    );
  };

  const handleStartChat = async (product: Product, initialMsg?: string) => {
    const conversation = await api.startOrGetConversation(product);
    if (initialMsg) {
      await api.sendMessage(conversation.id, initialMsg, "me");
    }
    const allConvs = await api.getConversations();
    setConversationsList(allConvs);
    setActiveConversationId(conversation.id);
    setPage("chat", { convId: conversation.id });
  };

  const handleSendMessage = async (convId: string, text: string) => {
    await api.sendMessage(convId, text, "me");
    const updated = await api.getConversations();
    setConversationsList(updated);
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProductId(productId);
    setPage("detail", { productId });
  };

  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
    setPage("search", { query });
  };

  const handleHeaderCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
    setPage("search", { category, query: "" });
  };

  const content = useMemo(() => {
    if (page === "search")
      return (
        <SearchPage
          setPage={setPage}
          favorites={favorites}
          toggle={toggle}
          location={location}
          onLocationChange={setLocation}
          initialQuery={searchQuery}
          initialCategory={selectedCategory}
          products={productsList}
          onSelectProduct={handleSelectProduct}
        />
      );
    if (page === "detail")
      return (
        <DetailPage
          setPage={setPage}
          productId={selectedProductId}
          products={productsList}
          favorite={selectedProductId != null && favorites.has(selectedProductId)}
          toggle={() => selectedProductId != null && toggle(selectedProductId)}
          onStartChat={handleStartChat}
          onSelectProduct={handleSelectProduct}
          onBuyProduct={handleBuyProduct}
          onAddBid={handleAddBid}
        />
      );
    if (page === "chat")
      return (
        <ChatPage
          setPage={setPage}
          conversations={conversationsList}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onSendMessage={handleSendMessage}
          onSelectProduct={handleSelectProduct}
        />
      );
    if (page === "sell")
      return (
        <SellPage
          setPage={setPage}
          location={location}
          user={user}
          onCreateProduct={handleCreateProduct}
          onSelectProduct={handleSelectProduct}
        />
      );
    if (page === "my-ads")
      return (
        <MyAdsPage
          setPage={setPage}
          products={productsList}
          onSelectProduct={handleSelectProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateProduct={handleUpdateProduct}
          onStatusChange={handleProductStatusChange}
        />
      );
    if (page === "settings")
      return (
        <SettingsPage
          setPage={setPage}
          user={user}
          onUserChange={setUser}
          location={location}
          onLocationChange={setLocation}
          dark={dark}
          setDark={setDark}
          onLogout={() => {
            setLoggedIn(false);
            window.localStorage.setItem("bidzaar-auth", "false");
            setPage("home");
            setNotice("You have been logged out securely.");
          }}
          onDeleteAccount={() => {
            setLoggedIn(false);
            window.localStorage.removeItem("bidzaar-auth");
            window.localStorage.removeItem("bidzaar-user");
            setPage("home");
            setNotice("Your account and listings have been deleted.");
          }}
        />
      );
    if (page === "login")
      return (
        <LoginPage
          onLogin={() => {
            setLoggedIn(true);
            window.localStorage.setItem("bidzaar-auth", "true");
            setPage("account");
            setNotice("You are logged in again.");
          }}
          setPage={setPage}
        />
      );
    if (page === "register")
      return (
        <RegisterPage
          setPage={setPage}
          onRegister={(newUser) => {
            setUser(newUser);
            setLoggedIn(true);
            window.localStorage.setItem("bidzaar-user", JSON.stringify(newUser));
            window.localStorage.setItem("bidzaar-auth", "true");
            setPage("account");
            setNotice(`Welcome, ${newUser.firstName}! Your account has been created.`);
          }}
        />
      );
    if (page === "account")
      return (
        <AccountPage
          setPage={setPage}
          favorites={favorites}
          toggle={toggle}
          user={user}
          location={location}
          products={productsList}
          onSelectProduct={handleSelectProduct}
        />
      );
    return (
      <HomePage
        setPage={setPage}
        favorites={favorites}
        toggle={toggle}
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onSearch={handleHeaderSearch}
      />
    );
  }, [
    page,
    favorites,
    location,
    user,
    loggedIn,
    productsList,
    conversationsList,
    selectedProductId,
    searchQuery,
    selectedCategory,
    activeConversationId,
  ]);

  return (
    <div className="app">
      {page !== "sell" && (
        <Header
          page={page}
          setPage={setPage}
          dark={dark}
          setDark={setDark}
          loggedIn={loggedIn}
          location={location}
          onLocationChange={setLocation}
          user={user}
          searchQuery={searchQuery}
          onSearch={handleHeaderSearch}
          onCategorySelect={handleHeaderCategorySelect}
          favoritesCount={favorites.size}
          onLogout={() => {
            setLoggedIn(false);
            window.localStorage.setItem("bidzaar-auth", "false");
            setPage("home");
            setNotice("You have been logged out securely.");
          }}
        />
      )}
      <Suspense
        fallback={
          <div className="shell page-loading" style={{ padding: "40px 0", minHeight: "50vh" }}>
            <div
              className="skeleton-image skeleton-shimmer"
              style={{ maxWidth: "800px", margin: "0 auto", height: "180px", borderRadius: "16px" }}
            />
          </div>
        }
      >
        {content}
      </Suspense>
      {page === "home" && <Footer />}
      {page !== "sell" && (
        <MobileNav page={page} setPage={setPage} loggedIn={loggedIn} user={user} />
      )}
      {notice && (
        <div className="action-notice" role="status">
          <span>
            <Icon name="check" />
          </span>
          {notice}
        </div>
      )}
      {showConsent && <CookieConsent onSave={saveConsent} />}
    </div>
  );
}
