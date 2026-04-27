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

        // 1. Initialize Canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: "#f8f9fa",
            width: workspaceSize * mmToPx,
            height: workspaceSize * mmToPx,
            preserveObjectStacking: true,
        });

        // 2. Function to draw guides (Bleed & Safe Area)
        const drawGuides = () => {
            const centerX = canvas.getWidth() / 2;
            const centerY = canvas.getHeight() / 2;
            const pWidth = canvasWidth * mmToPx;
            const pHeight = canvasHeight * mmToPx;

            const bleedRect = new fabric.Rect({
                left: centerX, top: centerY,
                width: pWidth, height: pHeight,
                fill: "#ffffff", stroke: "#e0e0e0", strokeWidth: 1,
                selectable: false, evented: false, originX: 'center', originY: 'center',
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 10 })
            });
            canvas.add(bleedRect);
            canvas.sendToBack(bleedRect); // Ensure white box is always behind the design

            const safeMargin = 1 * mmToPx;
            const safeRect = new fabric.Rect({
                left: centerX, top: centerY,
                width: pWidth - (safeMargin * 2), height: pHeight - (safeMargin * 2),
                fill: "transparent", stroke: "#00a86d", strokeDashArray: [5, 5], strokeWidth: 1,
                selectable: false, evented: false, originX: 'center', originY: 'center', opacity: 0.5
            });
            canvas.add(safeRect);

            const sizeLabel = new fabric.Text(`${canvasWidth}mm x ${canvasHeight}mm`, {
                left: centerX, top: centerY + (pHeight / 2) + 20,
                fontSize: 14, fontFamily: 'Arial', fill: '#999', originX: 'center', selectable: false, evented: false
            });
            canvas.add(sizeLabel);

            return { bleedRect, safeRect };
        };

        // 3. Setup boundary restrictions and sync
        const setupEvents = (safeRect: fabric.Rect) => {
            canvas.on('object:moving', (e) => {
                const obj = e.target;
                if (!obj || (obj.type === 'rect' && !obj.selectable)) return;

                const bounds = obj.getBoundingRect();
                const sBounds = safeRect.getBoundingRect();

                // Prevent moving outside the green dashed line
                if (bounds.left < sBounds.left) obj.set('left', sBounds.left + (obj.left! - bounds.left));
                if (bounds.top < sBounds.top) obj.set('top', sBounds.top + (obj.top! - bounds.top));
                if (bounds.left + bounds.width > sBounds.left + sBounds.width) 
                    obj.set('left', sBounds.left + sBounds.width - bounds.width + (obj.left! - bounds.left));
                if (bounds.top + bounds.height > sBounds.top + sBounds.height) 
                    obj.set('top', sBounds.top + sBounds.height - bounds.height + (obj.top! - bounds.top));
            });

            const syncReact = () => {
                const active = canvas.getActiveObject() as any;
                if (active && active.selectable) {
                    setSelectedItem({
                        type: active.type, text: active.text || "", fontSize: active.fontSize, fill: active.fill,
                        fontFamily: active.fontFamily, fontWeight: active.fontWeight, fontStyle: active.fontStyle,
                        underline: active.underline, linethrough: active.linethrough || false, textAlign: active.textAlign,
                        opacity: active.opacity, angle: active.angle, lineHeight: active.lineHeight || 1.16,
                        charSpacing: active.charSpacing || 0, locked: active.lockMovementX || false, textBackgroundColor: active.textBackgroundColor
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
        };

        // 4. Responsive scaling to fit window
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

        // 5. The Master Sequence: Load -> Scale -> Draw Guides
        const initializeWorkspace = (fabricData?: any) => {
            const finishSetup = () => {
                // Restore internal high-res size
                canvas.setWidth(workspaceSize * mmToPx);
                canvas.setHeight(workspaceSize * mmToPx);
                canvas.backgroundColor = "#f8f9fa";

                const objects = canvas.getObjects();
                if (objects.length > 0) {
                    const pWidth = canvasWidth * mmToPx;
                    const pHeight = canvasHeight * mmToPx;

                    // Group loaded objects to manipulate them as a single block
                    const sel = new fabric.ActiveSelection(objects, { canvas });

                    // Scale proportionally to fit inside the given width x height
                    const scaleX = pWidth / sel.width!;
                    const scaleY = pHeight / sel.height!;
                    const scale = Math.min(scaleX, scaleY);

                    sel.scale(scale);
                    sel.set({
                        left: (workspaceSize * mmToPx) / 2,
                        top: (workspaceSize * mmToPx) / 2,
                        originX: 'center',
                        originY: 'center'
                    });
                    sel.setCoords();
                    sel.destroy(); // Ungroups them back onto the canvas perfectly positioned
                }

                // Now that template is loaded and centered, draw guides on top
                const { safeRect } = drawGuides();
                setupEvents(safeRect);
                resizeCanvas();
                setCanvas(canvas);
                canvas.renderAll();
            };

            if (fabricData) {
                canvas.loadFromJSON(fabricData, finishSetup);
            } else {
                finishSetup();
            }
        };

        if (templateJson) {
            fetch(templateJson)
                .then(res => res.json())
                .then(data => initializeWorkspace(data.fabric || data))
                .catch(err => {
                    console.error("Template load failed:", err);
                    initializeWorkspace(); // Load empty if JSON fails
                });
        } else {
            initializeWorkspace();
        }

        window.addEventListener('resize', resizeCanvas);

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
