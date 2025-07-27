<script setup lang="ts">
import { Socket, type Channel } from "phoenix";
import { TOKEN_COOKIE_KEY } from "~/lib/auth";
import type { Message } from "~/lib/chat/types";

const route = useRoute();
const socket = ref<Socket | null>(null);
const newMessage = ref("");
const messages = ref<Message[]>([]);
const channel = ref<Channel | null>(null);
const toast = useToast();
const token = useCookie(TOKEN_COOKIE_KEY);
const { currentUser, me } = useCurrentUser();
const { room, getRoom } = useRoomInfo();

const sendMessage = (msg: string) => {
    if (!channel.value) return;
    if (msg.trim() === "") return;

    if (!room.value.allowAnonyms && currentUser.value.id === 0) {
        toast.add({
            title: "в комнате запрещена анонимная отправка сообщений",
            color: "error",
        });
        return;
    }

    channel.value.push("new_message", {
        token: token.value,
        content: msg,
    });

    newMessage.value = "";
};

onMounted(async () => {
    me();

    let topic = route.params.topic.toString();
    if (!topic.startsWith("room:")) topic = "room:" + topic;

    messages.value = [];

    socket.value = new Socket("ws://localhost:4000/chat", {
        params: {
            token: token.value,
        },
    });

    if (!socket.value) {
        toast.add({
            title: "не удаётся подключиться к серверу",
            description:
                "обновите страницу или вернитесь через некоторое время.",
            color: "warning",
        });

        return;
    }

    socket.value.connect();

    console.log("Creating channel with topic:", topic);
    channel.value = socket.value.channel(topic, {
        token: token.value,
    });

    await getRoom(topic);

    channel.value
        .join()
        .receive("ok", ({ message }: { message: Message }) => {
            console.log("Connected to " + room.value.topic);
        })
        .receive("error", (error) => {
            toast.add({
                title: error.error.title,
                color: "error",
            });
            console.error(error);

            return navigateTo("/chat/lobby");
        });

    channel.value.on("new_message", (msg: Message) => {
        messages.value.push(msg);
    });
});

onUnmounted(() => {
    socket.value?.disconnect();
});
</script>

<template>
    <main class="flex-1 p-4">
        <div>
            <ul>
                <li
                    class="pb-2"
                    v-for="msg in messages"
                    :key="
                        msg.content + msg.createdAt + new Date().toISOString()
                    "
                >
                    <MessageLi :message="msg" />
                </li>
            </ul>
        </div>
    </main>
    <div class="p-4 space-y-2">
        <UTextarea v-model="newMessage" class="w-full" />
        <UButton
            variant="subtle"
            size="xs"
            @click="() => sendMessage(newMessage)"
        >
            Отправить</UButton
        >
    </div>
</template>
