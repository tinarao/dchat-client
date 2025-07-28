<script setup lang="ts">
import { getMyChats } from '~/lib/chat';
import type { CommonRoomData } from '~/lib/chat/types';

const rooms = ref<CommonRoomData[]>([])
const { currentUser } = useCurrentUser()

onMounted(async () => {
    const result = await getMyChats()
    rooms.value = [...result.rooms, {
        name: "Lobby",
        topic: "room:lobby",
        id: 0,
        allowAnonyms: true,
        creatorId: 0
    }]
})
</script>

<template>
    <u-popover v-if="currentUser.id !== 0">
        <u-button size="sm" variant="outline" icon="i-lucide-messages-square" />

        <template #content>
            <div class="p-2 w-64 space-y-1">
                <u-button v-for="room in rooms" :label="room.name" :to="'/chat/' + room.topic" size="sm" variant="soft"
                    class="w-full" />
            </div>
        </template>
    </u-popover>
</template>
