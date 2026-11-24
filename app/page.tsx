import HeroCarousel from "@/components/HeroCarousel";
import MapSection from "@/components/MapSection";
import CaptainSpiros from "@/components/CaptainSpiros";
import { getGeoData } from "@/lib/geo";

export default async function Home() {
  const { places, tavernas, hotels, route, stopsInOrder, waterPath } = await getGeoData();

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

      <section className="closing">פחות מסכים, יותר מלח על העור. זה הקיץ שתזכרו.</section>

      {/* קפטן ספירוס וגברת ספירוס — קונסיירז' צף שנוכח לאורך כל השיחה */}
      <CaptainSpiros places={places} tavernas={tavernas} hotels={hotels} />
    </main>
  );
}
