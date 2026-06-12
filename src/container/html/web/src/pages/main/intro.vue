<template>
  <div>
    <!-- ── Hero ─────────────────────────────────────────────────── -->
    <section class="w2-intro-hero">
      <header-animation />

      <div class="w2-intro-content">
        <!-- Left: brand + typewriter -->
        <div class="w2-intro-left">
          <div class="w2-intro-badge">
            <span class="w2-intro-badge-dot"></span>
            TypeScript · Node.js · Express
          </div>

          <h1 class="w2-intro-title">chasi<em>.ts</em></h1>

          <p class="w2-intro-tagline">
            Build
            <span class="w2-typed-word">{{ typedWord }}</span><span class="w2-caret">|</span>
            APIs with confidence.
          </p>

          <p class="w2-intro-desc">
            A REST-API framework that turbocharges development,
            secures production, and scales with your ambitions.
          </p>

          <div class="w2-intro-chips">
            <span class="w2-chip">
              <span class="material-symbols-rounded">bolt</span>Fast
            </span>
            <span class="w2-chip">
              <span class="material-symbols-rounded">shield</span>Secure
            </span>
            <span class="w2-chip">
              <span class="material-symbols-rounded">hub</span>Scalable
            </span>
            <span class="w2-chip">
              <span class="material-symbols-rounded">code</span>TypeScript
            </span>
          </div>

          <button class="w2-intro-cta" @click="goInstall">
            <span class="material-symbols-rounded">rocket_launch</span>
            Get Started
          </button>
        </div>

        <!-- Right: floating terminal card -->
        <div class="w2-intro-terminal">
          <div class="w2-terminal-titlebar">
            <span class="w2-tdot td-red"></span>
            <span class="w2-tdot td-yellow"></span>
            <span class="w2-tdot td-green"></span>
            <span class="w2-terminal-filename">{{ termFilename }}</span>
            <span class="w2-terminal-lang">TypeScript</span>
          </div>
          <!-- Line numbers + code -->
          <div class="w2-terminal-body">
            <div class="w2-terminal-lines">
              <span
                v-for="n in lineCount"
                :key="n"
                class="w2-terminal-ln"
              >{{ n }}</span>
            </div>
            <pre class="w2-terminal-code"><code v-html="termHtml"></code><span class="w2-terminal-cursor">▋</span></pre>
          </div>
          <div class="w2-terminal-footer">
            <span class="w2-tf-item">
              <span class="material-symbols-rounded">check_circle</span>0 errors
            </span>
            <span class="w2-tf-item">
              <span class="material-symbols-rounded">warning</span>0 warnings
            </span>
            <span class="w2-tf-spacer"></span>
            <span class="w2-tf-item w2-tf-lang">TS</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Info section ──────────────────────────────────────────── -->
    <div class="content w2-intro-body">
      <hr />
      <p>
        A Rest-API framework that will boost the development, secure the production,
        and ensure the scalability of your project. Chasi is modeled after an
        auto-mobile production, which may start with the chassis, and serves as the
        car's foundation. Routing container allows chasi to manage multiple APIs
        within the same cluster, supplying each their requirements from a centralized
        abstract environment. The framework also provides an option to manage processes
        since Node.js provides great flexibility on managing performance via its Cluster
        API, therefore improving scalability across the project.
      </p>
      <h4>Requirements</h4>
      <ul class="is-size-6">
        <li v-for="req in controlStore.requirements" :key="req.id">
          <hook :id="req.id" /> {{ req.label }} ({{ req.value }})
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import headerAnimation from "./header-animation.vue"
import hook from "@/components/utils/hook.vue"
import { useControlStore } from "@/stores/ControlStore.js"

const controlStore = useControlStore()

// ── Typewriter words ──────────────────────────────────────────────
const WORDS = ["scalable", "secure", "blazing-fast", "production-ready", "elegant"]
const typedWord = ref("")
let wordIdx = 0, charIdx = 0, typing = true, wordTimer = null

function tick() {
  const word = WORDS[wordIdx]
  if (typing) {
    if (charIdx < word.length) {
      typedWord.value = word.slice(0, ++charIdx)
      wordTimer = setTimeout(tick, 75)
    } else {
      typing = false
      wordTimer = setTimeout(tick, 1500)
    }
  } else {
    if (charIdx > 0) {
      typedWord.value = word.slice(0, --charIdx)
      wordTimer = setTimeout(tick, 38)
    } else {
      typing = true
      wordIdx = (wordIdx + 1) % WORDS.length
      wordTimer = setTimeout(tick, 280)
    }
  }
}

