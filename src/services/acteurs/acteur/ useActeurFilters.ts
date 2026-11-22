// // useActeurFilters.ts
// import { computed, ref, watch } from 'vue';
// import type {  ActeurFilters, ActeurTypeKey } from './acteur';

// export function useActeurFilters() {
//   const selectedTypes = ref<Set<ActeurTypeKey>>(new Set());

//   const filters = computed<ActeurFilters>(() => {
//     const f: ActeurFilters = {};
//     if (selectedTypes.value.size === 0) return f;
//     // Si un seul type sélectionné → filtre strict
//     // Si plusieurs → on laisse le backend gérer (OU logique)
//     selectedTypes.value.forEach((key) => {
//       f[key] = true;
//     });
//     return f;
//   });

//   const hasActiveFilter = computed(() => selectedTypes.value.size > 0);

//   function toggle(key: ActeurTypeKey) {
//     const s = new Set(selectedTypes.value);
//     if (s.has(key)) s.delete(key);
//     else s.add(key);
//     selectedTypes.value = s;
//   }

//   function clear() {
//     selectedTypes.value = new Set();
//   }

//   return { selectedTypes, filters, hasActiveFilter, toggle, clear };
// }