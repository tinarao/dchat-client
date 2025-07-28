import { Channel, Socket } from "phoenix"
import { TOKEN_COOKIE_KEY } from "~/lib/auth"
import type { Message } from "~/lib/chat/types"

type SocketMessageType =
    "new_message" |
    "switch_allow_anonyms" |
    "ok" |
    "error"

type InitConnectionArgs = {
    topic: string
    onConnect: () => void
    onError: (error: string) => void
    onMessage: (message: Message) => void
}

export function useSocket() {
    const token = useCookie(TOKEN_COOKIE_KEY)
    const socket = ref<Socket | null>(null)
    const channel = ref<Channel | null>(null)
    const config = useAppConfig()
    const topic = ref<string | undefined>(channel.value?.topic)

    async function sendMessage(messageType: SocketMessageType, message: string) {
        if (!channel.value) return;

        channel.value.push(messageType, {
            token: token.value,
            content: message,
        });
    }

    async function initConnection({ topic, onConnect, onError, onMessage }: InitConnectionArgs) {
        socket.value = new Socket(config.wsChatUrl, {
            params: {
                token: token.value,
            },
        });

        if (!socket.value) {
            return {
                ok: false,
                error: "не удалось установить соединение"
            }
        }

        socket.value.connect()
        channel.value = socket.value.channel(topic, {
            token: token.value
        })

        channel.value
            .join()
            .receive("ok", ({ _message }: { _message: Message }) => {
                onConnect()
            })
            .receive("error", (error) => {
                if (error.error.title) {
                    onError(error.error.title as string)
                    return
                }

                onError("произошла непредвиденная ошибка.")
            });

        channel.value.on("new_message", (msg: Message) => {
            onMessage(msg)
        });
    }

    async function killConnection() {
        if (socket.value) {
            socket.value.disconnect()
        }
    }

    return {
        topic,
        sendMessage,
        initConnection,
        killConnection
    }
}
