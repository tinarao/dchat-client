<script setup lang="ts">
import { TOKEN_COOKIE_KEY } from '~/lib/auth';
import { createNewKey } from '~/lib/keys';

definePageMeta({
    layout: "blank"
})

const e2e = useE2EE()
const { me } = useCurrentUser()
const token = useCookie(TOKEN_COOKIE_KEY)
const route = useRoute()

onMounted(async () => {
    if (!token.value) {
        return navigateTo("/login")
    }

    const user = await me()
    await e2e.generateMasterKey(token.value, `${user.id}${user.username}`)
    const keyPair = await e2e.generateKeyPair();
    await e2e.saveKeyPair(keyPair);

    console.info("Keys generated and saved")

    const { error } = await createNewKey(keyPair.publicKey)
    if (error) {
        // todo: придумать что делать дальше
    }

    const callbackUrl = route.query.callbackUrl
    if (callbackUrl?.toString() === "/") {
        return navigateTo("/chat/lobby")
    }

    const redirectTo = callbackUrl?.toString() || "/chat/lobby"
    return navigateTo(redirectTo)
})

</script>

<template>

</template>
