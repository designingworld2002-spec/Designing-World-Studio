import { create } from 'zustand';
import { fabric } from 'fabric';

export interface SelectedItemState {
    type: string;
    text: string;
    fontSize: number;
    fill: string;
    fontFamily: string;
    fontWeight: string | number;
    fontStyle: string;
    underline: boolean;
    linethrough: boolean;
    textAlign: string;
    lineHeight: number;
    charSpacing: number;
    opacity: number;
    angle: number;
    locked: boolean;
    textBackgroundColor?: string;
}

interface CanvasState {
    activeTab: string | null;
    setActiveTab: (tab: string | null) => void;

    canvasWidth: number;
    canvasHeight: number;
    workspaceSize: number;
    mmToPx: number;
    productTitle: string;
    templateJson: string | null;
    studioMode: string | null;
    initStudioConfig: (config: { width?: number, height?: number, productTitle?: string, templateJson?: string, mode?: string }) => void;

    canvas: fabric.Canvas | null;
    setCanvas: (canvas: fabric.Canvas) => void;

    selectedItem: SelectedItemState | null;
    setSelectedItem: (item: SelectedItemState | null) => void;

    menuPos: { top: number; left: number } | null;
    setMenuPos: (pos: { top: number; left: number } | null) => void;

    addText: (text: string) => void;
    updateActiveObject: (props: any) => void;
    deleteActiveObject: () => void;
    duplicateActiveObject: () => void;
    lockActiveObject: () => void;
    arrangeActiveObject: (
        action: 'front' | 'forward' | 'backward' | 'back'
    ) => void;
    applyTextEffect: (effect: string) => void;
    alignObject: (position: "left" | "center" | "right") => void;
    flipObject: (direction: "horizontal" | "vertical") => void;
    addImage: (url: string) => void;
    setCanvasBackground: (color: string) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    activeTab: 'text',
    setActiveTab: (tab) => set({ activeTab: tab }),
    
    canvasWidth: 70, 
    canvasHeight: 55,
    workspaceSize: 200, // 200mm fixed virtual workspace
    mmToPx: 10,
    productTitle: 'Woven Labels',
    templateJson: null,
    studioMode: null,
    
    initStudioConfig: (config) => set((state) => ({
        canvasWidth: config.width || state.canvasWidth,
        canvasHeight: config.height || state.canvasHeight,
        productTitle: config.productTitle || state.productTitle,
        templateJson: config.templateJson || state.templateJson,
        studioMode: config.mode || state.studioMode,
    })),

    canvas: null,
    setCanvas: (canvas) => set({ canvas }),

    selectedItem: null,
    setSelectedItem: (item) => set({ selectedItem: item }),

    menuPos: null,
    setMenuPos: (pos) => set({ menuPos: pos }),

