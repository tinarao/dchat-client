export default defineAppConfig({
    apiUrl: process.env.NODE_ENV === "production" ? "" : "http://localhost:4000/api",
    wsChatUrl: process.env.NODE_ENV === "production" ? "" : "ws://localhost:4000/chat"
})
