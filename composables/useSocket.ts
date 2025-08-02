import { Channel, Socket } from "phoenix"
import { TOKEN_COOKIE_KEY } from "~/lib/auth"
import type { Message } from "~/lib/chat/types"
import type { EncryptedMessage } from "~/lib/secret-chat"

type SocketMessageType =
    "new_message" |
    "switch_allow_anonyms" |
    "ok" |
    "error"

type SocketChannel = "chat" | "secret-chat"

type InitConnectionArgs = {
    topic: string
    socketChannel?: SocketChannel
    onConnect?: (messages: Message[]) => void
    onEncrConnect?: (messages: EncryptedMessage[]) => void
    onError: (error: string) => void
    onMessage?: (message: Message) => void
    onEncrMessage?: (message: EncryptedMessage) => void
}

export function useSocket() {
    const token = useCookie(TOKEN_COOKIE_KEY)
    const config = useAppConfig()
    const socket = ref<Socket | null>(null)
    const channel = ref<Channel | null>(null)
    const topic = ref<string | undefined>(channel.value?.topic)

    type SendMessageReturn = {
        error?: string
    }
    async function sendMessage(messageType: SocketMessageType, message: any): Promise<SendMessageReturn> {
        if (!channel.value) {
            return {
                error: "нет соединения с каналом"
            }
        };

        return new Promise((resolve) => {
            channel.value?.push(messageType, {
                token: token.value,
                content: message,
            })
                .receive("ok", (_resp) => {
                    resolve({ error: undefined })
                })
                .receive("error", ({ reason }) => {
                    resolve({ error: reason })
                });
        })
    }

    async function initConnection({ topic, socketChannel, onConnect, onEncrConnect, onError, onMessage, onEncrMessage }: InitConnectionArgs) {
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
            .receive("ok", ({ messages }) => {
                if (socketChannel === "chat") {
                    messages = messages as Message[]
                    onConnect?.(messages)
                } else {
                    messages = messages as EncryptedMessage[]
                    onEncrConnect?.(messages)
                }
            })
            .receive("error", (error) => {
                console.log(error)
                if (error.error.title) {
                    onError(error.error.title as string)
                    return
                }

                onError("произошла непредвиденная ошибка.")
            });

        channel.value.on("new_message", (msg: any) => {
            if (socketChannel === "chat") {
                msg = msg as Message
                onMessage?.(msg)
            } else if (socketChannel === "secret-chat") {
                msg = msg as EncryptedMessage
                onEncrMessage?.(msg)
            }
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
