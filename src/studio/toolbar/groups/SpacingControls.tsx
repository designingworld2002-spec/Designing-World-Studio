import { useCanvasStore } from "../../store/canvasStore"

export default function SpacingControls() {

    const { selectedItem, updateActiveObject } = useCanvasStore()

    if (!selectedItem) return null

    return (
        <div className="p-4 w-64 space-y-4">

            {/* Line Spacing */}
            <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                    <span>Line spacing</span>

                    <input
                        type="number"
                        value={selectedItem.lineHeight?.toFixed(1)}
                        onChange={(e) =>
                            updateActiveObject({
                                lineHeight: parseFloat(e.target.value)
                            })
                        }
                        className="w-12 text-right border rounded px-1"
                    />
                </div>

                <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={selectedItem.lineHeight}
                    onChange={(e) =>
                        updateActiveObject({
                            lineHeight: parseFloat(e.target.value)
                        })
                    }
                    className="w-full accent-[#009ceb]"
                />
            </div>

            {/* Letter Spacing */}
            <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                    <span>Letter spacing</span>

                    <input
                        type="number"
                        value={selectedItem.charSpacing}
                        onChange={(e) =>
                            updateActiveObject({
                                charSpacing: parseInt(e.target.value)
                            })
                        }
                        className="w-12 text-right border rounded px-1"
                    />
                </div>

                <input
                    type="range"
                    min="-100"
                    max="500"
                    step="10"
                    value={selectedItem.charSpacing}
                    onChange={(e) =>
                        updateActiveObject({
                            charSpacing: parseInt(e.target.value)
                        })
                    }
                    className="w-full accent-[#009ceb]"
                />
            </div>

        </div>
    )
}
