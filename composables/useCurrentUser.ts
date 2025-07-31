import { AnonymousUser, getCurrentUser } from "~/lib/auth"
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
            const user = await getCurrentUser()
            currentUser.value = user
        } catch (e) {
            console.error(e)
            currentUser.value = AnonymousUser
        } finally {
            loading.value = false
            return currentUser.value
        }
    }

    return {
        currentUser,
        loading,
        me
    }
}
