
import { useCanvasStore } from '../store/canvasStore';

const COLORS = [
  '#ffffff', // White
  '#f8f9fa', // Light Gray
  '#e9ecef', // Gray
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#000000', // Black
  '#ff9900', // Orange
  '#9900ff', // Purple
  '#ff66cc', // Pink
  '#00cc99', // Mint
  '#333333', // Dark Gray
];

export default function ColorPanel() {
  const { setCanvasBackground } = useCanvasStore();

  return (
    <div className="space-y-6 mt-4">
      <p className="text-sm text-gray-500 leading-relaxed">
        Select a color to update the material or background color of your design.
      </p>

      <div className="grid grid-cols-5 gap-3">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setCanvasBackground(color)}
            className="w-10 h-10 rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-sm border border-gray-200"
            style={{ backgroundColor: color }}
            aria-label={`Set background color to ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
