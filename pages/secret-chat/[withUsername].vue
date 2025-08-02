<script setup lang="ts">
import { getPersonPublicKey } from '~/lib/keys'
import { getSecretChatWith, type EncryptedMessage } from '~/lib/secret-chat'

const e2e = useE2EE()
const toast = useToast()
const route = useRoute()
const socket = useSocket()
const { currentUser } = useCurrentUser()
const withUsername = route.params.withUsername

const newMessage = ref("")
const contactId = ref(0)
const secretChatId = ref(0)
const sharedSecret = ref<CryptoKey | null>(null)
const decodedMessages = ref<string[]>([])

async function handleSendMessage() {
    if (!sharedSecret.value) {
        toast.add({
            title: "ошибка!",
            description: "общий секрет не сгенерирован",
            color: "error"
        })
        return
    }

    const encrypted = await e2e.encryptMessage(newMessage.value, sharedSecret.value)

    const completePayload = {
        cipherText: encrypted.cipherText,
        iv: encrypted.iv,
        recipientId: contactId.value,
        secretChatId: secretChatId.value
    }


    console.log("encrypted", completePayload)

    socket.sendMessage("new_message", completePayload)
}

async function handleIncomingEncrMessage(message: EncryptedMessage) {
    if (!sharedSecret.value) {
        toast.add({
            title: "ошибка!",
            description: "общий секрет не сгенерирован",
            color: "error"
        })
        return
    }

    const decoded = await e2e.decryptMessage(message, sharedSecret.value)
    console.log(decoded)
    decodedMessages.value.push(decoded)
}

onMounted(async () => {
    if (!e2e.isMasterKeyPresent()) {
        return navigateTo("/keys?callbackUrl=" + route.path)
    }

    const [chatResult, keyResult] = await Promise.all([
        getSecretChatWith(withUsername.toString()),
        getPersonPublicKey(withUsername.toString()),
    ])

    // TODO refactor
    if (!keyResult.ok) {
        console.error(keyResult.error)
        toast.add({
            title: "ошибка!",
            description: keyResult.error,
            color: "error"
        })

        return navigateTo("/secret-chat")
    }

    if (!chatResult.ok) {
        console.error(chatResult.error)
        toast.add({
            title: "ошибка!",
            description: chatResult.error,
            color: "error"
        })

        return navigateTo("/secret-chat")
    }
    // end of ugly block 

    const { first_user, second_user } = chatResult.data
    contactId.value = currentUser.value.id === first_user.id ? second_user.id : first_user.id
    secretChatId.value = chatResult.data.id

    const myKeys = await e2e.getCurrentKeyPair()
    const theirPublicKey: JsonWebKey = JSON.parse(keyResult.data.key)
    sharedSecret.value = await e2e.deriveSharedSecret(myKeys.privateKey, theirPublicKey)
    console.log("their", theirPublicKey)

    const topic = "secret:" + secretChatId.value

    await socket.initConnection({
        topic: topic,
        socketChannel: "secret-chat",
        async onError(error) {
            console.log(error)
            toast.add({
                title: "ошибка!",
                description: error,
                color: "error"
            })

            await navigateTo("/chat/lobby")
        },
        onEncrConnect(_initialMessages) {
            for (const message of _initialMessages) {
                handleIncomingEncrMessage(message)
            }
        },
        onEncrMessage(message) {
            console.log("recieved", message)
            handleIncomingEncrMessage(message)
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
                <li v-for="msg in decodedMessages">
                    {{ msg }}
                </li>
            </ul>
        </div>
    </main>
    <div class="p-4 space-y-2">
        <UTextarea v-model="newMessage" class="w-full" />
        <UButton variant="subtle" size="xs" @click="handleSendMessage">
            Отправить</UButton>
    </div>
</template>
