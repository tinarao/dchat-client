import { TOKEN_COOKIE_KEY } from "~/lib/auth"
import { getApiUrl } from "~/lib/utils"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const paths = ["/secret-chat", "/passphrase"]
    const token = useCookie(TOKEN_COOKIE_KEY)
    const headers = useRequestHeaders(['cookie'])

    for (const path of paths) {
        if (to.path.startsWith(path)) {
            const response = await fetch(
                getApiUrl("/me"),
                {
                    credentials: "include",
                    headers: {
                        "cookie": headers.cookie ?? ""
                    }
                }
            )

            if (!response.ok) {
                return navigateTo('/login?callbackUrl=' + from.path)
            }
        }
    }

})
