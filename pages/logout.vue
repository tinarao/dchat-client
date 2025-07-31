<script setup lang="ts">
import { TOKEN_COOKIE_KEY } from '~/lib/auth';

const token = useCookie(TOKEN_COOKIE_KEY)
token.value = null

window.location.replace('/')
</script>

<template></template>