// ── Terminal typewriter ───────────────────────────────────────────
const SNIPPETS = [
  {
    file: "app.ts",
    code: `import Chasi from "chasi-ts"\nimport config from "./config.js"\n\nconst app = new Chasi(config)\n\nawait app.boot()`,
  },
  {
    file: "routes.ts",
    code: `// define your routes\nRouter.get("/users", [\n  AuthMiddleware,\n  UserController.index,\n])\n\nRouter.post("/users/:id", [\n  UserController.update,\n])`,
  },
  {
    file: "UserController.ts",
    code: `class UserController extends Controller {\n\n  async index({ request, response }) {\n    const users = await User.all()\n    return response.json({ users })\n  }\n\n}`,
  },
]

const termFilename = ref(SNIPPETS[0].file)
const termHtml = ref("")
let sIdx = 0, tIdx = 0, tPause = false, termTimer = null

function highlight(code) {
  let h = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  h = h.replace(/(\/\/[^\n]*)/g, '<i class="tc-cm">$1</i>')
  h = h.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<i class="tc-st">$1</i>')
  h = h.replace(
    /\b(import|from|export|const|let|var|async|await|new|return|class|extends|if|else)\b/g,
    '<i class="tc-kw">$1</i>'
  )
  h = h.replace(
    /\b(Chasi|Router|Controller|AuthMiddleware|UserController|User|config|app|request|response|users)\b/g,
    '<i class="tc-id">$1</i>'
  )
  return h
}

function termTick() {
  const snippet = SNIPPETS[sIdx]
  if (!tPause) {
    if (tIdx <= snippet.code.length) {
      termHtml.value = highlight(snippet.code.slice(0, tIdx))
      tIdx++
      const c = snippet.code[tIdx - 1]
      const delay = c === '\n' ? 90 : /[.,;[\]{}]/.test(c) ? 70 : 28 + Math.random() * 22
      termTimer = setTimeout(termTick, delay)
    } else {
      tPause = true
      termTimer = setTimeout(termTick, 2000)
    }
  } else {
    tPause = false
    sIdx = (sIdx + 1) % SNIPPETS.length
    termFilename.value = SNIPPETS[sIdx].file
    tIdx = 0
    termHtml.value = ""
    termTimer = setTimeout(termTick, 500)
  }
}

// Count visible lines (newlines in the current code up to tIdx)
const lineCount = computed(() => {
  const snippet = SNIPPETS[sIdx]
  const visible = snippet.code.slice(0, tIdx)
  return Math.max(1, (visible.match(/\n/g) || []).length + 1)
})

function goInstall() {
  controlStore.activate("install")
}

onMounted(() => {
  wordTimer = setTimeout(tick, 600)
  termTimer = setTimeout(termTick, 900)
})

onUnmounted(() => {
  clearTimeout(wordTimer)
  clearTimeout(termTimer)
})
</script>

<style>
/* ── Hero ───────────────────────────────────────────────────────── */
.w2-intro-hero {
  position: relative;
  overflow: hidden;
  min-height: 360px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--w2-border-faint);
  background: var(--w2-bg-surface);
}

/* Subtle vignette so text reads over the canvas */
.w2-intro-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 80% at 30% 50%, transparent 40%, var(--w2-bg-surface) 100%);
  z-index: 1;
  pointer-events: none;
}

.w2-intro-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 40px;
  width: 100%;
  padding: 40px 40px 38px;
}

/* ── Left ───────────────────────────────────────────────────────── */
.w2-intro-left { flex: 1; min-width: 0; }

.w2-intro-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--w2-accent);
  background: var(--w2-accent-dim);
  border: 1px solid var(--w2-border);
  border-radius: 20px;
  padding: 3px 12px 3px 7px;
  margin-bottom: 16px;
}
.w2-intro-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--w2-accent);
  animation: w2-pulse 2s ease-in-out infinite;
}

.w2-intro-title {
  font-size: clamp(2.4rem, 5vw, 3.4rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1;
  color: var(--w2-text);
  margin: 0 0 16px;
  font-family: var(--font-sans);
}
.w2-intro-title em {
  font-style: normal;
  color: var(--w2-accent);
}

.w2-intro-tagline {
  font-size: 1.05rem;
  color: var(--w2-text-muted);
  margin: 0 0 10px;
  min-height: 1.65em;
}
.w2-typed-word {
  color: var(--w2-accent);
  font-weight: 700;
  font-style: italic;
}
.w2-caret {
  color: var(--w2-accent);
  animation: w2-blink 1s step-end infinite;
  margin-left: 1px;
}
@keyframes w2-blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }

