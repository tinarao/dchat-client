import { getApiUrl } from "../utils";

export const TOKEN_COOKIE_KEY = "tt" as const; // why not

export const AnonymousUser = {
    id: 0,
    username: "Anonymous",
} as const

export async function getCurrentUser() {
    const route = getApiUrl("/me")
    const response = await fetch(route, {
        credentials: "include"
    })

    if (response.ok) {
        const data: MeResponse = await response.json()
        return data.user
    }

    return AnonymousUser
}
