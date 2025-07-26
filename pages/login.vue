<script setup lang="ts">
import * as v from "valibot";
import type { FormSubmitEvent } from "@nuxt/ui";

import { TOKEN_COOKIE_KEY } from "~/lib/auth";

definePageMeta({
    layout: "blank",
});

const schema = v.object({
    email: v.pipe(v.string(), v.email("Invalid email")),
    password: v.pipe(
        v.string(),
        v.minLength(8, "Must be at least 8 characters"),
    ),
});

type Schema = v.InferOutput<typeof schema>;
type ApiError = {
    error: string;
};


const state = reactive({
    email: "",
    password: "",
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
    event.preventDefault();

    const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: event.data.email,
            password: event.data.password,
        }),
    });
    if (!response.ok) {
        const data: ApiError = await response.json();
        toast.add({
            title: "Ошибка!",
            description: data.error,
            color: "error",
        });
        return;
    }

    toast.add({
        title: "Успех!",
        description: "Вы успешно вошли в систему.",
        color: "success",
    });
}
</script>

<template>
    <UForm
        :schema="schema"
        :state="state"
        class="flex flex-col h-screen items-center justify-center"
        @submit="onSubmit"
    >
        <div class="space-y-2">
            <UFormField label="e-mail" name="email">
                <UInput v-model="state.email" class="w-80" />
            </UFormField>

            <UFormField label="пароль" name="password">
                <UInput v-model="state.password" class="w-80" type="password" />
            </UFormField>

            <div class="grid space-y-2 mt-4">
                <UButton type="submit" variant="subtle" size="sm">
                    войти
                </UButton>

                <UButton type="button" to="/signup" size="xs" variant="link">
                    зарегистрироваться
                </UButton>
            </div>
        </div>
    </UForm>
</template>
