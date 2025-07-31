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
