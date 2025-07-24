<script setup lang="ts">
import type { Message } from '~/lib/chat/types';

const { message } = defineProps<{
    message: Message
}>()

const dtf = Intl.DateTimeFormat("ru", {
    timeStyle: "short",
    dateStyle: "short"
})
const datetime = dtf.format(new Date(message.created_at))
</script>

<template>
    >> <time :datetime="datetime"> {{ datetime }}</time> <span class="text-primary">{{ message.user.username }}</span>:
    {{ message.content }}
</template>
