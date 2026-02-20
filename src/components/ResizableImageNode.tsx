// src/components/ResizableImageNode.tsx
import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

interface ResizableImageNodeProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  selected: boolean;
}

const ResizableImageNode: React.FC<ResizableImageNodeProps> = ({ node, updateAttributes, selected }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || 'auto',
    height: node.attrs.height || 'auto',
  });
  const imageRef = useRef<HTMLImageElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Cargar dimensiones naturales de la imagen si no están establecidas
  useEffect(() => {
    if (imageRef.current && (!node.attrs.width || !node.attrs.height)) {
      const img = imageRef.current;
      const handleLoad = () => {
        if (!node.attrs.width) {
          setDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }
      };
      
      if (img.complete) {
        handleLoad();
      } else {
        img.addEventListener('load', handleLoad);
        return () => img.removeEventListener('load', handleLoad);
      }
    }
  }, [node.attrs.width, node.attrs.height]);

  const handleMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    const currentWidth = imageRef.current?.offsetWidth || 0;
    const currentHeight = imageRef.current?.offsetHeight || 0;
    
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: currentWidth,
      height: currentHeight,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPosRef.current.x;
      const deltaY = moveEvent.clientY - startPosRef.current.y;
      
      let newWidth = startPosRef.current.width;
      let newHeight = startPosRef.current.height;

      // Calcular el nuevo tamaño basado en la esquina que se está arrastrando
      if (corner === 'se' || corner === 'ne') {
        newWidth = Math.max(100, startPosRef.current.width + deltaX);
      } else if (corner === 'sw' || corner === 'nw') {
        newWidth = Math.max(100, startPosRef.current.width - deltaX);
      }

      if (corner === 'se' || corner === 'sw') {
        newHeight = Math.max(100, startPosRef.current.height + deltaY);
      } else if (corner === 'ne' || corner === 'nw') {
        newHeight = Math.max(100, startPosRef.current.height - deltaY);
      }

      // Mantener la proporción de aspecto
      const aspectRatio = startPosRef.current.width / startPosRef.current.height;
      newHeight = newWidth / aspectRatio;

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      updateAttributes({ width: dimensions.width, height: dimensions.height });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <NodeViewWrapper className="resizable-image-wrapper inline-block relative">
      <img
        ref={imageRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        style={{
          width: typeof dimensions.width === 'number' ? `${dimensions.width}px` : dimensions.width,
          height: typeof dimensions.height === 'number' ? `${dimensions.height}px` : dimensions.height,
          display: 'block',
        }}
        className={`rounded-lg ${selected ? 'ring-4 ring-blue-500' : ''}`}
      />
      
      {selected && (
        <>
          {/* Manijas de redimensionamiento */}
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full cursor-nwse-resize"
            style={{ top: -6, left: -6 }}
            onMouseDown={(e) => handleMouseDown(e, 'nw')}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full cursor-nesw-resize"
            style={{ top: -6, right: -6 }}
            onMouseDown={(e) => handleMouseDown(e, 'ne')}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full cursor-nesw-resize"
            style={{ bottom: -6, left: -6 }}
            onMouseDown={(e) => handleMouseDown(e, 'sw')}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full cursor-nwse-resize"
            style={{ bottom: -6, right: -6 }}
            onMouseDown={(e) => handleMouseDown(e, 'se')}
          />
          
          {/* Dimensiones mostradas */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {Math.round(typeof dimensions.width === 'number' ? dimensions.width : 0)} × {Math.round(typeof dimensions.height === 'number' ? dimensions.height : 0)}
          </div>
        </>
      )}
    </NodeViewWrapper>
  );
};

export default ResizableImageNode;
