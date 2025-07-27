<script setup lang="ts">
const { me, currentUser } = useCurrentUser()
const route = useRoute()
const loginUrl = "/login?callbackUrl=" + route.path

await me()

</script>

<template>
    <u-button v-if="currentUser.id === 0" variant="soft" :to="loginUrl">
        войти
    </u-button>
    <u-popover v-else>
        <u-button variant="soft" size="sm">{{ currentUser.username }}</u-button>

        <template #content>
            <span>penis!</span>
        </template>
    </u-popover>
</template>
