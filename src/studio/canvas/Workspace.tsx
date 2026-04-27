import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useCanvasStore } from "../store/canvasStore";
import TopContextualToolbar from "../toolbar/TopContextualToolbar";
import ObjectActionMenu from "../toolbar/ObjectActionMenu";

function Workspace() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 🔥 STORE SE NAYE DYNAMIC VARIABLES NIKALE
    const { setCanvas, setSelectedItem, setMenuPos, canvasWidth, canvasHeight, templateJson } = useCanvasStore();

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Initialize Canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: "#ffffff",
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

        // 🔥 LOGIC: CANVAS SIZING AND TEMPLATE LOADING
        const loadCanvasData = async () => {
            // 1mm = 10px (High Resolution Internal Canvas)
            let internalWidth = canvasWidth * 10;
            let internalHeight = canvasHeight * 10;

            if (templateJson) {
                try {
                    // Shopify se JSON fetch kar raha hai
                    const response = await fetch(templateJson);
                    const data = await response.json();
                    const fabricData = data.fabric || data; // Handle generator format

                    await new Promise((resolve) => {
                        canvas.loadFromJSON(fabricData, () => {
                            // JSON load hone ke baad dimensions update kar lo
                            internalWidth = canvas.getWidth();
                            internalHeight = canvas.getHeight();
                            resolve(true);
                        });
                    });
                } catch (err) {
                    console.error("Failed to load template:", err);
                }
            }

            // Internal Canvas Quality set ki
            canvas.setWidth(internalWidth);
            canvas.setHeight(internalHeight);

            // CSS Responsive Scaling Logic
            const resizeCanvasCSS = () => {
                if (containerRef.current) {
                    const width = containerRef.current.clientWidth;
                    const height = containerRef.current.clientHeight;
                    // Fabric canvas ko wrapper div ke size me fit kar deta hai
                    canvas.setDimensions({ width, height }, { cssOnly: true });
                }
            };

            resizeCanvasCSS();
            window.addEventListener('resize', resizeCanvasCSS);
            
            setCanvas(canvas);
            canvas.renderAll();

            return () => window.removeEventListener('resize', resizeCanvasCSS);
        };

        loadCanvasData();

        return () => {
            canvas.dispose();
        };
    }, [setCanvas, setSelectedItem, setMenuPos, canvasWidth, canvasHeight, templateJson]); // 🔥 Ye variables change hone par canvas reload hoga

    return (
        <div className="flex-1 bg-[#f2f2f4] relative flex flex-col items-center justify-center overflow-hidden w-full h-full p-8">

            {/* Floating Pill Toolbar */}
            <TopContextualToolbar />

            {/* 🔥 DYNAMIC ASPECT RATIO CONTAINER */}
            <div 
                ref={containerRef} 
                style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
                className="relative w-full max-h-[80%] max-w-[800px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-300 mt-8"
            >
                {/* Local Object Action Menu */}
                <ObjectActionMenu />

                {/* SAFETY AREA BORDER (approx 2mm inside) */}
                <div className="absolute top-[3%] bottom-[3%] left-[3%] right-[3%] border border-[#00a86d] border-dashed opacity-50 pointer-events-none z-30 flex items-start justify-center">
                    <span className="bg-white text-[#00a86d] text-[10px] font-bold px-2 mt-[-8px] rounded-full border border-[#00a86d] shadow-sm">
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
