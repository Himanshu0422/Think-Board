"use client";

import { useCallback, useState } from "react";
import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { CanvasMode, CanvasState } from "@/types/canvas";
import { useCanRedo, useCanUndo, useHistory, useMutation } from "@liveblocks/react";
import { CursorPresence } from "./cursorPresence";
import { pointerEventToCanvasPoint } from "@/lib/utils";

interface CanvsProps {
  boardId: string;
}

const Canvas = ({ boardId }: CanvsProps) => {

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState({x: 0, y: 0});

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY
    }))
  }, [])

  const onPinterMove = useMutation(({setMyPresence}, e: React.PointerEvent) => {
    e.preventDefault();
    const current = pointerEventToCanvasPoint(e, camera);
    setMyPresence({cursor: current})
  }, [])

  const onPointerLeave = useMutation(({setMyPresence}) => {
    setMyPresence({cursor: null})
  }, [])

  return (
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        undo={history.undo}
        redo={history.redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <svg className="h-[100vh] w-[100vw]" onWheel={onWheel} onPointerMove={onPinterMove} onPointerLeave={onPointerLeave}>
        <g>
          <CursorPresence />
        </g>
      </svg>
    </main>
  );
};

export default Canvas;
