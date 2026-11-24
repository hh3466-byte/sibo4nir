"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  "/img/hero.jpg",
  "/img/e1.jpg",
  "/img/e2.jpg",
  "/img/e3.jpg",
  "/img/e4.jpg",
  "/img/e5.jpg",
  "/img/e6.jpg",
  "/img/e7.jpg",
  "/img/e8.jpg",
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero">
      <div className="hero-slides" aria-hidden="true">
        {SLIDES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`hero-slide ${i === index ? "is-active" : ""}`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-inner">
        <p className="overline">TAKE ME OUT</p>
        <h1>בואו נגלה את הקיקלדים.</h1>
        <p className="sub">
          מפרצים נסתרים שמגיעים אליהם רק מהים, מים בצבע שלא תאמינו, ולילות על קו המים. ספרו לנו מה אתם אוהבים — ונבנה לכם קיץ בלתי-נשכח.
        </p>
      </div>
    </section>
  );
}
