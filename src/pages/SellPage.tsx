import { useState } from "react";
import type { LocationPreference, Page, Product, UserProfile } from "../types";
import { categories, IMG } from "../utils/marketplace";
import { Icon, Logo } from "../components/ui";

export default function SellPage({
  setPage,
  location,
  user,
  onCreateProduct,
  onSelectProduct,
}: {
  setPage: (p: Page) => void;
  location?: LocationPreference;
  user?: UserProfile;
  onCreateProduct?: (product: Omit<Product, "id">) => Promise<Product>;
  onSelectProduct?: (productId: number) => void;
}) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  // Form states
  const [title, setTitle] = useState("Product 1");
  const [category, setCategory] = useState("Categorie 1");
  const [description, setDescription] = useState(
    "Beschrijving van product via API.",
  );
  const [condition, setCondition] = useState("Zo goed als nieuw");
  const [price, setPrice] = useState("100");
  const [allowBidding, setAllowBidding] = useState(true);
  const [allowShipping, setAllowShipping] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(IMG.bike);

  const city = location?.city || "Plaats 1";

  const titles = [
    "Foto’s toevoegen",
    "Vertel over je artikel",
    "Kies je prijs",
    "Bezorgen of ophalen",
    "Controleer je advertentie",
  ];

  const handleFinish = async () => {
    setSubmitting(true);
    const newProductData: Omit<Product, "id"> = {
      title: title.trim() || "Tweedehands artikel",
      price: `€ ${price.trim()}`,
      priceAmount: Number(price.replace(/[^\d]/g, "")) || 0,
      city: city,
      distance: "0 km",
      state: condition,
      category: category,
      image: photoUrl,
      images: [photoUrl],
      description: description.trim(),
      lat: location?.lat || 52.0907,
      lon: location?.lon || 5.1214,
      sellerName: user ? `${user.firstName} ${user.lastName}` : "Jij",
      sellerInitials: user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "IK",
      sellerVerified: true,
      createdAt: "Zojuist",
      isUserAd: true,
    };

    if (onCreateProduct) {
      try {
        const prod = await onCreateProduct(newProductData);
        setCreatedProduct(prod);
      } catch (err) {
        console.error("Fout bij opslaan advertentie:", err);
      }
    }
    setSubmitting(false);
    setDone(true);
  };

  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPhotoUrl(url);
      }
    };
    input.click();
  };

  if (done) {
    const displayProduct = createdProduct || {
      title,
      price: `€ ${price}`,
      image: photoUrl,
      id: 1,
    };

    return (
      <main className="sell-success shell">
        <span className="success-icon">
          <Icon name="check" size={48} />
        </span>
        <span className="eyebrow">Gelukt</span>
        <h1>Je advertentie staat online!</h1>
        <p>Je {displayProduct.title} is nu zichtbaar voor duizenden kopers.</p>

        <div className="success-card">
          <img src={displayProduct.image} alt={displayProduct.title} />
          <div>
            <b>{displayProduct.title}</b>
            <span>{displayProduct.price}</span>
          </div>
        </div>

        <button
          className="primary"
          onClick={() => {
            if (createdProduct && onSelectProduct) {
              onSelectProduct(createdProduct.id);
            }
            setPage("detail");
          }}
        >
          Bekijk je advertentie
        </button>

        <button className="secondary" onClick={() => setPage("my-ads")}>
          Naar mijn advertenties
        </button>

        <button
          className="secondary"
          onClick={() => {
            setDone(false);
            setStep(1);
          }}
        >
          Nog iets verkopen
        </button>
      </main>
    );
  }

  return (
    <main className="sell-flow">
      <div className="sell-top shell">
        <button onClick={() => setPage("home")}>‹ Stoppen</button>
        <Logo onClick={() => setPage("home")} />
        <button onClick={() => setPage("my-ads")}>Concepten</button>
      </div>

      <div className="progress">
        <i style={{ width: `${step * 20}%` }} />
      </div>

      <div className="sell-shell">
        <div className="step-label">Stap {step} van 5</div>
        <h1>{titles[step - 1]}</h1>

        {step === 1 && (
          <>
            <p className="lead">Goede foto's verkopen sneller. Voeg maximaal 20 foto's toe.</p>
            <div className="upload-zone" onClick={handlePhotoUpload} style={{ cursor: "pointer" }}>
              <span>
                <Icon name="camera" size={32} />
              </span>
              <h3>Klik of sleep foto’s hierheen</h3>
              <p>JPG, PNG of HEIC · maximaal 10 MB</p>
              <button
                className="secondary"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhotoUpload();
                }}
              >
                Kies foto
              </button>
            </div>
            <div className="photo-preview">
              <div>
                <img src={photoUrl} alt="Hoofdfoto" />
                <span>Hoofdfoto</span>
              </div>
              <button type="button" onClick={handlePhotoUpload}>
                <Icon name="plus" />
                Andere foto
              </button>
            </div>
            <div className="tip">
              <b>Fototip</b>
              <p>Gebruik daglicht en fotografeer je artikel van meerdere kanten.</p>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="form-stack">
            <label>
              Titel
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bijv. Product 1"
              />
              <small>{title.length} / 60 tekens</small>
            </label>

            <label>
              Categorie
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Beschrijving
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschrijf eventuele beschadigingen, specificaties of bijzonderheden..."
              />
            </label>

            <div className="form-grid">
              <label>
                Staat
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}
                >
                  <option value="Zo goed als nieuw">Zo goed als nieuw</option>
                  <option value="Nieuw">Nieuw</option>
                  <option value="Goed">Goed</option>
                  <option value="Gebruikt">Gebruikt</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-stack">
            <label>
              Vraagprijs
              <div className="big-price-input">
                <span>€</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </label>
            <div className="advice">
              <span>Prijsadvies</span>
              <b>€ {Math.max(10, Number(price) - 30)} – € {Number(price) + 40}</b>
              <p>Gebaseerd op vergelijkbare verkopen in {category}.</p>
            </div>
            <label className="check card-check">
              <input
                type="checkbox"
                checked={allowBidding}
                onChange={(e) => setAllowBidding(e.target.checked)}
              />
              <span>
                <b>Bieden toestaan</b>
                <small>Kopers kunnen je een bod sturen</small>
              </span>
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="form-stack">
            <label className="check card-check">
              <input type="checkbox" checked disabled />
              <span>
                <b>Ophalen in {city}</b>
                <small>Je exacte adres blijft privé tot verkoop</small>
              </span>
            </label>
            <label className="check card-check">
              <input
                type="checkbox"
                checked={allowShipping}
                onChange={(e) => setAllowShipping(e.target.checked)}
              />
              <span>
                <b>Verzenden mogelijk</b>
                <small>Vanaf € 6,95 met Kopersbescherming via PostNL / DHL</small>
              </span>
            </label>
            <div className="mini-map">
              <Icon name="pin" size={28} />
              <span>Locatie: {city}</span>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="review-ad">
            <img src={photoUrl} alt="" />
            <div>
              <span className="condition">{condition}</span>
              <h2>{title}</h2>
              <strong>€ {price}</strong>
              <p>
                Ophalen in {city} {allowShipping ? "· Verzenden mogelijk" : ""} ·{" "}
                {allowBidding ? "Bieden toegestaan" : "Vaste prijs"}
              </p>
            </div>
            <button className="secondary" type="button" onClick={() => setStep(2)}>
              Bewerk
            </button>
          </div>
        )}

        <div className="sell-controls">
          <button
            className="secondary"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            type="button"
          >
            Vorige
          </button>
          <button
            className="primary"
            onClick={() => {
              if (step === 5) {
                void handleFinish();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={submitting}
            type="button"
          >
            {submitting ? "Plaatsen..." : step === 5 ? "Plaats advertentie" : "Volgende stap"}{" "}
            <Icon name="chevron" />
          </button>
        </div>
      </div>
    </main>
  );
}
