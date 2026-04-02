import { useState } from "react";
import { useCanvasStore } from "../store/canvasStore";
import Popover from "../components/Popover";
import TextStyleControls from "./groups/TextStyleControls"
import AlignmentControls from "./groups/AlignmentControls"
import SpacingControls from "./groups/SpacingControls"
import AdvancedControls from "./groups/AdvancedControls"
import MoreToolsControls from "./groups/MoreToolsControls"
import {
    AlignLeft,
    List,
    ListOrdered,
    RotateCw,
    ChevronDown,
    ChevronsUpDown,
    Grid,
    Type as TypeIcon,
    Layers,
    Maximize,
    Spline,
    MoreHorizontal
} from "lucide-react";

function TopContextualToolbar() {
    const { selectedItem, updateActiveObject } = useCanvasStore();
    const [activePopover, setActivePopover] = useState<string | null>(null);

    if (!selectedItem) return null;

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 h-[56px] bg-white shadow-xl border border-gray-200 rounded-xl z-30 flex items-center px-3 transition-all duration-300 w-auto max-w-[95%]">

            {selectedItem.type === 'i-text' && (
                <div className="flex items-center space-x-1 w-full">

                    {/* Font Selector */}
                    <div className="relative group min-w-[110px] mx-1">
                        <select
                            className="w-full text-sm font-bold border border-gray-300 rounded-lg px-3 py-1.5 outline-none cursor-pointer appearance-none hover:bg-gray-50 focus:border-[#009ceb]"
                            value={selectedItem.fontFamily}
                            onChange={(e) => updateActiveObject({ fontFamily: e.target.value })}
                        >
                            <option value="Arimo">Arimo</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                    </div>

                    {/* Size Selector */}
                    <div className="relative group w-[70px] mx-1">
                        <select
                            className="w-full text-sm font-bold border border-gray-300 rounded-lg px-2 py-1.5 outline-none cursor-pointer appearance-none hover:bg-gray-50 focus:border-[#009ceb]"
                            value={Math.round(selectedItem.fontSize)}
                            onChange={(e) => updateActiveObject({ fontSize: parseInt(e.target.value) })}
                        >
                            {[12, 16, 24, 32, 48, 60, 70, 96, 120].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                    </div>

                    {/* Color Picker */}
                    <Popover id="color" activeId={activePopover} setActiveId={setActivePopover} customIcon={<div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ backgroundColor: selectedItem.fill }} />}>
                        <div className="p-2 w-64">
                            <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Color Palette</div>
                            <div className="grid grid-cols-6 gap-2">
                                {['#000000', '#ffffff', '#333333', '#808080', '#d24345', '#f07000', '#f4a261', '#e9c46a', '#2a9d8f', '#00a86d', '#009ceb', '#023e8a', '#3f37c9', '#7209b7', '#b5179e', '#f72585'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            updateActiveObject({ fill: color });
                                            if (selectedItem.textBackgroundColor === '#009ceb') updateActiveObject({ textBackgroundColor: 'transparent' });
                                            setActivePopover(null);
                                        }}
                                        className="w-8 h-8 rounded-full border border-gray-200 hover:scale-110 hover:shadow-md transition-transform"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </Popover>

                    {/* Formatting (B/I/U) */}
                    <Popover
                        id="formatting"
                        activeId={activePopover}
                        setActiveId={setActivePopover}
                        customIcon={<div className="font-bold underline text-lg leading-none italic">B</div>}
                    >
                        <TextStyleControls />
                    </Popover>

                    {/* Alignment */}
                    <Popover
                        id="alignment"
                        activeId={activePopover}
                        setActiveId={setActivePopover}
                        icon={AlignLeft}
                    >
                        <AlignmentControls />
                    </Popover>

                    {/* Lists */}
                    <Popover id="lists" activeId={activePopover} setActiveId={setActivePopover} icon={List}>
                        <div className="flex items-center space-x-1 p-1">
                            <button onClick={() => updateActiveObject({ text: `• ${selectedItem.text.replace(/^• /g, '')}` })} className="p-2 hover:bg-gray-50 rounded"><List size={18} /></button>
                            <button onClick={() => updateActiveObject({ text: `1. ${selectedItem.text.replace(/^[0-9]+\. /g, '')}` })} className="p-2 hover:bg-gray-50 rounded"><ListOrdered size={18} /></button>
                        </div>
                    </Popover>

                    {/* Spacing */}
                    <Popover
                        id="spacing"
                        activeId={activePopover}
                        setActiveId={setActivePopover}
                        icon={ChevronsUpDown}
                    >
                        <SpacingControls />
                    </Popover>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    {/* Format (Casing) */}
                    <Popover id="format" activeId={activePopover} setActiveId={setActivePopover} label="Format">
                        <div className="flex items-center space-x-2 p-2">
                            <button onClick={() => { updateActiveObject({ textCase: 'title' }); setActivePopover(null); }} className="px-3 py-1.5 font-bold bg-white border border-[#009ceb] text-[#009ceb] hover:bg-blue-50 rounded-lg">Aa</button>
                            <button onClick={() => { updateActiveObject({ textCase: 'lower' }); setActivePopover(null); }} className="px-3 py-1.5 font-bold bg-white border hover:bg-gray-50 rounded-lg">a↓</button>
                            <button onClick={() => { updateActiveObject({ textCase: 'upper' }); setActivePopover(null); }} className="px-3 py-1.5 font-bold bg-white border hover:bg-gray-50 rounded-lg">A↑</button>
                        </div>
                    </Popover>

                    {/* Effects */}
                    <Popover id="effects" activeId={activePopover} setActiveId={setActivePopover} customIcon={<div className="flex items-center space-x-1"><TypeIcon size={16} /><span>Effects</span></div>}>
                        <div className="p-3 w-[300px]">
                            <div className="text-xs font-bold text-gray-500 mb-3 uppercase">Style</div>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => useCanvasStore.getState().applyTextEffect('original')} className="p-3 border rounded-xl hover:border-[#009ceb] flex flex-col items-center"><TypeIcon size={24} className="mb-2 text-gray-700" /> <span className="text-[10px] font-bold">Original</span></button>
                                <button onClick={() => useCanvasStore.getState().applyTextEffect('shadow')} className="p-3 border rounded-xl hover:border-[#009ceb] flex flex-col items-center"><TypeIcon size={24} className="mb-2 text-gray-700 drop-shadow-md" /> <span className="text-[10px] font-bold">Shadow</span></button>
                                <button onClick={() => useCanvasStore.getState().applyTextEffect('highlight')} className="p-3 border rounded-xl hover:border-[#009ceb] flex flex-col items-center"><div className="bg-[#009ceb] px-1 text-white rounded-sm"><TypeIcon size={24} className="mb-1" /></div> <span className="text-[10px] font-bold">Highlight</span></button>
                                <button className="p-3 border rounded-xl flex flex-col items-center opacity-50"><TypeIcon size={24} className="mb-2 text-purple-500" /> <span className="text-[10px] font-bold">Glitch</span></button>
                                <button className="p-3 border rounded-xl flex flex-col items-center opacity-50"><Layers size={24} className="mb-2 text-gray-700" /> <span className="text-[10px] font-bold">Echo</span></button>
                            </div>
                            <div className="text-xs font-bold text-gray-500 mt-4 mb-3 uppercase">Shape</div>
                            <div className="grid grid-cols-3 gap-2">
                                <button className="p-3 border rounded-xl border-[#009ceb] flex flex-col items-center"><Maximize size={24} className="mb-2 text-gray-700" /> <span className="text-[10px] font-bold">None</span></button>
                                <button className="p-3 border rounded-xl opacity-50 flex flex-col items-center"><Spline size={24} className="mb-2 text-gray-700" /> <span className="text-[10px] font-bold">Curve</span></button>
                            </div>
                        </div>
                    </Popover>

                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    {/* Opacity*/}
                    <Popover
                        id="opacity"
                        activeId={activePopover}
                        setActiveId={setActivePopover}
                        icon={Grid}
                    >
                        <AdvancedControls />
                    </Popover>

                    {/*Rotation*/}
                    <Popover
                        id="rotation"
                        activeId={activePopover}
                        setActiveId={setActivePopover}
                        icon={RotateCw}
                    >
                        <AdvancedControls />
                    </Popover>

                </div>
            )}
        </div>
    );
}

export default TopContextualToolbar;