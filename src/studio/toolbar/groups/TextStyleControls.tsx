import { Bold, Italic, Underline, Strikethrough } from "lucide-react"
import { useCanvasStore } from "../../store/canvasStore"

export default function TextStyleControls() {

    const { selectedItem, updateActiveObject } = useCanvasStore()

    if (!selectedItem) return null

    return (
        <div className="flex items-center space-x-1 p-1 bg-white">

            {/* Bold */}
            <button
                onClick={() =>
                    updateActiveObject({
                        fontWeight:
                            selectedItem?.fontWeight === "bold"
                                ? "normal"
                                : "bold"
                    })
                }
                className={`p-2 rounded ${selectedItem.fontWeight === "bold"
                    ? "bg-gray-100 text-black"
                    : "hover:bg-gray-50"
                    }`}
            >
                <Bold size={18} />
            </button>

            {/* Italic */}
            <button
                onClick={() =>
                    updateActiveObject({
                        fontStyle:
                            selectedItem?.fontStyle === "italic"
                                ? "normal"
                                : "italic"
                    })
                }
                className={`p-2 rounded ${selectedItem.fontStyle === "italic"
                    ? "bg-gray-100 text-black"
                    : "hover:bg-gray-50"
                    }`}
            >
                <Italic size={18} />
            </button>

            {/* Underline */}
            <button
                onClick={() =>
                    updateActiveObject({
                        underline: !selectedItem.underline
                    })
                }
                className={`p-2 rounded ${selectedItem.underline
                    ? "bg-gray-100 text-black"
                    : "hover:bg-gray-50"
                    }`}
            >
                <Underline size={18} />
            </button>

            {/* Strikethrough */}
            <button
                onClick={() =>
                    updateActiveObject({
                        linethrough: !selectedItem.linethrough
                    })
                }
                className={`p-2 rounded ${selectedItem.linethrough
                    ? "bg-gray-100 text-black"
                    : "hover:bg-gray-50"
                    }`}
            >
                <Strikethrough size={18} />
            </button>

        </div>
    )
}
