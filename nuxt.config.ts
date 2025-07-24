import tailwindcss from "@tailwindcss/vite";
import ui from "@nuxt/ui/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    vite: { plugins: [tailwindcss(), ui()] },
    css: ["~/assets/globals.css"],
    modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/eslint']
})
