import { AnonymousUser } from "~/lib/auth"
import { getApiUrl } from "~/lib/utils";

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
            const route = getApiUrl("/me")
            const response = await fetch(route, {
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
