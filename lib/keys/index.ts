import type { Result } from "../result";
import { getApiUrl } from "../utils";

export async function createNewKey(keyData: JsonWebKey) {
    const route = getApiUrl("/keys")
    const response = await fetch(route, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            key_data: JSON.stringify(keyData)
        })
    })

    if (!response.ok) {
        const { error }: { error: string } = await response.json()
        return { error: error || "не удалось обновить ключи на сервере" }
    }

    return { error: undefined }
}

type KeyResponse = {
    key: string
    is_active: boolean
}

export async function getPersonPublicKey(personUsername: string): Promise<Result<KeyResponse>> {
    const route = getApiUrl("/keys/username/" + personUsername)
    const response = await fetch(route, {
        credentials: "include",
    })

    if (!response.ok) {
        const { error }: { error: string } = await response.json()
        return { ok: false, error: error || "пользователь и/или ключи не найдены" }
    }


    const { key }: { key: KeyResponse } = await response.json()
    return { ok: true, data: key }
}
