import { Room, Client } from "colyseus"
import { Schema, type, ArraySchema } from "@colyseus/schema"

class Player extends Schema {
  @type('string')
  clientId: string // We'll use this to keep track of which player is which
}

class PongState extends Schema {
  @type([Player]) players = new ArraySchema<Player>()
}

export default class SnakeRoom extends Room {
  onCreate (options: any) {
    this.setState(new PongState()) // Set the state for the room
    this.setSimulationInterval(delta => this.update(delta)) // Set a "simulation interval" aka an update function (similar to the loop function in game.js)
    this.setPatchRate(40) // The patch rate determines the interval (in milliseconds) at which the server sends state updates to the client
    this.maxClients = 2 // Only 2 players per Pong game

    this.onMessage('path', (client, msg) => {
      console.log(msg)
    })
  }

  update (delta: number) {
    
  }

  startGame() {
    this.clock.start() // Start the game clock
  }

  onJoin (client: Client, options: any) {

  }

  onLeave (client: Client, consented: boolean) {
    this.disconnect() // If a player leaves the game is unplayable, so destroy the room
  }
}
