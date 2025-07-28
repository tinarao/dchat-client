export type User = {
    id: number;
    bio?: string;
    username: string;
    avatarUrl?: string;
    // rooms: Room[]
};

export type Room = {
    id: number;
    messages: Message[];
};

export type Message = {
    id: number
    user: User;
    // room: Room
    content: string;
    inserted_at: string;
    updated_at: string;
};

export type CommonRoomData = {
    id: number
    name: string,
    topic: string,
    creatorId: number,
    allowAnonyms: boolean
}
