<script setup lang="ts">
import { getApiUrl } from '~/lib/utils'

const { room, getRoom } = useRoomInfo()
const { currentUser } = useCurrentUser()
const toast = useToast()
const themesArray = ref(["name", "topic", "json"])
const theme = ref('json')
const isCreator = ref(false)
const newAllowAnonymous = ref(room.value.allowAnonyms)

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

watch(newAllowAnonymous, async () => {
    const route = getApiUrl(`/rooms/allow_anonyms/${room.value.id}/${newAllowAnonymous.value}`)
    const response = await fetch(route, {
        method: "PATCH",
        credentials: "include"
    })

    if (response.ok) {
        toast.add({
            title: "настройки комнаты изменены!"
        })
        return
    }

    await getRoom(room.value.topic)
})
</script>

<template>
    <div class="flex items-center gap-x-4 text-info font-bold group">
        <p v-if="theme === 'name'">
            {{ room.name ?? "загрузка..." }}
        </p>
        <p v-else-if="theme === 'topic'">
            {{ room.topic ?? "загрузка..." }}
        </p>
        <p v-else>
            {{ room }}
        </p>

        <u-select v-model="theme" :items="themesArray" size="sm" variant="soft" :highlight="false"></u-select>

        <u-popover v-if="isCreator">
            <u-button icon="i-lucide-pen" color="neutral" size="sm" variant="subtle" />

            <template #content>
                <div class="p-2">
                    <u-switch v-model="newAllowAnonymous" label="Разрешить анонимные сообщения" />
                </div>
            </template>
        </u-popover>
    </div>
</template>
