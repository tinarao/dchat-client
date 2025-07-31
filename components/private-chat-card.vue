<script setup lang="ts">
import { NuxtLink } from '#components';
import { type SecretChatsUser, type SecretChat } from '~/lib/secret-chat';

const { currentUser } = useCurrentUser()
const { chat } = defineProps<{ chat: SecretChat }>()

const contact = ref<SecretChatsUser | null>(null)

contact.value = chat.first_user.id === currentUser.value.id ? chat.second_user : chat.first_user
const href = "/secret-chat/" + contact.value.username 
</script>

<template>
    <NuxtLink :href="href" class="">
        {{ contact?.username }}
    </NuxtLink>
</template>
