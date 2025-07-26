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
