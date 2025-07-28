<script setup lang="ts">
import type { Message } from "~/lib/chat/types";

const route = useRoute();
const newMessage = ref("");
const messages = ref<Message[]>([]);
const toast = useToast();
const { currentUser, me } = useCurrentUser();
const { room, getRoom } = useRoomInfo();
const { initConnection, killConnection, sendMessage } = useSocket()

async function handleSendMessage(msg: string) {
    if (msg.trim() === "") return;

    if (!room.value.allowAnonyms && currentUser.value.id === 0) {
        toast.add({
            title: "в комнате запрещена анонимная отправка сообщений",
            color: "error",
        });
        return;
    }

    const result = await sendMessage("new_message", msg)
    if (result && result.error) {
        toast.add({
            title: "ошибка!",
            description: result.error,
            color: "error"
        })
    }

    newMessage.value = "";
};

onMounted(async () => {
    let topic = route.params.topic.toString();
    if (!topic.startsWith("room:")) topic = "room:" + topic;

    await Promise.all([
        getRoom(topic),
        me(),
        initConnection({
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
                if (Array.isArray(initialMessages)) {
                    messages.value = initialMessages
                }
            },
            onMessage(message) {
                messages.value.push(message)
            },
        })
    ])
});

onUnmounted(() => {
    killConnection()
});

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        handleSendMessage(newMessage.value)
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
    <main class="flex-1 p-4">
        <div>
            <ul>
                <li class="pb-2" v-for="msg in messages" :key="msg.id">
                    <MessageLi :message="msg" />
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
