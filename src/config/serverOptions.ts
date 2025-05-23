export type serverOptionsProp = {
    title: string,
    path: string,
}
export const serverOptionsConfig: serverOptionsProp[] = [

    {
        title: 'Máy chủ ngrok',
        path: 'https://toad-arriving-accurately.ngrok-free.app',
    },
    {
        title: 'Máy chủ render',
        path: 'https://minesweeper-be.onrender.com',
    },
    {
        title: 'Máy chủ local (server của dev)',
        path: 'http://localhost:3000',
    },
]
