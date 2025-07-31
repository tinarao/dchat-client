<script setup lang="ts">
const route = useRoute()
const { getSecretChats, chats } = useSecretChats()
const e2e = useE2EE()
const isOk = ref(false)

onMounted(async () => {
    if (!e2e.isMasterKeyPresent()) {
        return navigateTo("/passphrase?then=" + route.path)
    }

    await getSecretChats()
    console.log(chats.value)
    isOk.value = true
})

</script>

<template>
    <div v-if="isOk" class="h-full grid grid-cols-5">
        <div class="border-r h-full border-neutral-800">
            <div v-if="chats.length !== 0">
                <PrivateChatCard v-for="chat in chats" :chat="chat" />
            </div>
            <div v-else>
                <p>Кажется, у вас нет приватных чатов.</p>
            </div>

            <CreateSecretChatPopover>
                <template #trigger>
                    <UButton variant="subtle" color="neutral">Создать</UButton>
                </template>
            </CreateSecretChatPopover>
        </div>
        <div></div>
    </div>
</template>
