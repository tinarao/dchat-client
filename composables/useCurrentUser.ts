import { AnonymousUser } from "~/lib/auth"

export type CommonUserData = {
    username: string,
    id: number
}

export type MeResponse = {
    user: {
        username: string;
        id: number;
    };
};

export default function useCurrentUser() {
    const currentUser = useState<CommonUserData>("currentUser", () => AnonymousUser)
    const loading = ref(false)

    async function me() {
        loading.value = true
        try {
            const response = await fetch("http://localhost:4000/api/me", {
                credentials: "include"
            })

            if (response.ok) {
                const data: MeResponse = await response.json()
                currentUser.value = data.user
                return
            }

            currentUser.value = AnonymousUser
        } catch (e) {
            console.error(e)
            currentUser.value = AnonymousUser
        } finally {
            loading.value = false
        }
    }

    return {
        currentUser,
        loading,
        me
    }
}
