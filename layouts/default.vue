<script setup lang="ts">
const currentRoomName = useState('currentRoomName', () => "")
</script>

<template>
    <div class="flex flex-col h-screen justify-between">
        <header class="p-4 border-b border-neutral-800">
            <p class="text-info">
                {{ currentRoomName || "загрузка..." }}
            </p>
        </header>
        <slot />
    </div>
</template>
