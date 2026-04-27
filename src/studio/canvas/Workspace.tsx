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

        // Internal resolution 2000x2000px (200mm workspace)
        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: "#f8f9fa",
            width: workspaceSize * mmToPx,
            height: workspaceSize * mmToPx,
            preserveObjectStacking: true,
        });

        // --- DRAW GUIDES & LABELS ---
        const drawGuides = () => {
            const centerX = canvas.getWidth() / 2;
            const centerY = canvas.getHeight() / 2;
            const pWidth = canvasWidth * mmToPx;
            const pHeight = canvasHeight * mmToPx;

            // 1. Bleed Area (Product Canvas Size)
            const bleedRect = new fabric.Rect({
                left: centerX,
                top: centerY,
                width: pWidth,
                height: pHeight,
                fill: "#ffffff",
                stroke: "#e0e0e0",
                strokeWidth: 1,
                selectable: false,
                evented: false,
                originX: 'center',
                originY: 'center',
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 10 })
            });
            canvas.add(bleedRect);

            // 2. Safe Area (1mm margin inside)
            const safeMargin = 1 * mmToPx;
            const safeRect = new fabric.Rect({
                left: centerX,
                top: centerY,
                width: pWidth - (safeMargin * 2),
                height: pHeight - (safeMargin * 2),
                fill: "transparent",
                stroke: "#00a86d",
                strokeDashArray: [5, 5],
                strokeWidth: 1,
                selectable: false,
                evented: false,
                originX: 'center',
                originY: 'center',
                opacity: 0.5
            });
            canvas.add(safeRect);

            // 3. Labels (Size Text)
            const sizeLabel = new fabric.Text(`${canvasWidth}mm x ${canvasHeight}mm`, {
                left: centerX,
                top: centerY + (pHeight / 2) + 20,
                fontSize: 14,
                fontFamily: 'Arial',
                fill: '#999',
                originX: 'center',
                selectable: false
            });
            canvas.add(sizeLabel);
            
            return { bleedRect, safeRect };
        };

        const { safeRect } = drawGuides();

        // --- RESTRICT OBJECTS TO SAFE AREA ---
        canvas.on('object:moving', (e) => {
            const obj = e.target;
            if (!obj) return;

            const bounds = obj.getBoundingRect();
            const sBounds = safeRect.getBoundingRect();

            // Prevent items from going outside the green dotted line
            if (bounds.left < sBounds.left) obj.set('left', sBounds.left + (obj.left! - bounds.left));
            if (bounds.top < sBounds.top) obj.set('top', sBounds.top + (obj.top! - bounds.top));
            if (bounds.left + bounds.width > sBounds.left + sBounds.width) 
                obj.set('left', sBounds.left + sBounds.width - bounds.width + (obj.left! - bounds.left));
            if (bounds.top + bounds.height > sBounds.top + sBounds.height) 
                obj.set('top', sBounds.top + sBounds.height - bounds.height + (obj.top! - bounds.top));
        });

        // Sync Selection Data to Zustand
        const syncReact = () => {
            const active = canvas.getActiveObject() as any;
            // Ignore guide layers
            if (active && active.type !== 'rect' && active.type !== 'text') {
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

        // --- RESPONSIVE SCALING (Fit to Window) ---
        const resizeCanvas = () => {
            if (!containerRef.current) return;
            const containerSize = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.95;
            const scale = containerSize / (workspaceSize * mmToPx);
            
            canvas.setDimensions({
                width: workspaceSize * mmToPx * scale,
                height: workspaceSize * mmToPx * scale
            }, { cssOnly: true });
            
            canvas.setZoom(scale);
        };

        // --- TEMPLATE LOADING ---
        if (templateJson) {
            fetch(templateJson).then(res => res.json()).then(data => {
                const fabricData = data.fabric || data;
                canvas.loadFromJSON(fabricData, () => {
                    canvas.renderAll();
                    resizeCanvas();
                });
            }).catch(err => console.error("Template load failed:", err));
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        setCanvas(canvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.dispose();
        };
    }, [canvasWidth, canvasHeight, templateJson, workspaceSize, mmToPx]);

    return (
        <div className="flex-1 bg-[#f2f2f4] relative flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden">
            <TopContextualToolbar />
            <div ref={containerRef} className="w-full h-full flex items-center justify-center mt-12">
                <div className="relative shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-[#f8f9fa] border border-gray-200">
                    <ObjectActionMenu />
                    <canvas ref={canvasRef} />
                </div>
            </div>
        </div>
    );
}

export default Workspace;
