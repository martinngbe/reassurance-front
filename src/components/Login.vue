<script setup lang="ts">
import type { LoginPayload } from '@/auth'
import { computed, reactive, ref } from 'vue'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Theme = 'light' | 'dark'

interface SocialProvider {
  name: string
  icon: string
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface Props {
  /** Thème du template. Pose la classe `dark` (stratégie class de Tailwind). */
  theme?: Theme
  /**
   * Couleur d'accent issue de la palette du template.
   * Injectée via des variables CSS (--accent, --accent-hover, --accent-soft,
   * --accent-ring) consommées par les classes arbitraires Tailwind
   * (bg-[var(--accent)], text-[var(--accent-hover)]…).
   * Aucune classe Tailwind n'est générée dynamiquement : purge-safe.
   */
  accentColor?: string
  title?: string
  subtitle?: string
  loading?: boolean
  serverError?: string
  socialProviders?: SocialProvider[]
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'dark',
  accentColor: '#6C5CE7',
  title: 'Bon retour !',
  subtitle: 'Connectez-vous pour accéder à votre espace.',
  loading: false,
  serverError: '',
  socialProviders: () => [
    {
      name: 'Google',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.57-5.15 3.57-8.81Z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.39-2.29v-3.1H1.29a12 12 0 0 0 0 10.78l4-3.1Z"/><path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.61l4 3.1C6.23 6.87 8.88 4.76 12 4.76Z"/></svg>',
    },
    {
      name: 'GitHub',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.38.82 1.11.82 2.24v3.32c0 .32.21.7.82.58A12 12 0 0 0 12 .3Z"/></svg>',
    },
  ],
})

const emit = defineEmits<{
  (e: 'submit', payload: LoginPayload): void
  (e: 'social-login', provider: string): void
  (e: 'forgot-password'): void
  (e: 'register'): void
}>()

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

const labels = {
  email: 'Adresse e-mail',
  password: 'Mot de passe',
  remember: 'Se souvenir de moi',
  forgot: 'Mot de passe oublié ?',
  submit: 'Se connecter',
  submitting: 'Connexion…',
  or: 'ou continuer avec',
  noAccount: 'Pas encore de compte ?',
  register: 'Créer un compte',
}

const placeholders = {
  email: 'vous@exemple.com',
  password: '••••••••',
}

/* ------------------------------------------------------------------ */
/* État + validation                                                   */
/* ------------------------------------------------------------------ */

const form = reactive({ email: '', password: '', remember: false })
const errors = reactive({ email: '', password: '' })
const showPassword = ref(false)

function validateEmail(): boolean {
  if (!form.email) {
    errors.email = 'L’adresse e-mail est requise.'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Adresse e-mail invalide.'
    return false
  }
  errors.email = ''
  return true
}

function validatePassword(): boolean {
  if (!form.password) {
    errors.password = 'Le mot de passe est requis.'
    return false
  }
  if (form.password.length < 8) {
    errors.password = '8 caractères minimum.'
    return false
  }
  errors.password = ''
  return true
}

function handleSubmit(): void {
  const ok = [validateEmail(), validatePassword()].every(Boolean)
  if (!ok || props.loading) return
  emit('submit', { ...form })
}

/* ------------------------------------------------------------------ */
/* Couleurs dynamiques (palette du template)                           */
/* ------------------------------------------------------------------ */

