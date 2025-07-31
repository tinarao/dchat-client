<script setup lang="ts">
import type { EncryptedMessage } from '~/lib/secret-chat'
import { getApiUrl } from '~/lib/utils'

const toast = useToast()
const route = useRoute()
const socket = useSocket()
const withUsername = route.params.withUsername

const newMessage = ref("")
const messages = ref<(EncryptedMessage & { id: number })[]>([])

async function handleSendMessage() { }

onMounted(async () => {
    const response = await fetch(getApiUrl("/secret_chats/with/" + withUsername), {
        credentials: "include"
    })
    if (!response.ok) {
        toast.add({
            title: "ошибка!",
            description: "чат не найден"
        })

        return navigateTo("/secret-chat")
    }

    const { id: chat_id } = await response.json()
    const topic = "secret:" + chat_id

    await socket.initConnection({
        topic: topic,
        async onError(error) {
            console.log(error)
            toast.add({
                title: "ошибка!",
                description: error,
                color: "error"
            })

            await navigateTo("/chat/lobby")
        },
        onConnect(initialMessages) {
            console.log("initialMessages", initialMessages)
        },
        onMessage(message) {
            console.log("message", message)
        },
    })
})

onUnmounted(async () => {
    await socket.killConnection()
})

</script>

<template>
    <main class="flex-1 p-4">
        <div>
            <ul>
                <li class="pb-2" v-for="msg in messages" :key="msg.id">
                    {{ msg }}
                </li>
            </ul>
        </div>
    </main>
    <div class="p-4 space-y-2">
        <UTextarea v-model="newMessage" class="w-full" />
        <UButton variant="subtle" size="xs" @click="() => handleSendMessage(newMessage)">
            Отправить</UButton>
    </div>
</template>
