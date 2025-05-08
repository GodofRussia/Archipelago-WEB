interface ImportMetaEnv {
    readonly VITE_YANDEX_API_KEY: string;
    readonly VITE_ZOOM_URL: string;
    readonly VITE_CHAT_URL: string;
    readonly VITE_NOTES_URL: string;
    readonly VITE_TAGS_URL: string;
    readonly VITE_AUTOMERGE_URL: string;
    readonly VITE_AUTH_URL: string;
    readonly VITE_SERVICE_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
