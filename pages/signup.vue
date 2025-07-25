<script setup lang="ts">
import * as v from "valibot";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
    layout: "blank",
});

const schema = v.object({
    email: v.pipe(v.string(), v.email("Invalid email")),
    password: v.pipe(
        v.string(),
        v.minLength(8, "Must be at least 8 characters"),
    ),
    username: v.pipe(v.string()),
});

type Schema = v.InferOutput<typeof schema>;

type ApiError = {
    error: string;
};

const state = reactive<Schema>({
    username: "",
    email: "",
    password: "",
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
    event.preventDefault();

    const response = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: event.data.email,
            password: event.data.password,
            username: event.data.username,
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

    // const user: User = await response.json();

    toast.add({
        title: "Успех!",
        description: "The form has been submitted.",
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
                <UInput v-model="state.email" type="email" class="w-80" />
            </UFormField>

            <UFormField label="юзернейм" name="email">
                <UInput v-model="state.username" class="w-80" />
            </UFormField>

            <UFormField label="пароль" name="password">
                <UInput v-model="state.password" type="password" class="w-80" />
            </UFormField>

            <div class="grid space-y-2 mt-4">
                <UButton type="submit" variant="subtle" size="sm">
                    зарегистрироваться
                </UButton>

                <UButton type="button" to="/login" size="xs" variant="link">
                    войти
                </UButton>
            </div>
        </div>
    </UForm>
</template>
