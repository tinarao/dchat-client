import { getApiUrl } from "../utils"
import type { CommonRoomData } from "./types"

type GetRoomInfoResponse = {
    ok: true
} & CommonRoomData | {
    ok: false
    error: string
}

type CreateRoomResponse = {
    topic: string
    ok: true
} | {
    error: string
    ok: false
}

export async function getMyChats() {
    const route = getApiUrl("/rooms/get/my")
    const response = await fetch(route, {
        credentials: "include"
    })

    if (response.ok) {
        const json: { chats: CommonRoomData[] } = await response.json()
        return {
            ok: true,
            rooms: json.chats
        }
    }

    return {
        ok: true,
        rooms: []
    }
}

export async function createRoom(name: string): Promise<CreateRoomResponse> {
    const route = getApiUrl("/rooms/create")
    const response = await fetch(route, {
        method: "POST",
        credentials: "include",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            name: name
        })
    })

    if (response.ok) {
        const json: { topic: string } = await response.json()
        return {
            ok: true,
            topic: json.topic
        }
    }

    try {
        const json: { error: string } = await response.json()
        return { ok: false, error: json.error }
    } catch (e) {
        return { ok: false, error: "непредвиденная ошибка" }
    }

}

export async function getRoomInfo(topic: string): Promise<GetRoomInfoResponse> {
    const route = getApiUrl("/rooms/" + topic)
    const response = await fetch(route, {
        method: "GET",
        credentials: "include"
    })

    if (response.ok) {
        const json: CommonRoomData = await response.json()
        return {
            ok: true,
            ...json
        }
    }

    try {
        const { error }: { error: string } = await response.json()
        return {
            ok: false,
            error
        }
    } catch (e) {
        return {
            ok: false,
            error: "кажется, вы сломали сервер!"
        }
    }

}
