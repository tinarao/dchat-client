export function getApiUrl(uri: string) {
    const { apiUrl } = useAppConfig()
    return apiUrl + uri
}
