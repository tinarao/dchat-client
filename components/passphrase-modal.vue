<script setup lang="ts">
const { isOpen, closeModal } = usePassphraseModal()
const { currentUser } = useCurrentUser()
const e2e = useE2EE()
const toast = useToast()

const loading = ref(false)
const showInfoBlock = ref(true)
const passphrase = ref("")

async function handleGenerateKeys() {
    const masterKey = await e2e.generateMasterKey(passphrase.value, "".concat(currentUser.value.id.toString(), currentUser.value.username))
    const keyPair = await e2e.generateKeyPair(masterKey)
    await e2e.saveKeyPair(keyPair)

    toast.add({
        title: "успешно!",
        description: "набор ключей успешно сгенерирован."
    })

    closeModal()
}

</script>

<template>
    <UModal :dismissible="false" v-model:open="isOpen" title="Генерация мастер ключа"
        description="Для надёжного шифрования необходима контрольная фраза">
        <template #body>
            <div v-if="showInfoBlock" class="space-y-2">
                <p>
                    Для обеспечения надёжного шифрования сообщений необходима
                    <span class="text-orange-500">контрольная фраза</span>.
                    Приложение её <span class="text-red-500">не сохраняет</span>, чтобы
                    избежать утечки.
                </p>
                <p>
                    Придумайте контрольную фразу - используйте что-угодно, любой текст или число.
                    Если в следующий раз Вами будет введёна отличающаяся фраза, доступ к зашифрованным
                    сообщениям будет недоступен. Рекомендуем запомнить или записать на физическом носителе.
                </p>
                <p>
                    Приложение будет просить Вас ввести эту фразу время от времени.
                </p>

                <UButton @click="() => { showInfoBlock = false }" class="mt-4" variant="subtle" size="sm"
                    icon="i-lucide-save" color="warning">
                    Ок, ввести фразу
                </UButton>
            </div>

            <div v-else class="space-y-2">
                <UInput :loading="loading" v-model="passphrase" class="w-full" placeholder="Введите контрольную фразу"
                    icon="i-lucide-key" />
                <div class="flex">
                    <UButton @click="handleGenerateKeys" :loading="loading" :disabled="passphrase.length === 0"
                        variant="subtle" size="sm" icon="i-lucide-save">
                        Сохранить
                    </UButton>
                    <UButton @click="() => { showInfoBlock = true }" class="ml-auto" variant="soft" size="sm"
                        icon="i-lucide-message-circle-question-mark" color="neutral">
                        Что?
                    </UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>
