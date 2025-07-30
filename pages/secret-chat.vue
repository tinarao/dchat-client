<script setup lang="ts">
const { me } = useCurrentUser()
const { showModal } = usePassphraseModal()
const e2e = useE2EE()
const user = await me();
const isOk = ref(false)

onMounted(() => {
    if (!e2e.isMasterKeyPresent()) {
        showModal()
    }
})

</script>

<template>
    {{ user }}
    <div v-if="isOk">
        some private data ooof
    </div>
</template>
