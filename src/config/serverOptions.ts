export type serverOptionsProp = {
    title: string,
    path: string,
}
export const serverOptionsConfig: serverOptionsProp[] = [
    {
        title: 'Máy chủ render',
        path: 'https://minesweeper-be.onrender.com',
    },
    {
        title: 'Máy chủ ngrok',
        path: 'https://toad-arriving-accurately.ngrok-free.app',
    },
    {
        title: 'Máy chủ Cloudflare Tunnel',
        path: 'https://0991-123-25-30-4.ngrok-free.app',
    }
]