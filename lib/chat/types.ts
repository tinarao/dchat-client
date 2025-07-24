export type User = {
    id: number
    bio?: string
    username: string
    avatarUrl?: string
    rooms: Room[]

    // timestamps included too
}

export type Room = {
    id: number
    messages: Message[]
    // timestamps included too
}

export type Message = {
    id: number
    user: User
    room: Room
    content: string

    // timestamps included too
} 
