import http from "http"
import path from "path"
import express from "express"
import { Server } from "colyseus"
import { monitor } from "@colyseus/monitor"
import SnakeRoom from "./SnakeRoom"

const port = 3001
const app = express() 

app.use(express.json())

const server = http.createServer(app)
const gameServer = new Server({ server })

gameServer.define('snake', SnakeRoom)

app.use('/colyseus', monitor()) 

gameServer.listen(port) // Finally, we start the server by listening to incoming requests.
console.log(`Listening on http://localhost:${ port }`)