.w2-intro-desc {
  font-size: 0.875rem;
  color: var(--w2-text-faint);
  line-height: 1.75;
  max-width: 380px;
  margin: 0 0 20px;
}

.w2-intro-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.w2-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  background: var(--w2-bg-card);
  border: 1px solid var(--w2-border);
  color: var(--w2-text-muted);
  font-family: var(--font-sans);
}
.w2-chip .material-symbols-rounded { font-size: 13px !important; color: var(--w2-accent); }

.w2-intro-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 18px;
  border-radius: 6px;
  border: none;
  background: var(--w2-accent);
  color: #000;
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: filter 0.15s, transform 0.1s;
}
.w2-intro-cta:hover { filter: brightness(1.1); transform: translateY(-1px); }
.w2-intro-cta .material-symbols-rounded { font-size: 16px !important; }

/* ── Terminal card ──────────────────────────────────────────────── */
.w2-intro-terminal {
  flex-shrink: 0;
  width: 380px;
  background: #0D1117;
  border-radius: 10px;
  border: 1px solid #30363d;
  box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);
  overflow: hidden;
  font-family: var(--font-mono);
}

.w2-terminal-titlebar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}
.w2-tdot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.td-red    { background: #ff5f57; }
.td-yellow { background: #febc2e; }
.td-green  { background: #28c840; }
.w2-terminal-filename {
  margin-left: 8px;
  font-size: 11.5px;
  color: #8b949e;
  flex: 1;
}
.w2-terminal-lang {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #3b82f6;
  background: rgba(59,130,246,0.1);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 3px;
  padding: 1px 6px;
}

.w2-terminal-body {
  display: flex;
  min-height: 180px;
  max-height: 220px;
}
.w2-terminal-lines {
  display: flex;
  flex-direction: column;
  padding: 14px 0 14px 14px;
  min-width: 36px;
  color: #3d444d;
  font-size: 12px;
  line-height: 1.7;
  text-align: right;
  user-select: none;
  border-right: 1px solid #21262d;
  margin-right: 0;
}
.w2-terminal-ln { display: block; padding-right: 8px; }

.w2-terminal-code {
  flex: 1;
  padding: 14px 18px 18px 14px;
  margin: 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: #e6edf3;
  background: transparent;
  white-space: pre;
  overflow: hidden;
  font-family: var(--font-mono);
}
.w2-terminal-cursor {
  display: inline-block;
  color: #F59E0B;
  animation: w2-blink 0.9s step-end infinite;
  vertical-align: text-bottom;
}

/* Syntax token colors — always dark terminal, fixed palette */
.tc-kw { color: #ff7b72; font-style: normal; }
.tc-st { color: #a5d6ff; font-style: normal; }
.tc-cm { color: #6e7681; font-style: normal; }
.tc-id { color: #d2a8ff; font-style: normal; }

.w2-terminal-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 5px 14px;
  background: #1f2428;
  border-top: 1px solid #30363d;
  font-size: 10.5px;
  color: #6e7681;
}
.w2-tf-item {
  display: flex; align-items: center; gap: 3px;
}
.w2-tf-item .material-symbols-rounded { font-size: 11px !important; }
.w2-tf-spacer { flex: 1; }
.w2-tf-lang {
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: #3b82f6;
}

/* ── Info section ───────────────────────────────────────────────── */
.w2-intro-body { padding: 24px 40px 20px !important; }
.w2-intro-body hr { border-color: var(--w2-border-faint) !important; margin-bottom: 18px !important; }
.w2-intro-body h4 { color: var(--w2-text) !important; font-size: 1rem !important; font-weight: 600 !important; margin: 20px 0 10px !important; }
.w2-intro-body ul { padding-left: 22px !important; }
.w2-intro-body li { color: var(--w2-text-muted) !important; font-size: 0.88rem !important; margin-bottom: 5px !important; }
.w2-intro-body p  { color: var(--w2-text-muted) !important; font-size: 0.88rem !important; line-height: 1.8 !important; }

/* Responsive: stack on narrow viewports */
@media (max-width: 860px) {
  .w2-intro-content { flex-direction: column; padding: 30px 24px; }
  .w2-intro-terminal { width: 100%; max-width: 420px; }
  .w2-intro-hero::after { display: none; }
}
</style>
