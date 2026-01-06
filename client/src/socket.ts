import { io } from "socket.io-client"

const URL = "ws://localhost:3000"; // url websocket

export const socket = io(URL);