/** Assombrit ou éclaircit une couleur hex (pour hover, focus, fonds). */
function shift(hex: string, amount: number): string {
  const n = hex.replace('#', '')
  const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n
  const num = parseInt(full, 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((num >> 16) + amount)
  const g = clamp(((num >> 8) & 0xff) + amount)
  const b = clamp((num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const accentVars = computed(() => ({
  '--accent': props.accentColor,
  '--accent-hover': shift(props.accentColor, -18),
  '--accent-soft': shift(props.accentColor, 140),
  '--accent-ring': `${props.accentColor}33`,
}))
</script>


<template>
  <div
    class="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100"
    :class="{ dark: theme === 'dark' }"
    :style="accentVars"
  >
    <div
      class="w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-black/5 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
    >
      <!-- Logo / Titre -->
      <header class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold"
          :style="{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }"
        >
          <slot name="logo">T</slot>
        </div>
        <h1 class="text-2xl font-bold">{{ title }}</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
      </header>

      <!-- Formulaire -->
      <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
        <!-- Email -->
        <div class="flex flex-col gap-1.5">
          <label for="login-email" class="text-sm font-semibold">{{ labels.email }}</label>
          <div class="relative flex items-center">
            <span class="pointer-events-none absolute left-3 h-[18px] w-[18px] text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-full w-full">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 6 10-6" />
              </svg>
            </span>
            <input
              id="login-email"
              v-model.trim="form.email"
              type="email"
              :placeholder="placeholders.email"
              autocomplete="email"
              :class="[
                'w-full rounded-lg border-[1.5px] bg-transparent py-3 pl-10 pr-3 text-sm outline-none transition-all placeholder:text-slate-400/70',
                'focus:ring-[3px] dark:placeholder:text-slate-500',
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-[var(--accent)] focus:ring-[var(--accent-ring)] dark:border-slate-700',
              ]"
              @blur="validateEmail"
            />
          </div>
          <p v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</p>
        </div>

        <!-- Mot de passe -->
        <div class="flex flex-col gap-1.5">
          <label for="login-password" class="text-sm font-semibold">{{ labels.password }}</label>
          <div class="relative flex items-center">
            <span class="pointer-events-none absolute left-3 h-[18px] w-[18px] text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-full w-full">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 1 1 8 0v4" />
              </svg>
            </span>
            <input
              id="login-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="placeholders.password"
              autocomplete="current-password"
              :class="[
                'w-full rounded-lg border-[1.5px] bg-transparent py-3 pl-10 pr-11 text-sm outline-none transition-all placeholder:text-slate-400/70',
                'focus:ring-[3px] dark:placeholder:text-slate-500',
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-[var(--accent)] focus:ring-[var(--accent-ring)] dark:border-slate-700',
              ]"
              @blur="validatePassword"
            />
            <button
              type="button"
              class="absolute right-2 flex rounded-md p-1.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @mousedown.prevent
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-[18px] w-[18px]">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-[18px] w-[18px]">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <p class="min-h-4 text-xs text-red-500">{{ errors.password }}</p>
        </div>

        <!-- Options -->
        <div class="flex items-center justify-between gap-4">
          <label class="flex cursor-pointer select-none items-center gap-2">
            <input v-model="form.remember" type="checkbox" class="peer sr-only" />
            <span
              class="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] border-slate-300 transition-all peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--accent-ring)] dark:border-slate-600"
            >
              <svg viewBox="0 0 12 10" fill="none" class="checkbox-check h-2.5 w-3 text-white">
                <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </span>
            <span class="text-sm text-slate-500 dark:text-slate-400">{{ labels.remember }}</span>
          </label>
          <a
            href="#"
            class="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline"
            @click.prevent="$emit('forgot-password')"
          >
            {{ labels.forgot }}
          </a>
        </div>

        <!-- Erreur globale -->
        <p
          v-if="serverError"
          role="alert"
          class="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-500"
        >
          {{ serverError }}
        </p>

        <!-- Bouton de soumission -->
        <button
          type="submit"
          :disabled="loading"
          class="flex items-center justify-center gap-2 cursor-pointer rounded-lg py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          :style="{ backgroundColor: 'var(--accent)' }"
        >
          <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
          <span>{{ loading ? labels.submitting : labels.submit }}</span>
        </button>
      </form>

      <!-- Séparateur -->
      <!-- <div class="my-6 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span>{{ labels.or }}</span>
        <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div> -->

      <!-- Connexions sociales -->
<!--        
      <div class="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
        <button
          v-for="provider in socialProviders"
          :key="provider.name"
          type="button"
          class="flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-slate-300 py-2.5 text-sm font-semibold transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-ring)] dark:border-slate-600"
          :aria-label="`Se connecter avec ${provider.name}`"
          @click="$emit('social-login', provider.name)"
        >
          <span v-html="provider.icon" />
          <span>{{ provider.name }}</span>
        </button>
      </div> -->

      <!-- Pied de page -->
      <!-- <p class="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
        {{ labels.noAccount }}
        <a
          href="#"
          class="ml-1 font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline"
          @click.prevent="$emit('register')"
        >
          {{ labels.register }}
        </a>
      </p> -->
    </div>
  </div>
</template>


<style scoped>
/* La classe `dark` doit activer les variantes dark: de Tailwind.
 *
 * Tailwind v3 → tailwind.config.js :
 *   module.exports = { darkMode: 'class', ... }
 *
 * Tailwind v4 → dans votre CSS :
 *   @custom-variant dark (&:where(.dark, .dark *));
 */

/* Coche de la checkbox : la variante `peer-checked:` cible uniquement les
 * frères de l'input. La coche étant un enfant du <span> frère, elle est
 * révélée par ce petit bloc CSS (~15 lignes). */
.checkbox-check {
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

input:checked + span .checkbox-check {
  opacity: 1;
  transform: scale(1);
}

/* Masque le bouton œil natif de Edge, qui capterait les clics
 * à la place de notre bouton personnalisé. */
input::-ms-reveal {
  display: none;
}
</style>