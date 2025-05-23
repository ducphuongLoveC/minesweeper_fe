export type serverOptionsProp = {
    title: string,
    path: string,
}
export const serverOptionsConfig: serverOptionsProp[] = [
    {
        title: 'Máy chủ local',
        path: 'http://localhost:3000',
    },
    {
        title: 'Máy chủ ngrok',
        path: 'https://toad-arriving-accurately.ngrok-free.app',
    },
    {
        title: 'Máy chủ render',
        path: 'https://minesweeper-be.onrender.com',
    }
]
                                                    