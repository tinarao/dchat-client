<script setup lang="ts">
import { createRoom } from '~/lib/chat'

const name = ref("")
const toast = useToast()
const { currentUser } = useCurrentUser()
const { create } = useSecretChats()

async function handleCreateRoom() {
    if (currentUser.value.id === 0) {
        toast.add({
            title: "ошибка!",
            description: "авторизуйтесь, чтобы создавать секретные чаты",
            color: "error",
            onClick: async () => await navigateTo("/login")
        })
        return
    }

    if (!name.value) {
        toast.add({
            title: "ошибка!",
            description: "название комнаты не может быть пустым!",
            color: "error"
        })
        return
    }

    const { error } = await create(name.value)
    if (!error) {
        toast.add({
            title: "успешно!",
            // description: "комната " + result.topic + " создана"
        })

        // await navigateTo("/chat/" + result.topic)
        return
    }

    toast.add({
        title: "ошибка!",
        description: error,
        color: "error"
    })
}
</script>

<template>
    <UPopover>
        <slot name="trigger" />

        <template #content>
            <div>
                <div class="flex items-center space-x-2 p-2">
                    <UInput class="w-80" placeholder="введите имя пользователя собеседника" v-model="name" />
                    <UButton @click="handleCreateRoom" title="нажмите, чтобы создать секретный чат" icon="i-lucide-plus"
                        variant="subtle"></UButton>
                </div>
            </div>
        </template>
    </UPopover>
</template>
