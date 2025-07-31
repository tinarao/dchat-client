import { getMySecretChats, type SecretChat } from "~/lib/secret-chat";
import { getApiUrl } from "~/lib/utils";

export function useSecretChats() {
    const chats = useState<SecretChat[]>("my-secret-chats", () => [])

    async function getSecretChats() {
        const result = await getMySecretChats()
        if (result.ok) {
            console.log(result.data)
            chats.value = result.data
        }

    }

    async function create(withUsername: string) {
        const route = getApiUrl("/secret_chats/new/" + withUsername)
        const response = await fetch(route, {
            credentials: "include",
            method: "POST"
        })

        if (!response.ok) {
            const json: { error: string } = await response.json();
            return { error: json.error ?? "не удалось создать секретный чат" }
        }

        await getSecretChats()
        return { error: undefined }
    }

    return {
        chats,

        getSecretChats,
        create
    }
}
