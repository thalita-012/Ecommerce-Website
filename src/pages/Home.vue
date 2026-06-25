<template>
  <main class="home-page">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Fresh from the field</p>
        <h1>Spicy vegetable shopping for people who love bold flavor.</h1>
        <p class="lead">
          Crisp greens, bright roots, and heat-packed produce curated like a premium market.
          Build your basket, mix your favorites, and get farm-fresh energy in every order.
        </p>

        <div class="hero-actions">
          <router-link to="/products" class="btn-primary">Shop Vegetables</router-link>
          <router-link to="/cart" class="btn-secondary">View Cart</router-link>
        </div>

        <div class="hero-stats">
          <div>
            <strong>100%</strong>
            <span>Fresh picks</span>
          </div>
          <div>
            <strong>24h</strong>
            <span>Fast packing</span>
          </div>
          <div>
            <strong>Hot</strong>
            <span>Flavor-forward</span>
          </div>
        </div>
      </div>

      <div class="hero-card">
        <div class="card-glow"></div>
        <div class="produce-badge">Chef's spicy selection</div>
        <h2>Today's basket</h2>
        <ul>
          <li>Fire-roasted peppers</li>
          <li>Crunchy lettuce mix</li>
          <li>Sweet carrots and beets</li>
          <li>Herb bundles for finishing</li>
        </ul>
        <div class="price-row">
          <span>Starting from</span>
          <strong>$14.90</strong>
        </div>
      </div>
    </section>

    <section class="feature-grid">
      <article>
        <span>01</span>
        <h3>Farm-fresh variety</h3>
        <p>Seasonal vegetables that feel curated, not crowded.</p>
      </article>
      <article>
        <span>02</span>
        <h3>Built for flavor</h3>
        <p>Spicy, savory, and vibrant picks for everyday meals.</p>
      </article>
      <article>
        <span>03</span>
        <h3>Simple shopping</h3>
        <p>Quick add-to-cart flow with a clean, market-style experience.</p>
      </article>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100%;
  padding: 48px 24px 72px;
  background:
    radial-gradient(circle at top left, rgba(255, 116, 0, 0.16), transparent 28%),
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.14), transparent 26%),
    linear-gradient(180deg, #fff9f2 0%, #f6fff4 100%);
}

.hero {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 28px;
  align-items: center;
}

.hero-copy h1 {
  margin: 10px 0 18px;
  font-size: clamp(2.6rem, 6vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
  color: #17301c;
  max-width: 11ch;
}

.eyebrow {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(242, 92, 5, 0.12);
  color: #c2410c;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.lead {
  max-width: 58ch;
  font-size: 1.1rem;
  line-height: 1.75;
  color: #47624b;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  text-decoration: none;
  padding: 14px 20px;
  border-radius: 14px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
  box-shadow: 0 18px 40px rgba(249, 115, 22, 0.28);
}

.btn-secondary {
  color: #17301c;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(23, 48, 28, 0.12);
}

.hero-actions a:hover {
  transform: translateY(-2px);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 30px;
}

.hero-stats div,
.hero-card,
.feature-grid article {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(23, 48, 28, 0.08);
  box-shadow: 0 20px 60px rgba(24, 48, 28, 0.08);
}

.hero-stats div {
  padding: 16px;
  border-radius: 18px;
}

.hero-stats strong {
  display: block;
  color: #17301c;
  font-size: 1.2rem;
}

.hero-stats span {
  color: #58705c;
  font-size: 0.92rem;
}

.hero-card {
  position: relative;
  overflow: hidden;
  padding: 28px;
  border-radius: 28px;
  min-height: 420px;
  color: #17301c;
}

.card-glow {
  position: absolute;
  inset: auto -40px -60px auto;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.3), transparent 70%);
}

.produce-badge {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
  font-weight: 700;
}

.hero-card h2 {
  margin-top: 20px;
  font-size: 2rem;
}

.hero-card ul {
  padding-left: 18px;
  line-height: 1.9;
  color: #4a6450;
}

.price-row {
  margin-top: 26px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid rgba(23, 48, 28, 0.1);
}

.price-row strong {
  font-size: 2rem;
  color: #ef4444;
}

.feature-grid {
  max-width: 1180px;
  margin: 28px auto 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.feature-grid article {
  border-radius: 24px;
  padding: 22px;
}

.feature-grid span {
  color: #f97316;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.feature-grid h3 {
  margin: 12px 0 8px;
  color: #17301c;
}

.feature-grid p {
  color: #58705c;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .hero,
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy h1 {
    max-width: none;
  }
}
</style>
