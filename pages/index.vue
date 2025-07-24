<script setup lang="ts">
import { Channel, Socket } from "phoenix"
import type { Message } from "~/lib/chat/types"

const channel = ref<Channel | null>(null)
const message = ref("")
const messages = ref<Message[]>([])
const currentUser = ref('Anonymous')

const socket = ref<Socket | null>(null)

function initSocket() {
    if (!socket.value) return
    channel.value = socket.value.channel("room:lobby", {});

    channel.value.join()
        .receive('ok', ({ messages: initialMessages }) => {
            // messages.value = initialMessages
        })
        .receive('error', ({ error }) => {
            console.error(error)
        })

    channel.value.on('new_message', (msg: Message) => {
        console.log(msg)
        messages.value.push(msg)
    })
}

const sendMessage = () => {
    if (!channel.value) return
    if (message.value.trim() === '') return

    channel.value.push('new_message', {
        user: currentUser.value,
        content: message.value
    })

    message.value = ''
}

onMounted(() => {
    messages.value = []
    socket.value = new Socket("ws://localhost:4000/chat", {
        params: {
            token: "penis"
        }
    })

    if (socket.value) {
        socket.value.connect()
    }

    console.log("Connected")
    initSocket()
})

onUnmounted(() => {
    socket.value?.disconnect()
})
</script>

<template>
    <div>
        <p>
            Текущая комната: {{ channel?.topic }}
        </p>
    </div>
    <div>
        <textarea v-model="message" />
        <button @click="sendMessage">
            Отправить
        </button>
    </div>
    <div>
        <ul>
            <li v-for="msg in messages">
                {{ msg.user.username }}: {{ msg.content }}
            </li>
        </ul>
    </div>
</template>
