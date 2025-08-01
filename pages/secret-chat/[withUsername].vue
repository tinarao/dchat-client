<script setup lang="ts">
import { getPersonPublicKey } from '~/lib/keys'
import { getSecretChatWith, type EncryptedMessage } from '~/lib/secret-chat'

const e2e = useE2EE()
const toast = useToast()
const route = useRoute()
const socket = useSocket()
const withUsername = route.params.withUsername

const newMessage = ref("")
const sharedSecret = ref<CryptoKey | null>(null)
const messages = ref<(EncryptedMessage & { id: number })[]>([])

async function handleSendMessage() {
    console.log(newMessage)
}

onMounted(async () => {
    const [chatResult, keyResult] = await Promise.all([
        getSecretChatWith(withUsername.toString()),
        getPersonPublicKey(withUsername.toString())
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

    try {
        const mykeys = await e2e.getCurrentKeyPair()
        const theirPublicKey: JsonWebKey = JSON.parse(keyResult.data.key)
        sharedSecret.value = await e2e.deriveSharedSecret(mykeys.privateKey, theirPublicKey)
    } catch (e) {
        // Либо деформированный ключ, либо нет мастер ключа
        // При обоих случаях их нужно обновить
        console.error(e)
        return navigateTo("/passphrase?then=" + route.path)
    }

    const topic = "secret:" + chatResult.data.id

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
