<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { me, currentUser } = useCurrentUser()
const route = useRoute()
const loginUrl = "/login?callbackUrl=" + route.path

await me()


const items = ref<DropdownMenuItem[]>([
    {
        label: 'выйти',
        icon: 'i-lucide-log-out',
        to: "/logout"
    },
])
</script>

<template>
    <u-button v-if="currentUser.id === 0" variant="soft" :to="loginUrl">
        войти
    </u-button>
    <u-dropdown-menu :items="items">
        <u-button variant="soft"> {{ currentUser.username }}</u-button>
    </u-dropdown-menu>
</template>
