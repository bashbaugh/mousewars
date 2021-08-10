import React, { memo, useEffect, useRef } from 'react'
import Paper from 'paper'
import * as Colyseus from 'colyseus.js'

// const tool = new Paper.Tool()

const STARTING_SEGMENTS = 100
const SEGMENT_LENGTH = 5

const client = new Colyseus.Client('ws://localhost:3001')

function draw() {
  // tool.onMouseMove = (e: paper.ToolEvent) => {
  //   blobs.push(new Blob(e))
  // }

  let room: Colyseus.Room

  client.joinOrCreate("snake").then(r => {
    console.log(r.sessionId, "joined", r.name);
    room = r
  }).catch(e => {
      console.log("JOIN ERROR", e);
  })

  const path = new Paper.Path({
    strokeColor: '#E4141B',
    strokeWidth: 20,
    strokeCap: 'round'
  })

  var start = Paper.view.center.divide(new Paper.Point(10, 1))
  for (var i = 0; i < STARTING_SEGMENTS; i++)
	  path.add(start.add(new Paper.Point(i * SEGMENT_LENGTH, 0)))

  Paper.view.on('mousemove', (e: paper.ToolEvent) => {
    path.firstSegment.point = e.point;
    for (var i = 0; i < STARTING_SEGMENTS - 1; i++) {
      var segment = path.segments[i];
      var nextSegment = segment.next;
      var vector = segment.point.subtract(nextSegment.point)
      vector.length = SEGMENT_LENGTH;
      nextSegment.point = segment.point.subtract(vector)
    }
    path.smooth({ type: 'continuous' });
    room?.send('path', { 
      segments: path.segments
    })
    
  })

  Paper.view.on('frame', (e: any) => {

  })
}

const MouseBlobs: React.FC = props => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    Paper.setup(ref.current!)

    draw()

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