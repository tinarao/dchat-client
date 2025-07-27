import type { CommonRoomData } from "./types"

type GetMyChatsReturn = {
    ok: false,
    rooms: CommonRoomData[]
}

export async function getMyChats() {
    const response = await fetch("http://localhost:4000/api/rooms/get/my", {
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
