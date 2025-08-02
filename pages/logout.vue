<script setup lang="ts">
import { logout, TOKEN_COOKIE_KEY } from '~/lib/auth';

const { clearAllKeysData } = useE2EE()
const token = useCookie(TOKEN_COOKIE_KEY)
token.value = null
await clearAllKeysData()
await logout()

window.location.replace('/')
</script>

<template></template>
