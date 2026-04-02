import { useState } from "react";
import { useCanvasStore } from "../store/canvasStore";

import {
    Lock,
    Unlock,
    Copy,
    Trash2,
    MoreHorizontal,
    //ArrowUpToLine,
    //ArrowUp,
    //ArrowDown,
    //ArrowDownToLine
} from "lucide-react";

function ObjectActionMenu() {
    const { selectedItem, menuPos, lockActiveObject, duplicateActiveObject, deleteActiveObject, arrangeActiveObject } = useCanvasStore();
    const [showMore, setShowMore] = useState(false);

    if (!selectedItem || !menuPos) return null;

    return (
        <div
            className="absolute z-40 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center p-1 space-x-0.5 -translate-x-1/2 -translate-y-full mb-4 transition-all duration-75"
            style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
        >
            <button onClick={lockActiveObject} className={`p-2 rounded-lg ${selectedItem.locked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-100'}`} title="Lock">
                {selectedItem.locked ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
            <button onClick={duplicateActiveObject} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Duplicate"><Copy size={18} /></button>
            <button onClick={deleteActiveObject} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Delete"><Trash2 size={18} /></button>

            <div className="w-px h-5 bg-gray-200 mx-1"></div>

            <div className="relative">
                <button onClick={() => setShowMore(!showMore)} className={`p-2 rounded-lg ${showMore ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-100'}`} title="More Options"><MoreHorizontal size={18} /></button>
                {showMore && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 w-56 z-50">

                        {/* Copy style */}
                        <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3">
                            <Copy size={16} />
                            <span>Copy style</span>
                        </button>

                        {/* Arrange */}
                        <div className="group relative">
                            <button className="w-full px-4 py-3 text-sm hover:bg-gray-50 flex justify-between items-center">
                                <span>Arrange</span>
                                <span>›</span>
                            </button>

                            <div className="absolute left-full top-0 hidden group-hover:block bg-white border shadow-xl rounded-lg w-48">
                                <button onClick={() => arrangeActiveObject('front')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Bring to front</button>
                                <button onClick={() => arrangeActiveObject('forward')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Bring forward</button>
                                <button onClick={() => arrangeActiveObject('backward')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Send backward</button>
                                <button onClick={() => arrangeActiveObject('back')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Send to back</button>
                            </div>
                        </div>

                        {/* Align */}
                        <div className="group relative">
                            <button className="w-full px-4 py-3 text-sm hover:bg-gray-50 flex justify-between items-center">
                                <span>Align</span>
                                <span>›</span>
                            </button>

                            <div className="absolute left-full top-0 hidden group-hover:block bg-white border shadow-xl rounded-lg w-48">
                                <button onClick={() => useCanvasStore.getState().alignObject('left')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Left</button>
                                <button onClick={() => useCanvasStore.getState().alignObject('center')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Center</button>
                                <button onClick={() => useCanvasStore.getState().alignObject('right')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Right</button>
                            </div>
                        </div>

                        {/* Flip */}
                        <div className="group relative">
                            <button className="w-full px-4 py-3 text-sm hover:bg-gray-50 flex justify-between items-center">
                                <span>Flip</span>
                                <span>›</span>
                            </button>

                            <div className="absolute left-full top-0 hidden group-hover:block bg-white border shadow-xl rounded-lg w-48">
                                <button onClick={() => useCanvasStore.getState().flipObject('horizontal')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Horizontal</button>
                                <button onClick={() => useCanvasStore.getState().flipObject('vertical')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Vertical</button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default ObjectActionMenu;
