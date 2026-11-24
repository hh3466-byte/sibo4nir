import HeroCarousel from "@/components/HeroCarousel";
import MapSection from "@/components/MapSection";
import { getGeoData } from "@/lib/geo";

const TYPE_LABEL: Record<string, string> = {
  base: "מרינת יציאה",
  swim: "מפרץ לשחייה",
  snorkel: "שנירקול",
  anchor: "עוגן וצילום",
  lunch: "צהריים על המים",
  overnight: "לינה על קו המים",
};

export default async function Home() {
  const { places, tavernas, hotels, route, stopsInOrder, waterPath } = await getGeoData();
  const tavernaByPlace = new Map<string, typeof tavernas>();
  for (const t of tavernas) {
    const list = tavernaByPlace.get(t.placeId) ?? [];
    list.push(t);
    tavernaByPlace.set(t.placeId, list);
  }
  const hotelByPlace = new Map<string, typeof hotels>();
  for (const h of hotels) {
    const list = hotelByPlace.get(h.placeId) ?? [];
    list.push(h);
    hotelByPlace.set(h.placeId, list);
  }

  // הצגת עצירות ייחודיות לפי סדר המסלול (ללא כפילות של מרינת החזרה בסוף)
  const uniqueStops = stopsInOrder.slice(0, -1);

  return (
    <main>
      <HeroCarousel />

      <section className="section">
        <div className="section-head">
          <p className="overline">המסע שלכם · {route.days} ימים</p>
          <h2>{route.name}</h2>
          <p>
            בוקר של צלילה במים טורקיז, עוגן בלגונה שאין אליה כביש, צהריים בטברנה על הרציף עם דגים שעלו הבוקר. דילוג מאי לאי, בקצב שלכם.
          </p>
        </div>
        <MapSection
          places={places}
          stops={stopsInOrder}
          tavernas={tavernas}
          hotels={hotels}
          waterPath={waterPath}
          routeName={route.name}
        />
        <p className="section-head social-proof">{route.socialProof}</p>
      </section>

      <section className="section section-cream">
        <div className="section-head">
          <p className="overline">לאורך הדרך</p>
          <h2>מפרצים חבויים, ארוחות צהריים בגן עדן.</h2>
          <p>
            כל עצירה במסלול נבחרה מתוך היכרות עם הים — מים צלולים, טברנות אמיתיות על הרציף ולינות שקטות מול הסירה.
          </p>
        </div>

        <div className="stops-grid">
          {uniqueStops.map((p) => {
            const pTavernas = tavernaByPlace.get(p.id) ?? [];
            const pHotels = hotelByPlace.get(p.id) ?? [];
            return (
              <article key={p.id} className="stop-card">
                <div className="stop-media">
                  <img src={p.photoUrl} alt={p.name} loading="lazy" />
                  <span className="stop-tag">{TYPE_LABEL[p.type] ?? p.type}</span>
                </div>
                <div className="stop-body">
                  <p className="overline">{p.islandName}</p>
                  <h3>{p.name}</h3>
                  <p className="stop-desc">{p.desc}</p>
                  {p.photoAttribution && <p className="photo-attr">{p.photoAttribution}</p>}

                  {pTavernas.length > 0 && (
                    <div className="sub-list">
                      <p className="sub-title">טברנות על הרציף</p>
                      <div className="mini-grid">
                        {pTavernas.map((t) => (
                          <div key={t.id} className="mini-card">
                            <img src={t.photoUrl} alt={t.name} loading="lazy" />
                            <div>
                              <strong>{t.name}</strong>
                              <span>{t.note}</span>
                              {t.photoAttribution && <small>{t.photoAttribution}</small>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pHotels.length > 0 && (
                    <div className="sub-list">
                      <p className="sub-title">לינה בקרבת המזח</p>
                      <div className="mini-grid">
                        {pHotels.map((h) => (
                          <div key={h.id} className="mini-card">
                            <img src={h.photoUrl} alt={h.name} loading="lazy" />
                            <div>
                              <strong>{h.name}</strong>
                              <span>מ-€{Math.round(h.priceEurCents / 100)} ללילה</span>
                              {h.photoAttribution && <small>{h.photoAttribution}</small>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="closing">פחות מסכים, יותר מלח על העור. זה הקיץ שתזכרו.</section>
    </main>
  );
}
