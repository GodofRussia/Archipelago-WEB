interface ImportMetaEnv {
    readonly VITE_YANDEX_API_KEY: string;
    readonly VITE_ZOOM_URL: string;
    readonly VITE_CHAT_URL: string;
    readonly VITE_NOTES_URL: string;
    readonly VITE_AUTOMERGE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
