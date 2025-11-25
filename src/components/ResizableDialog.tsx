import { useState, useRef, useEffect, ReactNode } from 'react';
import { Dialog, DialogTitle } from '@/components/ui/dialog';
import { Maximize2, Minimize2 } from 'lucide-react';

interface ResizableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export function ResizableDialog({
  isOpen,
  onClose,
  title,
  children,
  defaultWidth = 1200,
  defaultHeight = 600,
  minWidth = 600,
  minHeight = 400,
}: ResizableDialogProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [isMaximized, setIsMaximized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = (direction: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newWidth = width;
      let newHeight = height;

      if (resizeDirection.includes('right')) {
        newWidth = Math.max(minWidth, e.clientX - rect.left);
      }
      if (resizeDirection.includes('left')) {
        const deltaX = rect.left - e.clientX;
        newWidth = Math.max(minWidth, width + deltaX);
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(minHeight, e.clientY - rect.top);
      }
      if (resizeDirection.includes('top')) {
        const deltaY = rect.top - e.clientY;
        newHeight = Math.max(minHeight, height + deltaY);
      }

      setWidth(newWidth);
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection('');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, width, height, minWidth, minHeight]);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Reset size when modal opens
  useEffect(() => {
    if (isOpen) {
      setWidth(defaultWidth);
      setHeight(defaultHeight);
      setIsMaximized(false);
    }
  }, [isOpen, defaultWidth, defaultHeight]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-fade-in">
        <div
          ref={containerRef}
          className="relative pointer-events-auto bg-background border rounded-lg shadow-lg flex flex-col animate-scale-in"
          style={{
            width: isMaximized ? '98vw' : `${width}px`,
            height: isMaximized ? '95vh' : `${height}px`,
            maxWidth: '98vw',
            maxHeight: '95vh',
            transition: isMaximized ? 'all 0.2s ease-in-out' : 'none',
          }}
        >
          {/* Header - Fixed at top */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-background flex-shrink-0">
            <DialogTitle className="text-2xl flex items-center gap-2 animate-slide-in-from-left">
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2 animate-slide-in-from-right">
              <button
                onClick={toggleMaximize}
                className="p-2 hover:bg-muted rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
                title={isMaximized ? 'Restaurar' : 'Maximizar'}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            {children}
          </div>

          {/* Resize Handles - Only visible when not maximized */}
          {!isMaximized && (
            <>
              {/* Edges */}
              <div
                className="absolute top-0 left-0 right-0 h-1 cursor-n-resize hover:bg-blue-500/50"
                onMouseDown={startResize('top')}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize hover:bg-blue-500/50"
                onMouseDown={startResize('bottom')}
              />
              <div
                className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize hover:bg-blue-500/50"
                onMouseDown={startResize('left')}
              />
              <div
                className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize hover:bg-blue-500/50"
                onMouseDown={startResize('right')}
              />

              {/* Corners */}
              <div
                className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-blue-500"
                onMouseDown={startResize('top-left')}
              />
              <div
                className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-blue-500"
                onMouseDown={startResize('top-right')}
              />
              <div
                className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize hover:bg-blue-500"
                onMouseDown={startResize('bottom-left')}
              />
              <div
                className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-blue-500"
                onMouseDown={startResize('bottom-right')}
              />
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
