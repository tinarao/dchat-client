<script setup lang="ts">
import type { Message } from "~/lib/chat/types";

const route = useRoute();
const newMessage = ref("");
const messages = ref<Message[]>([]);
const toast = useToast();
const { currentUser, me } = useCurrentUser();
const { room, getRoom } = useRoomInfo();
const { initConnection, killConnection, sendMessage } = useSocket()

const handleSendMessage = (msg: string) => {
    if (msg.trim() === "") return;

    if (!room.value.allowAnonyms && currentUser.value.id === 0) {
        toast.add({
            title: "в комнате запрещена анонимная отправка сообщений",
            color: "error",
        });
        return;
    }

    sendMessage("new_message", msg)

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
            onError(error) {
                toast.add({
                    title: "ошибка!",
                    description: error,
                    color: "error"
                })
            },
            onConnect() {
                toast.add({
                    title: "соединение установлено!",
                    color: "info"
                })
            },
            onMessage(message) {
                messages.value.push(message)
            },
        })
    ])

    messages.value = [];
});

onUnmounted(() => {
    killConnection()
});
</script>

<template>
    <main class="flex-1 p-4">
        <div>
            <ul>
                <li class="pb-2" v-for="msg in messages" :key="msg.content + msg.createdAt + new Date().toISOString()
                    ">
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
