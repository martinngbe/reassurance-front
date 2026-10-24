<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'

import Assures from '@/web/acteurs/assure/Assures.vue';
import Polices from '@/web/police/Polices.vue';
import Quittances from '@/web/quittances/quittance/Quittances.vue';


</script>

<template>
  <TLayoutModule
    bottom-size="50%"
    :show-top="false"
    :show-left="false"
    >
    <template #default>
          <TLayoutModule
              left-size="50%"
              :show-top="false"
              :show-bottom="false"
            >
                <template  #left>
                    <Assures />
                </template>
                <template  #default>
                    <Polices />
                </template>
          </TLayoutModule>
    </template>
    <template #footer>
          <Quittances/>
    </template>


  </TLayoutModule>
</template>