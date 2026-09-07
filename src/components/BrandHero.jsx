import React from 'react';
import Logo from './common/Logo';

export default function BrandHero() {
  return (
    <section className="brand-hero">
      <div className="brand-identity">
        <Logo />
        <div className="brand-slogan">НОВОСТИ　•　МНЕНИЯ　•　ГЛАВНОЕ</div>
      </div>
      <div className="brand-description">
        Контур —<br />это взгляд на мир<br />через призму<br />главного.
      </div>
    </section>
  );
}