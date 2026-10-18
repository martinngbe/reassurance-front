/** Classes de base d'un contrôle de champ (thème + dark mode inclus). */
export function controlBase(hasError: boolean): string[] {
  const classes: string[] = [
    'w-full rounded-lg border bg-white text-sm text-neutral-900 shadow-sm outline-none transition',
    'placeholder:text-neutral-400',
    'dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500',
    'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
    'dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500',
  ]
  if (hasError) {
    classes.push('border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/25')
  } else {
    classes.push(
      'border-neutral-300 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25',
      'dark:border-neutral-700 dark:hover:border-primary-400',
    )
  }
  return classes
}
