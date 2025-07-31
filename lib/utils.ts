export function getApiUrl(uri: string) {
    const { apiUrl } = useAppConfig()
    return apiUrl + uri
}

const DONE_RED_PP_INFO = "done-read-pp-info"

export function saveDoneReadPassphraseInfo() {
    localStorage.setItem(DONE_RED_PP_INFO, "true")
}

export function getDoneReadPassphraseInfo() {
    return !!localStorage.getItem(DONE_RED_PP_INFO)
}
