import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useCanvasStore } from "../store/canvasStore";
import TopContextualToolbar from "../toolbar/TopContextualToolbar";
import ObjectActionMenu from "../toolbar/ObjectActionMenu";

function Workspace() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { setCanvas, setSelectedItem, setMenuPos } = useCanvasStore();

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: "#ffffff",
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            preserveObjectStacking: true,
            renderOnAddRemove: true,
            enableRetinaScaling: true,
            skipTargetFind: false
        });

        canvas.selection = true;

        const syncReact = () => {
            const active = canvas.getActiveObject() as any;
            if (active) {
                setSelectedItem({
                    type: active.type,
                    text: active.text || "",
                    fontSize: active.fontSize,
                    fill: active.fill,
                    fontFamily: active.fontFamily,
                    fontWeight: active.fontWeight,
                    fontStyle: active.fontStyle,
                    underline: active.underline,
                    linethrough: active.linethrough || false,
                    textAlign: active.textAlign,
                    opacity: active.opacity,
                    angle: active.angle,
                    lineHeight: active.lineHeight || 1.16,
                    charSpacing: active.charSpacing || 0,
                    locked: active.lockMovementX || false,
                    textBackgroundColor: active.textBackgroundColor
                });

                // Glue the action menu exactly to the top center of the active object
                const bound = active.getBoundingRect();
                setMenuPos({ top: bound.top, left: bound.left + (bound.width / 2) });
            } else {
                setSelectedItem(null);
                setMenuPos(null);
            }
        };
        canvas.on('selection:created', syncReact);
        canvas.on('selection:updated', syncReact);
        canvas.on('selection:cleared', syncReact);
        canvas.on('object:modified', syncReact);
        canvas.on('object:scaling', syncReact);
        canvas.on('object:rotating', syncReact);
        canvas.on('text:changed', syncReact);

        setCanvas(canvas);

        const handleResize = () => {
            if (containerRef.current) {
                canvas.setWidth(containerRef.current.clientWidth);
                canvas.setHeight(containerRef.current.clientHeight);
                canvas.renderAll();
                syncReact();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.dispose();
        };
    }, [setCanvas, setSelectedItem, setMenuPos]);

    return (
        <div className="flex-1 bg-[#f2f2f4] relative flex flex-col items-center justify-center overflow-hidden w-full h-full">

            {/* Floating Pill Toolbar */}
            <TopContextualToolbar />

            {/* Center Product Wrapper */}
            <div ref={containerRef} className="relative w-full max-w-[700px] aspect-[4/3] bg-white shadow-2xl border border-gray-200 mt-12">

                {/* Local Object Action Menu */}
                <ObjectActionMenu />

                {/* SAFE AREA MASK */}
                <div className="absolute inset-0 pointer-events-none z-20">

                    {/* Top mask */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-white"></div>

                    {/* Bottom mask */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-white"></div>

                    {/* Left mask */}
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-white"></div>

                    {/* Right mask */}
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-white"></div>

                </div>

                <div className="absolute inset-8 border border-[#00a86d] border-dashed opacity-40 pointer-events-none z-30 flex items-start justify-center">
                    <span className="bg-white text-[#00a86d] text-[10px] font-bold px-2 mt-[-8px] rounded-full border border-[#00a86d]">
                        Safety Area
                    </span>
                </div>

                {/* Fabric.js Graphics Layer */}
                <canvas ref={canvasRef} className="absolute inset-0 z-0" />
            </div>

        </div>
    );
}

export default Workspace;
