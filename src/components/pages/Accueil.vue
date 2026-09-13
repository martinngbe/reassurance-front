<!-- components/pages/Accueil.vue -->
<script setup lang="ts">
defineProps<{ accentColor: string }>()

const stats = [
  { label: 'Contrats actifs', value: '1 247', trend: '+12%', icon: '📄' },
  { label: 'Sinistres en cours', value: '38', trend: '-5%', icon: '⚠️' },
  { label: 'Règlements du mois', value: '€ 284 500', trend: '+8%', icon: '💰' },
  { label: 'Acteurs enregistrés', value: '892', trend: '+3%', icon: '👥' },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">
        Tableau de bord
      </h2>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Bienvenue sur votre espace de gestion — vue d'ensemble.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="s in stats"
        :key="s.label"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {{ s.label }}
            </p>
            <p class="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {{ s.value }}
            </p>
          </div>
          <span class="text-2xl">{{ s.icon }}</span>
        </div>
        <p
          class="mt-3 text-xs font-semibold"
          :style="{ color: accentColor }"
        >
          {{ s.trend }} vs mois dernier
        </p>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Activité récente
      </h3>
      <ul class="mt-4 space-y-3">
        <li
          v-for="i in 5"
          :key="i"
          class="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700"
        >
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            :style="{ backgroundColor: accentColor }"
          >
            {{ i }}
          </span>
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
              Activité n°{{ i }} — contrat mis à jour
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Il y a {{ i * 2 }} minutes
            </p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>