<script setup lang="ts">
import { createRoom } from '~/lib/rooms'

const name = ref("")
const toast = useToast()
async function handleCreateRoom() {
    if (!name.value) {
        toast.add({
            title: "ошибка!",
            description: "название комнаты не может быть пустым!",
            color: "error"
        })
        return
    }

    const result = await createRoom(name.value)
    if (result.ok) {
        toast.add({
            title: "успешно!",
            description: "комната " + result.topic + " создана"
        })

        await navigateTo("/chat/" + result.topic)
    }
}
</script>

<template>
    <UPopover>
        <slot name="trigger" />

        <template #content>
            <div class="flex items-center space-x-2 p-2">
                <UInput class="w-80" placeholder="введите название новой комнаты" v-model="name" />
                <UButton @click="handleCreateRoom" title="нажмите, чтобы создать комнату" icon="i-lucide-plus"
                    variant="subtle"></UButton>
            </div>
        </template>
    </UPopover>
</template>