    addText: (textString) => {
        const { canvas } = get();
        if (!canvas) return;

        const text = new fabric.IText(textString, {
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Arimo',
            fontSize: 70,
            fill: '#333333',
            objectCaching: false
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    },

    updateActiveObject: (props) => {
        const { canvas } = get()
        if (!canvas) return

        const obj = canvas.getActiveObject()
        if (!obj) return

        obj.set(props)
        obj.setCoords()

        canvas.requestRenderAll()

        // sync Zustand state with fabric object
        set({
            selectedItem: {
                type: obj.type || "",
                text: (obj as any).text || "",
                fontSize: (obj as any).fontSize || 0,
                fontFamily: (obj as any).fontFamily || "",
                fontWeight: (obj as any).fontWeight || "normal",
                fontStyle: (obj as any).fontStyle || "normal",
                underline: (obj as any).underline || false,
                linethrough: (obj as any).linethrough || false,
                fill: (obj as any).fill || "#000000",
                textAlign: (obj as any).textAlign || "left",
                lineHeight: (obj as any).lineHeight || 1,
                charSpacing: (obj as any).charSpacing || 0,
                opacity: obj.opacity || 1,
                angle: obj.angle || 0,
                locked: obj.lockMovementX ?? false
            }
        })
    },

    deleteActiveObject: () => {
        const { canvas } = get();
        const activeObjects = canvas?.getActiveObjects();

        if (activeObjects?.length) {
            activeObjects.forEach((obj) => canvas?.remove(obj));
            canvas?.discardActiveObject();
            set({ selectedItem: null });
        }
    },

    duplicateActiveObject: () => {
        const { canvas } = get();
        const activeObject = canvas?.getActiveObject();

        if (!activeObject || !canvas) return;

        activeObject.clone((cloned: any) => {
            cloned.set({
                left: (cloned.left || 0) + 20,
                top: (cloned.top || 0) + 20,
            });

            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
        });
    },

    lockActiveObject: () => {
        const { canvas } = get();
        const obj = canvas?.getActiveObject();
        if (!obj || !canvas) return;

        const isLocked = !obj.lockMovementX;

        obj.set({
            lockMovementX: isLocked,
            lockMovementY: isLocked,
            lockRotation: isLocked,
            lockScalingX: isLocked,
            lockScalingY: isLocked
        });

        // 🔑 CRITICAL FIX
        canvas.discardActiveObject();
        canvas.setActiveObject(obj);

        obj.setCoords();
        canvas.requestRenderAll();
    },

    arrangeActiveObject: (action) => {
        const { canvas } = get();
        const obj = canvas?.getActiveObject();

        if (!obj || !canvas) return;

        if (action === 'front') canvas.bringToFront(obj);
        if (action === 'forward') canvas.bringForward(obj);
        if (action === 'backward') canvas.sendBackwards(obj);
        if (action === 'back') canvas.sendToBack(obj);

        canvas.renderAll();
    },

    applyTextEffect: (effect) => {
        const { canvas } = get();
        const obj = canvas?.getActiveObject() as fabric.IText;

        if (!obj || obj.type !== 'i-text') return;

        obj.set('shadow', undefined);

        if (effect === 'shadow') {
            obj.set(
                'shadow',
                new fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: 4,
                    offsetX: 3,
                    offsetY: 3,
                })
            );
        }

        canvas?.renderAll();
    },
    alignObject: (position) => {
        const { canvas } = get()
        if (!canvas) return

        const obj = canvas.getActiveObject()
        if (!obj) return

        const canvasWidth = canvas.getWidth()

        if (position === "left") {
            obj.set({ left: 10 })
        }

        if (position === "center") {
            obj.set({ left: canvasWidth / 2 - obj.getScaledWidth() / 2 })
        }

        if (position === "right") {
            obj.set({ left: canvasWidth - obj.getScaledWidth() })
        }

        obj.setCoords()
        canvas.requestRenderAll()
    },
    flipObject: (direction) => {
        const { canvas } = get()
        if (!canvas) return

        const obj = canvas.getActiveObject()
        if (!obj) return

        if (direction === "horizontal") {
            obj.toggle("flipX")
        }

        if (direction === "vertical") {
            obj.toggle("flipY")
        }

        canvas.requestRenderAll()
    },
    addImage: (url) => {
        const { canvas } = get();
        if (!canvas) return;

        fabric.Image.fromURL(url, (img) => {
            // Scale down image if it's too large
            const maxWidth = canvas.getWidth() * 0.8;
            const maxHeight = canvas.getHeight() * 0.8;
            
            if (img.width! > maxWidth || img.height! > maxHeight) {
                const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
                img.scale(scale);
            }

            img.set({
                left: canvas.getWidth() / 2,
                top: canvas.getHeight() / 2,
                originX: 'center',
                originY: 'center',
                objectCaching: false
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    },
    setCanvasBackground: (color) => {
        const { canvas } = get();
        if (!canvas) return;

        canvas.setBackgroundColor(color, () => {
            canvas.renderAll();
        });
    },
}));
