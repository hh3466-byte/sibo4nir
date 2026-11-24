import MapSection from "@/components/MapSection";
import { getGeoData } from "@/lib/geo";

export const revalidate = 60;

export default async function Home() {
  const { places, route, stopsInOrder, waterPath } = await getGeoData();
  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <p className="overline">TAKE ME OUT</p>
          <h1>בואו נגלה את הקיקלדים.</h1>
          <p className="sub">
            מפרצים נסתרים שמגיעים אליהם רק מהים, מים בצבע שלא תאמינו, ולילות על קו המים. ספרו לנו מה אתם אוהבים — ונבנה לכם קיץ בלתי-נשכח.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="overline">המסע שלכם</p>
          <h2>{route.name}</h2>
          <p>
            בוקר של צלילה במים טורקיז, עוגן בלגונה שאין אליה כביש, צהריים בטברנה על הרציף עם דגים שעלו הבוקר. דילוג מאי לאי, בקצב שלכם.
          </p>
        </div>
        <MapSection places={places} stops={stopsInOrder} waterPath={waterPath} routeName={route.name} />
        <p className="section-head" style={{ marginTop: "1.5rem", opacity: 0.8 }}>{route.socialProof}</p>
      </section>

      <section className="closing">פחות מסכים, יותר מלח על העור. זה הקיץ שתזכרו.</section>
    </main>
  );
}

