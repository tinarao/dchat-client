import { getApiUrl } from "../utils";
import type { Result } from "../result";

export type SecretChatsUser = {
    id: number
    username: string
}

export type SecretChat = {
    first_user: SecretChatsUser
    second_user: SecretChatsUser
}

export type EncryptedMessage = {
    iv: string
    cipherText: string
    salt: string
    keyVersion: string
}

export async function getMySecretChats(): Promise<Result<SecretChat[]>> {
    try {
        const route = getApiUrl("/secret_chats/my")
        const response = await fetch(route, {
            credentials: "include"
        })

        const json: { chats: SecretChat[] } = await response.json()
        return { ok: true, data: json.chats }
    } catch (e) {
        console.error(e)
        return { ok: false, error: "не удалось получить Ваши секретные чаты" }
    }
}

export async function getSecretChatWith(withUsername: string): Promise<Result<{ id: number }>> {
    const response = await fetch(getApiUrl("/secret_chats/with/" + withUsername), {
        credentials: "include"
    })
    if (!response.ok) {
        const { error }: { error: string } = await response.json()
        return { ok: false, error: error || "чат и/или пользователь не найден" }
    }


    const { id }: { id: number } = await response.json()
    return { ok: true, data: { id } }
}
