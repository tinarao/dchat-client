import localforage from "localforage"
import { STORAGE_INSTANCE_KEY } from "~/composables/useE2EE"

export default defineNuxtPlugin({
    name: "idb initializator",
    enforce: "pre",
    setup(_nuxtApp) {
        const store = localforage.createInstance({
            name: STORAGE_INSTANCE_KEY,
        })

        store.setItem("app_started", true)
            .then(r => console.log(r))

        console.info("idb ready")

        return {
            provide: {
                store
            }
        }
    },
})

