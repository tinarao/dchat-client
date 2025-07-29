<script setup lang="ts">


definePageMeta({
    layout: "blank"
})

const e2ee = useE2EE()

const passphrase = ref("жопа")

onMounted(async () => {
    const master = await e2ee.generateMasterKey("penis", "aboba")
    const myKeyPair = await e2ee.generateKeyPair(master)
    await e2ee.saveKeyPair(myKeyPair)


    const { publicKey, privateKey } = await e2ee.getCurrentKeyPair(master)
    console.log({ publicKey, privateKey })
})

</script>

<template>
    penis
</template>
