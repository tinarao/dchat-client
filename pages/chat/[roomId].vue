<script setup lang="ts">
import { type Channel, Socket } from "phoenix";
import type { Message } from "~/lib/chat/types";

const route = useRoute();
const channel = ref<Channel | null>(null);
const message = ref("");
const messages = ref<Message[]>([]);
const currentUser = ref("Anonymous");
const room = ref("room:" + route.params.roomId);

const socket = ref<Socket | null>(null);

function initSocket() {
    if (!socket.value) return;

    channel.value = socket.value.channel(room.value, {});

    channel.value
        .join()
        .receive("ok", ({ messages: _initialMessages }) => {
            // messages.value = initialMessages
        })
        .receive("error", ({ error }) => {
            console.error(error);
        });

    channel.value.on("new_message", (msg: Message) => {
        console.log(msg);
        messages.value.push(msg);
    });
}

const sendMessage = (msg: string) => {
    if (!channel.value) return;
    if (message.value.trim() === "") return;

    channel.value.push("new_message", {
        user: currentUser.value,
        content: message.value,
    });

    message.value = "";
};

onMounted(async () => {
    messages.value = [];
    socket.value = new Socket("ws://localhost:4000/chat", {
        params: {
            token: "penis",
        },
    });

    if (socket.value) {
        socket.value.connect();
    }

    console.log("Connected");
    initSocket();
});

onUnmounted(() => {
    sendMessage(`${currentUser} вышел из лобби`)
    socket.value?.disconnect();
});

</script>


<template>
    <div class="flex flex-col h-screen justify-between">
        <header class="p-4 border-b border-neutral-800">
            <p>
                {{ room }}
            </p>
        </header>
        <main class="flex-1 p-4">
            <div>
                <ul>
                    <li v-for="message in messages">
                        <MessageLi :message="message" />
                    </li>
                </ul>
            </div>
        </main>
        <div class="p-4 space-y-2">
            <UTextarea class="w-full" v-model="message" />
            <UButton variant="subtle" size="xs" @click="() => sendMessage(message)">Отправить</UButton>
        </div>
    </div>
</template>
