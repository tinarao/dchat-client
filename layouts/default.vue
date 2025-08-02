<template>
    <div class="flex flex-col h-screen justify-between">
        <header class="flex items-center justify-between p-4 border-b border-neutral-800">
            <room-label-switchable />

            <div class="flex items-center gap-x-2">
                <create-room-popover>
                    <template #trigger>
                        <UButton size="sm" variant="outline" icon="i-lucide-plus" />
                    </template>
                </create-room-popover>
                <UButton href="/secret-chat" size="xs" variant="outline" icon="i-lucide-key" color="neutral" label="секретные чаты" />
                <my-rooms-popover />
                <auth-popover />
            </div>
        </header>
        <slot />
    </div>

    <PassphraseModal />
</template>
