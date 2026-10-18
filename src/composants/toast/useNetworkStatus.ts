// composables/useNetworkStatus.ts (version avancée)
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from './useToast'

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const { success, error } = useToast()
  
  let offlineToastId: number | null = null
  let checkInterval: number | null = null

  const showOfflineToast = () => {
    if (offlineToastId !== null) return
    
    offlineToastId = error(
      'Vérifiez votre connexion réseau. Certaines fonctionnalités peuvent être indisponibles.',
      '️ Connexion perdue',
      {
        duration: 0,
        closable: false,
        position: 'bottom-right',
      }
    )
  }

  const showOnlineToast = () => {
    if (offlineToastId !== null) {
      const { remove } = useToast()
      remove(offlineToastId)
      offlineToastId = null
    }

    success(
      'La connexion a été rétablie avec succès.',
      '✅ Connexion rétablie',
      {
        duration: 4000,
        position: 'bottom-right',
      }
    )
  }

  // Vérification active de la connectivité
  const checkConnectivity = async () => {
    try {
      // Tente de charger une petite ressource (favicon ou pixel)
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
      })
      
      if (!response.ok && isOnline.value) {
        // La requête a échoué mais le navigateur pense être online
        isOnline.value = false
        showOfflineToast()
      } else if (response.ok && !isOnline.value) {
        // La requête a réussi mais le navigateur pense être offline
        isOnline.value = true
        showOnlineToast()
      }
    } catch (err) {
      // Erreur réseau détectée
      if (isOnline.value) {
        isOnline.value = false
        showOfflineToast()
      }
    }
  }

  const handleOnline = () => {
    isOnline.value = true
    showOnlineToast()
    // Arrête la vérification active
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  const handleOffline = () => {
    isOnline.value = false
    showOfflineToast()
    // Démarre la vérification active toutes les 5 secondes
    if (!checkInterval) {
      checkInterval = window.setInterval(checkConnectivity, 5000)
    }
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Vérification initiale
    checkConnectivity()
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    if (checkInterval) {
      clearInterval(checkInterval)
    }
  })

  return {
    isOnline,
  }
}