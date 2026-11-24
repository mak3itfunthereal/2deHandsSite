import test from "node:test";
import assert from "node:assert/strict";

test("posting ad: creates product with valid fields and defaults", () => {
  const existingProducts = [
    { id: 1, title: "Existing Bike", price: "€ 50", priceAmount: 50, adStatus: "active" },
  ];

  const createAd = (input, list) => {
    const rawPrice = String(input.price || "0");
    const numeric = Number(rawPrice.replace(/[^\d.]/g, "")) || 0;
    const newId = Math.max(0, ...list.map((p) => p.id)) + 1;

    const newProduct = {
      id: newId,
      title: input.title?.trim() || "Second-hand item",
      price: `€ ${numeric}`,
      priceAmount: numeric,
      category: input.category || "General",
      city: input.city || "Amsterdam",
      description: input.description?.trim() || "",
      image: input.image || "https://picsum.photos/400/300.webp",
      images: input.images || [input.image || "https://picsum.photos/400/300.webp"],
      createdAt: "Just now",
      isUserAd: true,
      adStatus: "active",
      bids: [],
    };

    return [newProduct, ...list];
  };

  const updatedList = createAd(
    {
      title: "Vintage Gazelle Fiets",
      price: "120",
      category: "Bikes",
      city: "Utrecht",
      description: "Classic city bike in top condition.",
    },
    existingProducts,
  );

  assert.equal(updatedList.length, 2);
  const created = updatedList[0];
  assert.equal(created.id, 2);
  assert.equal(created.title, "Vintage Gazelle Fiets");
  assert.equal(created.price, "€ 120");
  assert.equal(created.priceAmount, 120);
  assert.equal(created.isUserAd, true);
  assert.equal(created.adStatus, "active");
  assert.equal(created.createdAt, "Just now");
});

test("bidding: places a new bid and updates highest bid tracking", () => {
  let product = {
    id: 1,
    title: "Canon Camera",
    priceAmount: 100,
    bids: [
      { id: "b1", bidderName: "Alice", amount: 80, time: "2 hours ago" },
    ],
  };

  const placeBid = (prod, bidderName, amount) => {
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      throw new Error("Bid amount must be a positive number");
    }
    const currentHighest = prod.bids.length > 0 ? Math.max(...prod.bids.map((b) => b.amount)) : 0;
    if (amount <= currentHighest) {
      throw new Error(`Bid must be higher than the current highest bid of €${currentHighest}`);
    }

    const newBid = {
      id: `bid-${Date.now()}`,
      bidderName,
      amount,
      time: "Just now",
    };

    return {
      ...prod,
      bids: [newBid, ...prod.bids],
    };
  };

  // Higher bid succeeds
  product = placeBid(product, "Bob", 95);
  assert.equal(product.bids.length, 2);
  assert.equal(product.bids[0].bidderName, "Bob");
  assert.equal(product.bids[0].amount, 95);

  const highest = Math.max(...product.bids.map((b) => b.amount));
  assert.equal(highest, 95);

  // Equal or lower bid is rejected
  assert.throws(() => placeBid(product, "Charlie", 90), /higher than/);
  assert.throws(() => placeBid(product, "Charlie", -10), /positive number/);
});

test("buy now: updates ad status to sold and calculates Buyer Protection checkout price", () => {
  let products = [
    {
      id: 10,
      title: "MacBook Air",
      price: "€ 450",
      priceAmount: 450,
      adStatus: "active",
      allowsShipping: true,
    },
  ];

  const calculateCheckout = (itemPrice, shipping = 4.95) => {
    const buyerProtectionCost = 0.99;
    const total = (itemPrice + shipping + buyerProtectionCost).toFixed(2);
    return {
      itemPrice,
      shipping,
      buyerProtectionCost,
      total: Number(total),
    };
  };

  const buyProduct = (list, productId) => {
    const target = list.find((p) => p.id === productId);
    if (!target) throw new Error("Product not found");
    if (target.adStatus === "sold") throw new Error("Product already sold");

    return list.map((p) => (p.id === productId ? { ...p, adStatus: "sold" } : p));
  };

  // Check Buyer Protection price formula
  const checkout = calculateCheckout(450, 4.95);
  assert.equal(checkout.itemPrice, 450);
  assert.equal(checkout.buyerProtectionCost, 0.99);
  assert.equal(checkout.total, 455.94);

  // Execute Buy Now
  products = buyProduct(products, 10);
  assert.equal(products[0].adStatus, "sold");

  // Cannot buy already sold item
  assert.throws(() => buyProduct(products, 10), /already sold/);
});
