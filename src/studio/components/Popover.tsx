function Popover({ id, activeId, setActiveId, icon: Icon, children, label, customIcon }: any) {
    const isActive = activeId === id;
    return (
        <div className="relative flex items-center">
            <button
                onClick={() => setActiveId(isActive ? null : id)}
                className={`flex items-center justify-center p-2 rounded-lg transition-colors font-bold text-sm ${isActive ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50'}`}
            >
                {customIcon ? customIcon : Icon ? <Icon size={18} strokeWidth={isActive ? 2.5 : 2} /> : label}
            </button>

            {isActive && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveId(null)}></div>
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-2 min-w-max animate-in fade-in zoom-in-95 duration-100">
                        {children}
                    </div>
                </>
            )}
        </div>
    );
}

export default Popover;