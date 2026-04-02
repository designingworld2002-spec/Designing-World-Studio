import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify
} from "lucide-react"

import { useCanvasStore } from "../../store/canvasStore"

export default function AlignmentControls() {

    const { selectedItem, updateActiveObject } = useCanvasStore()

    if (!selectedItem) return null

    return (
        <div className="flex items-center space-x-1 p-1">

            <button
                onClick={() => updateActiveObject({ textAlign: "left" })}
                className={`p-2 rounded ${selectedItem?.textAlign === "left"
                    ? "bg-blue-50 text-[#009ceb]"
                    : "hover:bg-gray-50"
                    }`}
            >
                <AlignLeft size={18} />
            </button>

            <button
                onClick={() => updateActiveObject({ textAlign: "center" })}
                className={`p-2 rounded ${selectedItem?.textAlign === "center"
                    ? "bg-blue-50 text-[#009ceb]"
                    : "hover:bg-gray-50"
                    }`}
            >
                <AlignCenter size={18} />
            </button>

            <button
                onClick={() => updateActiveObject({ textAlign: "right" })}
                className={`p-2 rounded ${selectedItem?.textAlign === "right"
                    ? "bg-blue-50 text-[#009ceb]"
                    : "hover:bg-gray-50"
                    }`}
            >
                <AlignRight size={18} />
            </button>

            <button
                onClick={() => updateActiveObject({ textAlign: "justify" })}
                className={`p-2 rounded ${selectedItem?.textAlign === "justify"
                    ? "bg-blue-50 text-[#009ceb]"
                    : "hover:bg-gray-50"
                    }`}
            >
                <AlignJustify size={18} />
            </button>

        </div>
    )
}
