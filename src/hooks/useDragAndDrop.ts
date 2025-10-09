import { useState, useCallback } from 'react';

interface UseDragAndDropProps {
  isFacilitator: boolean;
}

interface UseDragAndDropReturn {
  dragIndex: number | null;
  dragOverIndex: number | null;
  handleDragStart: (index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragLeave: () => void;
  handleDrop: (index: number, onReorder: (dragIndex: number, targetIndex: number) => void) => void;
  handleDragEnd: () => void;
  isDragOver: (index: number) => boolean;
}

export const useDragAndDrop = ({ isFacilitator }: UseDragAndDropProps): UseDragAndDropReturn => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    // Disallow dragging current speaker (index 0)
    if (index === 0) {
      return;
    }
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    // Allow dropping only on non-current speaker positions
    if (index === 0) {
      return;
    }
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((index: number, onReorder: (dragIndex: number, targetIndex: number) => void) => {
    if (dragIndex === null) {
      return;
    }
    if (dragIndex === 0) {
      return;
    } // safety check

    // Do not allow dropping into current speaker slot
    const targetIndex = index === 0 ? 1 : index;

    if (targetIndex === dragIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    // If not facilitator, only allow moving backwards (targetIndex > dragIndex)
    if (!isFacilitator && targetIndex <= dragIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    onReorder(dragIndex, targetIndex);
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, isFacilitator]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const isDragOver = useCallback((index: number) => {
    return dragOverIndex === index;
  }, [dragOverIndex]);

  return {
    dragIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isDragOver
  };
};