import { useState } from "react"
import Popover from "../../components/Popover"
import { MoreHorizontal } from "lucide-react"

export default function MoreToolsControls({ children }: any) {

    const [activePopover, setActivePopover] = useState<string | null>(null)

    return (
        <Popover
            id="more-tools"
            activeId={activePopover}
            setActiveId={setActivePopover}
            icon={MoreHorizontal}
        >
            <div className="p-2 w-48 space-y-2">
                {children}
            </div>
        </Popover>
    )
}
