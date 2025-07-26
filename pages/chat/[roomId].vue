<script setup lang="ts">
import { type Channel, Socket } from "phoenix";
import { TOKEN_COOKIE_KEY } from "~/lib/auth";
import type { SocketError } from "~/lib/chat/errors";
import type { Message } from "~/lib/chat/types";

const route = useRoute();
const toast = useToast();
const channel = ref<Channel | null>(null);
const message = ref("");
const messages = ref<Message[]>([]);
const currentUser = ref("Anonymous");
const socket = ref<Socket | null>(null);
const room = useState("currentRoomName", () => "");
const token = useCookie(TOKEN_COOKIE_KEY);

function initSocket() {
    if (!socket.value) return;

    channel.value = socket.value.channel(room.value, {
        token: token.value,
    });

    channel.value
        .join()
        .receive("ok", ({ messages: _initialMessages }) => {
            // messages.value = initialMessages
        })
        .receive("error", ({ error }: { error: SocketError }) => {
            toast.add({
                title: error.title,
                color: "error",
            });

            console.error(error)

            return navigateTo("/chat/lobby");
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
        content: msg,
    });

    message.value = "";
};

onMounted(async () => {
    room.value = "room:" + route.params.roomId;
    messages.value = [];

    socket.value = new Socket("ws://localhost:4000/chat", {
        params: {
            token: token.value,
        },
    });

    if (socket.value) {
        socket.value.connect();
    }

    console.log("Connected");
    initSocket();
});

onUnmounted(() => {
    // sendMessage(`${currentUser.value} вышел из лобби`)
    socket.value?.disconnect();
});
</script>

<template>
    <main class="flex-1 p-4">
        <div>
            <ul>
                <li v-for="message in messages" :key="message.id">
                    <MessageLi :message="message" />
                </li>
            </ul>
        </div>
    </main>
    <div class="p-4 space-y-2">
        <UTextarea class="w-full" v-model="message" />
        <UButton variant="subtle" size="xs" @click="() => sendMessage(message)">Отправить</UButton>
    </div>
</template>
