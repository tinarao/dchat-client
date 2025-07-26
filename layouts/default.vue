<script setup lang="ts">
import { createRoom } from '~/lib/rooms';

const currentRoomName = useState('currentRoomName', () => "")
</script>

<template>
    <div class="flex flex-col h-screen justify-between">
        <header class="flex items-center justify-between p-4 border-b border-neutral-800">
            <p class="text-info">
                {{ currentRoomName || "загрузка..." }}
            </p>

            <create-room-popover>
                <template #trigger>
                    <UButton size="sm" variant="outline" icon="i-lucide-plus">создать комнату</UButton>
                </template>
            </create-room-popover>
        </header>
        <slot />
    </div>
</template>
