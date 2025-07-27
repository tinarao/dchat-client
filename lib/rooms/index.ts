import type { CommonRoomData } from "../chat/types"

type CreateRoomResponse = {
    topic: string
    ok: true
} | {
    error: string
    ok: false
}

export async function createRoom(name: string): Promise<CreateRoomResponse> {
    const response = await fetch("http://localhost:4000/api/rooms/create", {
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

type GetRoomInfoResponse = {
    ok: true
} & CommonRoomData | {
    ok: false
    error: string
}

export async function getRoomInfo(topic: string): Promise<GetRoomInfoResponse> {
    const response = await fetch("http://localhost:4000/api/rooms/" + topic, {
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
