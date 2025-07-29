<script setup lang="ts">
import { getApiUrl } from '~/lib/utils'

const { room, getRoom } = useRoomInfo()
const { currentUser } = useCurrentUser()
const toast = useToast()
const isCreator = ref(false)

watch(room, () => {
    if (room.value.id === 0 || currentUser.value.id === 0) {
        isCreator.value = false
        return
    }
    if (room.value.creatorId === currentUser.value.id) {
        isCreator.value = true
        return
    }
})

async function handleChangeAllowAnonyms() {
    const route = getApiUrl(`/rooms/allow_anonyms/${room.value.id}/${!room.value.allowAnonyms}`)
    const response = await fetch(route, {
        method: "PATCH",
        credentials: "include"
    })

    if (response.ok) {
        toast.add({
            title: "настройки комнаты изменены!",
        })

        await getRoom(room.value.topic)
        return
    }
}


</script>

<template>
    <div class="flex items-center gap-x-4 text-info font-bold group">
        <u-popover>
            <u-button>{{ room.name }}</u-button>

            <template #content>
                <div class="p-2">
                    <ul>
                        <li v-if="room.allowAnonyms">анонимные сообщения разрешены</li>
                        <li v-else>анонимные сообщения запрещены</li>
                    </ul>
                </div>
            </template>
        </u-popover>
        <u-popover v-if="isCreator">
            <u-button icon="i-lucide-pen" color="neutral" size="sm" variant="subtle" />

            <template #content>
                <div class="p-2">
                    {{ String(room.allowAnonyms) }}
                    <u-switch @click="handleChangeAllowAnonyms" :default-value="room.allowAnonyms"
                        label="Разрешить анонимные сообщения" />
                </div>
            </template>
        </u-popover>
    </div>
</template>
