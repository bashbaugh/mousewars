import { Room, Client } from "colyseus"
import { Schema, type, MapSchema } from "@colyseus/schema"
import Paper from 'paper'
import { Size } from "paper/dist/paper-core"

Paper.setup(new Paper.Size([2000, 2000]))

const STARTING_SEGMENTS = 100
const SEGMENT_LENGTH = 5

class Player extends Schema {
  constructor (clientId: string) {
    super()
    this.clientId = clientId
    this.color = Paper.Color.random().toCSS(true)
  }

  @type('string') clientId: string
  @type('string') color: string

  @type('uint16') mouseX: number = 50
  @type('uint16') mouseY: number = 50
}

class PongState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>()
}

class Snake {
  path: paper.Path

  constructor (player: Player) {
    this.path = new Paper.Path({
      strokeColor: player.color,
      strokeWidth: 20,
      strokeCap: 'round',
      data: {
        playerId: player.clientId
      }
    })

    const start = Paper.view.center.divide(new Paper.Point(10, 1))
    for (let i = 0; i < STARTING_SEGMENTS; i++)
      this.path.add(start.add(new Paper.Point(i * SEGMENT_LENGTH, 0)))
  }

  update (playerState: Player) {
    this.path.firstSegment.point = new Paper.Point(playerState.mouseX, playerState.mouseY)
    for (var i = 0; i < STARTING_SEGMENTS - 1; i++) {
      var segment = this.path.segments[i]
      var nextSegment = segment.next
      var vector = segment.point.subtract(nextSegment.point)
      vector.length = SEGMENT_LENGTH
      nextSegment.point = segment.point.subtract(vector)
    }
    this.path.smooth({ type: 'continuous' })
  }
}

export default class SnakeRoom extends Room<PongState> {
  snakes: Record<string, Snake> = {}

  onCreate (options: any) {
    this.setState(new PongState()) // Set the state for the room
    this.setSimulationInterval(delta => this.update(delta), 30) // Set a "simulation interval" aka an update function (similar to the loop function in game.js)
    this.setPatchRate(30)
    this.maxClients = 5 // Only 2 players per Pong game

    this.onMessage('mousePoint', (client, msg) => {
      const p = this.state.players.get(client.id)
      p.mouseX = msg.point[1]
      p.mouseY = msg.point[2]

      const s = this.snakes[client.id]
      s.update(p)

      let a: any

      // a?.remove()

      console.log(
        s.path.hitTestAll(s.path.firstSegment.point)
        .map(hr => hr.item.data)
        // .filter(hitResult => hitResult.item.data.playerId !== client.id)
      )
    })
  }

  update (delta: number) {
    
  }

  startGame() {
    this.clock.start() // Start the game clock
  }

  onJoin (client: Client, options: any) {
    const p = new Player(client.id)
    this.state.players.set(client.id, p)
    this.snakes[client.id] = new Snake(p)
  }

  onLeave (client: Client, consented: boolean) {
    this.disconnect() // If a player leaves the game is unplayable, so destroy the room
  }
}
