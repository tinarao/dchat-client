<script setup lang="ts">

definePageMeta({
    layout: "blank"
})

const e2ee = useE2EE()

onMounted(async () => {
    const myKeyPair = await e2ee.generateKeyPair(master)
    await e2ee.saveKeyPair(myKeyPair)


    const { publicKey, privateKey } = await e2ee.getCurrentKeyPair(master)
    console.log({ publicKey, privateKey })
})

</script>

<template>
    penis
</template>
