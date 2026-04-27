import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useCanvasStore } from "../store/canvasStore";
import TopContextualToolbar from "../toolbar/TopContextualToolbar";
import ObjectActionMenu from "../toolbar/ObjectActionMenu";

function Workspace() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { setCanvas, setSelectedItem, setMenuPos, canvasWidth, canvasHeight, templateJson, workspaceSize, mmToPx } = useCanvasStore();

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const INTERNAL_SIZE = workspaceSize * mmToPx; // 2000px virtual grid

        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: "#f0f2f5",
            width: INTERNAL_SIZE,
            height: INTERNAL_SIZE,
            preserveObjectStacking: true,
        });

        const drawVistaprintGuides = () => {
            const centerX = INTERNAL_SIZE / 2;
            const centerY = INTERNAL_SIZE / 2;
            
            const trimW = canvasWidth * mmToPx;
            const trimH = canvasHeight * mmToPx;
            const bleedW = (canvasWidth + 2) * mmToPx; // 1mm extra each side
            const bleedH = (canvasHeight + 2) * mmToPx;
            const safeW = (canvasWidth - 2) * mmToPx;  // 1mm inside each side
            const safeH = (canvasHeight - 2) * mmToPx;

            // 1. FULL BLEED AREA
            const bleedRect = new fabric.Rect({
                left: centerX, top: centerY,
                width: bleedW, height: bleedH,
                fill: "transparent", stroke: "#ff9900", strokeDashArray: [5, 5],
                strokeWidth: 2, selectable: false, evented: false, originX: 'center', originY: 'center'
            });
            canvas.add(bleedRect);

            // 2. TRIM SIZE (Actual Product)
            const trimRect = new fabric.Rect({
                left: centerX, top: centerY,
                width: trimW, height: trimH,
                fill: "#ffffff", stroke: "#000000", strokeWidth: 1,
                selectable: false, evented: false, originX: 'center', originY: 'center',
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 15 })
            });
            canvas.add(trimRect);
            canvas.sendToBack(trimRect);

            // 3. SAFETY AREA
            const safeRect = new fabric.Rect({
                left: centerX, top: centerY,
                width: safeW, height: safeH,
                fill: "transparent", stroke: "#00a86d", strokeDashArray: [5, 5],
                strokeWidth: 2, selectable: false, evented: false, originX: 'center', originY: 'center'
            });
            canvas.add(safeRect);

            const labelStyle = { fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold', selectable: false, evented: false };
            
            const trimLabel = new fabric.Text(`Trim Size: ${canvasWidth}mm x ${canvasHeight}mm`, {
                ...labelStyle, fill: '#333', left: centerX, top: centerY - (bleedH / 2) - 40, originX: 'center'
            });
            
            const bleedLabel = new fabric.Text(`Full Bleed: ${canvasWidth + 2}mm x ${canvasHeight + 2}mm`, {
                ...labelStyle, fill: '#ff9900', left: centerX, top: centerY + (bleedH / 2) + 20, originX: 'center'
            });

            canvas.add(trimLabel, bleedLabel);

            return { safeRect };
        };

        const setupBoundaries = (safeRect: fabric.Rect) => {
            const sBounds = safeRect.getBoundingRect(true, true);

            canvas.on('object:moving', (e) => {
                const obj = e.target;
                if (!obj || !obj.selectable) return;

                const objBounds = obj.getBoundingRect(true, true);
                
                if (objBounds.left < sBounds.left) obj.set('left', obj.left! + (sBounds.left - objBounds.left));
                if (objBounds.top < sBounds.top) obj.set('top', obj.top! + (sBounds.top - objBounds.top));
                if (objBounds.left + objBounds.width > sBounds.left + sBounds.width) 
                    obj.set('left', obj.left! + (sBounds.left + sBounds.width - (objBounds.left + objBounds.width)));
                if (objBounds.top + objBounds.height > sBounds.top + sBounds.height) 
                    obj.set('top', obj.top! + (sBounds.top + sBounds.height - (objBounds.top + objBounds.height)));
            });

            // 🔥 CRASH FIX: Safe Fallbacks added
            const sync = () => {
                const active = canvas.getActiveObject() as any;
                if (active && active.selectable) {
                    setSelectedItem({
                        type: active.type || "",
                        text: active.text || "",
                        fontSize: active.fontSize || 0,
                        fill: active.fill || "#000000",
                        fontFamily: active.fontFamily || "Arial",
                        fontWeight: active.fontWeight || "normal",
                        fontStyle: active.fontStyle || "normal",
                        underline: active.underline || false,
                        linethrough: active.linethrough || false,
                        textAlign: active.textAlign || "left",
                        opacity: active.opacity ?? 1,
                        angle: active.angle || 0,
                        lineHeight: active.lineHeight || 1.16,
                        charSpacing: active.charSpacing || 0,
                        locked: active.lockMovementX || false
                    });
                    const b = active.getBoundingRect();
                    setMenuPos({ top: b.top, left: b.left + (b.width / 2) });
                } else {
                    setSelectedItem(null);
                    setMenuPos(null);
                }
            };
            
            canvas.on('selection:created', sync);
            canvas.on('selection:updated', sync);
            canvas.on('selection:cleared', sync);
            canvas.on('object:modified', sync);
        };

        const resize = () => {
            if (!containerRef.current) return;
            const size = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.9;
            const scale = size / INTERNAL_SIZE;
            canvas.setDimensions({ width: INTERNAL_SIZE * scale, height: INTERNAL_SIZE * scale });
            canvas.setZoom(scale);
        };

        const init = (data?: any) => {
            const finalSetup = () => {
                canvas.setWidth(INTERNAL_SIZE);
                canvas.setHeight(INTERNAL_SIZE);
                const objects = canvas.getObjects();
                
                if (objects.length > 0) {
                    const sel = new fabric.ActiveSelection(objects, { canvas });
                    const scale = Math.min((canvasWidth * mmToPx) / (sel.width || 1), (canvasHeight * mmToPx) / (sel.height || 1));
                    sel.scale(scale);
                    sel.center();
                    sel.destroy();
                }

                const { safeRect } = drawVistaprintGuides();
                setupBoundaries(safeRect);
                resize();
                setCanvas(canvas);
                canvas.renderAll();
            };

            if (data) canvas.loadFromJSON(data, finalSetup);
            else finalSetup();
        };

        if (templateJson) {
            fetch(templateJson).then(r => r.json()).then(d => init(d.fabric || d)).catch(() => init());
        } else {
            init();
        }

        window.addEventListener('resize', resize);
        return () => { window.removeEventListener('resize', resize); canvas.dispose(); };
    }, [canvasWidth, canvasHeight, templateJson, workspaceSize, mmToPx]);

    return (
        <div className="flex-1 bg-[#f2f2f4] relative flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden">
            <TopContextualToolbar />
            {/* 🔥 ZOOM FIX: Added min-h-0 so canvas doesn't stretch 2000px */}
            <div ref={containerRef} className="w-full flex-1 min-h-0 flex items-center justify-center mt-12 overflow-hidden">
                <div className="relative shadow-lg border border-gray-200">
                    <ObjectActionMenu />
                    <canvas ref={canvasRef} />
                </div>
            </div>
        </div>
    );
}

export default Workspace;
