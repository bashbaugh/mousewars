import React, { memo, useEffect, useRef } from 'react'
import Paper from 'paper'
import * as Colyseus from 'colyseus.js'

// const tool = new Paper.Tool()

const STARTING_SEGMENTS = 100
const SEGMENT_LENGTH = 5

const client = new Colyseus.Client('ws://localhost:3001')

class Snake {
  path: paper.Path

  constructor (color: string) {
    this.path = new Paper.Path({
      strokeColor: color,
      strokeWidth: 20,
      strokeCap: 'round'
    })

    const start = Paper.view.center.divide(new Paper.Point(10, 1))
    for (let i = 0; i < STARTING_SEGMENTS; i++)
      this.path.add(start.add(new Paper.Point(i * SEGMENT_LENGTH, 0)))
  }

  update (playerState: any) {
    this.path.strokeColor = playerState.color
    this.path.firstSegment.point = new Paper.Point(playerState.mouseX, playerState.mouseY)
    for (var i = 0; i < STARTING_SEGMENTS - 1; i++) {
      var segment = this.path.segments[i]
      var nextSegment = segment.next
      var vector = segment.point.subtract(nextSegment.point)
      vector.length = SEGMENT_LENGTH
      nextSegment.point = segment.point.subtract(vector)
    }
    this.path.smooth({ type: 'continuous' })

    console.log(
      this.path.hitTestAll(this.path.firstSegment.point)
      // .map(hr => hr.item.data)
      .forEach(hr => {
        
      })
      // .filter(hitResult => hitResult.item.data.playerId !== client.id)
    )
  }
}

function initialize() {
  // tool.onMouseMove = (e: paper.ToolEvent) => {
  //   blobs.push(new Blob(e))
  // }

  let room: Colyseus.Room
  let snakes: Record<string, Snake> = {}

  client.joinOrCreate("snake").then(r => {
    console.log(r.sessionId, "joined", r.name);
    room = r

    room.onStateChange(state => {
      for (const player of state.players.values()) {
        if (!snakes[player.clientId]) snakes[player.clientId] = new Snake(player.color)
        snakes[player.clientId].update(player)
      }
    })
  }).catch(e => {
      console.log("JOIN ERROR", e);
  })

  Paper.view.on('mousemove', (e: paper.ToolEvent) => {
    room?.send('mousePoint', { point: e.point })
  })

  Paper.view.on('frame', (e: any) => {
    
  })
}

const MouseBlobs: React.FC = props => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    Paper.setup(ref.current!)

    initialize()

    return () => {
      Paper.view.remove()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      {...props}
      style={{
        width: '100vw',
        height: '100vh'
      }}
    />
  )
}

export default memo(MouseBlobs)