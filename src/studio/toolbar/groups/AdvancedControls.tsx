import { Grid, RotateCw } from "lucide-react"
import Popover from "../../components/Popover"
import { useCanvasStore } from "../../store/canvasStore"
import { useState } from "react"

export default function AdvancedControls() {

    const { selectedItem, updateActiveObject } = useCanvasStore()
    const [activePopover, setActivePopover] = useState<string | null>(null)

    if (!selectedItem) return null

    return (
        <div className="flex items-center space-x-1">

            {/* Opacity */}
            <Popover
                id="opacity"
                activeId={activePopover}
                setActiveId={setActivePopover}
                icon={Grid}
            >
                <div className="p-4 w-56">

                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                        <span>Opacity</span>

                        <input
                            type="number"
                            value={Math.round(selectedItem.opacity * 100)}
                            onChange={(e) =>
                                updateActiveObject({
                                    opacity: parseInt(e.target.value) / 100
                                })
                            }
                            className="w-12 text-right border rounded px-1"
                        />
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedItem.opacity}
                        onChange={(e) =>
                            updateActiveObject({
                                opacity: parseFloat(e.target.value)
                            })
                        }
                        className="w-full accent-[#009ceb]"
                    />

                </div>
            </Popover>

            {/* Rotation */}
            <Popover
                id="rotation"
                activeId={activePopover}
                setActiveId={setActivePopover}
                icon={RotateCw}
            >
                <div className="p-4 w-56">

                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                        <span>Rotation</span>

                        <input
                            type="number"
                            value={Math.round(selectedItem.angle)}
                            onChange={(e) =>
                                updateActiveObject({
                                    angle: parseInt(e.target.value)
                                })
                            }
                            className="w-12 text-right border rounded px-1"
                        />
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={selectedItem.angle}
                        onChange={(e) =>
                            updateActiveObject({
                                angle: parseInt(e.target.value)
                            })
                        }
                        className="w-full accent-[#009ceb]"
                    />

                </div>
            </Popover>

        </div>
    )
}
