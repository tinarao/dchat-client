import { AnonymousUser } from "~/lib/auth"

const protectedPages = [
    "/secret-chat"
]

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { me } = useCurrentUser()

    for (const route of protectedPages) {
        if (to.path.startsWith(route)) {
            const user = await me()
            if (user.id === AnonymousUser.id) {
                return navigateTo("/")
            }
        }
    }
})
