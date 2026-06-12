<template>
  <Transition name="w2-about">
    <div v-if="open" class="w2-about-overlay" @click.self="$emit('close')">
      <div class="w2-about-card">

        <!-- Close -->
        <button class="w2-about-close" @click="$emit('close')">
          <span class="material-symbols-rounded">close</span>
        </button>

        <!-- Avatar -->
        <div class="w2-about-avatar-wrap">
          <div class="w2-about-avatar-ring">
            <img class="w2-about-avatar" src="/src/assets/default.png" alt="Profile" />
          </div>
        </div>

        <!-- Identity -->
        <div class="w2-about-identity">
          <span class="w2-about-name">Nikko Mesina</span>
          <a class="w2-about-email" href="mailto:buzzrocketbean@gmail.com">
            buzzrocketbean@gmail.com
          </a>
        </div>

        <!-- Divider -->
        <div class="w2-about-divider"></div>

        <!-- Social links -->
        <div class="w2-about-links">
          <a
            class="w2-about-link w2-about-link--npm"
            href="https://www.npmjs.com/package/@rocketbean/create-chasi-ts"
            target="_blank"
            rel="noreferrer"
            title="npm"
          >
            <img src="/src/assets/npm.svg" alt="npm" class="w2-about-icon" />
            <span class="w2-about-link-label">npm</span>
          </a>
          <a
            class="w2-about-link w2-about-link--gh"
            href="https://github.com/rocketbean/chasi-ts"
            target="_blank"
            rel="noreferrer"
            title="GitHub"
          >
            <img src="/src/assets/square-github.svg" alt="GitHub" class="w2-about-icon" />
            <span class="w2-about-link-label">GitHub</span>
          </a>
          <a
            class="w2-about-link w2-about-link--li"
            href="https://www.linkedin.com/in/nikko-mesina-017403132/"
            target="_blank"
            rel="noreferrer"
            title="LinkedIn"
          >
            <img src="/src/assets/linkedin.svg" alt="LinkedIn" class="w2-about-icon" />
            <span class="w2-about-link-label">LinkedIn</span>
          </a>
        </div>

        <!-- Footer -->
        <div class="w2-about-footer">
          <span class="material-symbols-rounded w2-about-heart">favorite</span>
          <span>Built with chasi<em>.ts</em></span>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({ open: Boolean })
defineEmits(['close'])
</script>

<style>
/* ── Overlay ─────────────────────────────────────────────────────── */
.w2-about-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--w2-modal-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* ── Card ────────────────────────────────────────────────────────── */
.w2-about-card {
  position: relative;
  width: 320px;
  background: var(--w2-bg-surface);
  border: 1px solid var(--w2-border);
  border-radius: 16px;
  box-shadow: var(--w2-shadow), 0 0 0 1px rgba(255,255,255,0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 28px;
}

/* Accent top stripe */
.w2-about-card::before {
  content: '';
  display: block;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--w2-accent), var(--w2-cyan) 60%, transparent);
  flex-shrink: 0;
}

/* ── Close ───────────────────────────────────────────────────────── */
.w2-about-close {
  position: absolute;
  top: 12px; right: 12px;
  width: 28px; height: 28px;
  border: none;
  border-radius: 6px;
  background: var(--w2-bg-card);
  color: var(--w2-text-faint);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  z-index: 1;
}
.w2-about-close:hover { background: var(--w2-bg-hover); color: var(--w2-text); }
.w2-about-close .material-symbols-rounded { font-size: 17px !important; }

/* ── Avatar ──────────────────────────────────────────────────────── */
.w2-about-avatar-wrap {
  margin-top: 28px;
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--w2-accent), var(--w2-cyan));
  box-shadow: 0 0 20px var(--w2-accent-dim), 0 0 40px var(--w2-accent-dim);
}
.w2-about-avatar-ring {
  border-radius: 50%;
  padding: 3px;
  background: var(--w2-bg-surface);
}
.w2-about-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: block;
  object-fit: cover;
}

/* ── Identity ────────────────────────────────────────────────────── */
.w2-about-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-top: 16px;
}
.w2-about-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--w2-text);
  letter-spacing: -0.01em;
}
.w2-about-email {
  font-size: 12px;
  color: var(--w2-text-faint);
  font-family: var(--font-mono);
  text-decoration: none;
  transition: color 0.15s;
}
.w2-about-email:hover { color: var(--w2-accent); }

/* ── Divider ─────────────────────────────────────────────────────── */
.w2-about-divider {
  width: calc(100% - 48px);
  height: 1px;
  background: var(--w2-border-faint);
  margin: 22px 0 20px;
}

/* ── Social links ────────────────────────────────────────────────── */
.w2-about-links { display: flex; gap: 12px; }

.w2-about-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--w2-border);
  background: var(--w2-bg-card);
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s;
}
.w2-about-link:hover { transform: translateY(-2px); }

.w2-about-link--npm:hover { border-color: #CB3837; background: rgba(203,56,55,0.08); box-shadow: 0 4px 12px rgba(203,56,55,0.2); }
.w2-about-link--gh:hover  { border-color: #8b949e; background: rgba(139,148,158,0.08); box-shadow: 0 4px 12px rgba(139,148,158,0.15); }
.w2-about-link--li:hover  { border-color: #0A66C2; background: rgba(10,102,194,0.08); box-shadow: 0 4px 12px rgba(10,102,194,0.2); }

.w2-about-icon {
  width: 32px; height: 32px;
  object-fit: contain;
  filter: brightness(0) invert(0.75);
  transition: filter 0.15s;
}
.w2-about-link--npm:hover .w2-about-icon { filter: brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(310deg); }
.w2-about-link--gh:hover  .w2-about-icon { filter: brightness(0) invert(0.9); }
.w2-about-link--li:hover  .w2-about-icon { filter: brightness(0) invert(0.4) sepia(1) saturate(5) hue-rotate(180deg); }

.w2-about-link-label {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--w2-text-faint);
  font-family: var(--font-sans);
  transition: color 0.15s;
}
.w2-about-link:hover .w2-about-link-label { color: var(--w2-text-muted); }

/* ── Footer ──────────────────────────────────────────────────────── */
.w2-about-footer {
  display: flex; align-items: center; gap: 5px;
  margin-top: 20px;
  font-size: 11.5px;
  color: var(--w2-text-faint);
  font-family: var(--font-sans);
}
.w2-about-footer em { font-style: normal; color: var(--w2-accent); }
.w2-about-heart {
  font-size: 13px !important;
  color: var(--w2-red);
  animation: w2-pulse 2s ease-in-out infinite;
}

/* ── Transition ──────────────────────────────────────────────────── */
.w2-about-enter-active { transition: opacity 0.2s ease; }
.w2-about-leave-active { transition: opacity 0.15s ease; }
.w2-about-enter-from,
.w2-about-leave-to    { opacity: 0; }
.w2-about-enter-from .w2-about-card { transform: scale(0.94) translateY(8px); }
.w2-about-leave-to   .w2-about-card { transform: scale(0.96); }
</style>
