import { useEffect } from 'react';
import { useCanvasStore } from "./studio/store/canvasStore";
import Workspace from "./studio/canvas/Workspace";
import UploadsPanel from "./studio/sidebar/UploadsPanel";
import ColorPanel from "./studio/sidebar/ColorPanel";

import {
  Type, Image as ImageIcon, Shapes, Monitor, ChevronDown, Plus,
  Redo, Undo, Cloud, List, Palette
} from 'lucide-react';

// ============================================================================
// 3. TOP CONTEXTUAL TOOLBAR (Vistaprint Pill Style)
// ============================================================================


// ============================================================================
// 4. OBJECT ACTION MENU (Local floating menu directly above object)
// ============================================================================


// ============================================================================
// 5. MAIN WORKSPACE (The Canvas)
// ============================================================================


// ============================================================================
// 6. MAIN APPLICATION SHELL
// ============================================================================
export default function App() {
  // 🔥 Store se naye variables nikal le
  const { activeTab, setActiveTab, addText, productTitle, initStudioConfig } = useCanvasStore();

  // 🔥 URL PARAMS READ KARNE KA LOGIC
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const w = parseFloat(params.get('width') || '0');
    const h = parseFloat(params.get('height') || '0');
    const pTitle = params.get('product_title') || '';
    const tJson = params.get('template_json') || '';
    const mode = params.get('mode') || '';
    const autoOpenUpload = params.get('autoOpenUpload') === 'true';

    // Store ko update kar de URL values se
    initStudioConfig({
      width: w > 0 ? w : undefined,
      height: h > 0 ? h : undefined,
      productTitle: pTitle ? decodeURIComponent(pTitle.replace(/\+/g, ' ')) : undefined,
      templateJson: tJson ? decodeURIComponent(tJson) : undefined,
      mode: mode ? mode : undefined
    });

    // Agar user Shopify se "Upload your own design" click karke aaya hai, toh seedha Uploads tab khol de
    if (autoOpenUpload) {
      setActiveTab('uploads');
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans text-[#333333] overflow-hidden selection:bg-blue-100">

      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-50 text-[#009ceb] flex items-center justify-center rounded font-black text-xl">T</div>
          <div className="flex flex-col">
            {/* 🔥 HARDCODED NAAM HATAKAR DYNAMIC TITLE LAGA DIYA */}
            <span className="font-bold text-sm leading-none flex items-center gap-1 cursor-pointer">
              {productTitle} <ChevronDown size={14} className="ml-1 text-gray-400" />
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Cloud size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Undo size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><Redo size={18} /></button>
          <div className="w-px h-6 bg-gray-200 mx-2"></div>
          <button className="flex items-center space-x-2 text-sm font-bold text-gray-800 bg-white border border-gray-300 rounded-full px-5 py-2 hover:bg-gray-50 transition-all shadow-sm">
            <Monitor size={16} /><span>Preview</span>
          </button>
          <button className="bg-[#009ceb] hover:bg-blue-500 text-white font-bold text-sm rounded-full px-8 py-2 shadow transition-all active:scale-95">
            Next
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        <div className="w-[80px] bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2 z-40 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
          <SideIcon icon={Palette} label="Color" tab="color" />
          <SideIcon icon={Type} label="Text" tab="text" />
          <SideIcon icon={List} label="Names" tab="names" />
          <SideIcon icon={ImageIcon} label="Uploads" tab="uploads" />
          <SideIcon icon={Shapes} label="Graphics" tab="graphics" />
          <div className="flex-1"></div>
          <SideIcon icon={Plus} label="More" tab="more" />
        </div>

        <div className={`w-[320px] bg-white border-r border-gray-200 z-30 transition-all duration-300 transform flex flex-col ${activeTab ? 'translate-x-0' : '-translate-x-full absolute h-full'}`}>
          <div className="p-6 pb-2 bg-white sticky top-0 flex justify-between">
            <h2 className="text-2xl font-bold capitalize text-gray-900">{activeTab}</h2>
            <button className="text-gray-400 hover:text-black"><Monitor size={18} /></button>
          </div>
          <div className="px-6 pb-6 overflow-y-auto flex-1">
            {activeTab === 'text' && (
              <div className="space-y-6 mt-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Edit your text below, or click on the field you'd like to edit directly on your design.
                </p>
                <button
                  onClick={() => addText("Type text here")}
                  className="w-full py-4 bg-[#76D2F4] hover:bg-[#5bc5eb] text-black rounded-xl font-bold text-sm transition-all"
                >
                  New Text Field
                </button>
              </div>
            )}
            {activeTab === 'uploads' && (
              <UploadsPanel />
            )}
            {activeTab === 'color' && (
              <ColorPanel />
            )}
          </div>
        </div>

        {/* Dynamic Studio Workspace */}
        <Workspace />

      </div>
    </div>
  );
}

function SideIcon({ icon: Icon, label, tab }: any) {
  const { activeTab, setActiveTab } = useCanvasStore();
  const active = activeTab === tab;
  return (
    <button
      onClick={() => setActiveTab(active ? null : tab)}
      className={`flex flex-col items-center w-full py-3 transition-all ${active ? 'text-[#009ceb] bg-blue-50/50' : 'text-gray-500 hover:text-gray-900'}`}
    >
      <div className={`p-2 rounded-full mb-1 ${active ? 'bg-[#009ceb] text-white' : ''}`}>
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}