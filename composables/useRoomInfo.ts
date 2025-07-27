import type { CommonRoomData } from "~/lib/chat/types";
import { getRoomInfo } from "~/lib/rooms";

export function useRoomInfo() {
    const room = useState<CommonRoomData>("currentRoomName", () => (
        { id: 0, topic: "", name: "", creatorId: 0, allowAnonyms: true })
    );

    async function getRoom(topic: string) {
        const roomInfo = await getRoomInfo(topic)
        if (roomInfo.ok) {
            const { ok, ...roomData } = roomInfo;
            room.value = roomData
        }
    }

    return { room, getRoom }
}
