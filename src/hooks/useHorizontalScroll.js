// src/hooks/useHorizontalScroll.js
import { useEffect } from 'react';

export const useHorizontalScroll = () => {
  const elRef = useEffect(() => {
    const element = document.createElement('div');
    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      element.scrollTo({
        left: element.scrollLeft + e.deltaY,
        behavior: 'smooth'
      });
    };
    
    element.addEventListener('wheel', onWheel);
    return () => element.removeEventListener('wheel', onWheel);
  }, []);

  return elRef;
};