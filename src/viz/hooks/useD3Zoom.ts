import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface UseD3ZoomOptions {
  svgRef: React.RefObject<SVGSVGElement>;
  scaleExtent?: [number, number];
  initialOffset?: number;
}

export const useD3Zoom = ({ svgRef, scaleExtent = [0.1, 3], initialOffset = 100 }: UseD3ZoomOptions) => {
  const currentTransformRef = useRef<d3.ZoomTransform | null>(null);
  const lastDimensionsRef = useRef<{ width: number; height: number } | null>(null);

  const setupZoom = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    // Store current transform before any updates
    const existingTransform = d3.zoomTransform(svgRef.current!);
    if (existingTransform.k !== 1 || existingTransform.x !== 0 || existingTransform.y !== 0) {
      currentTransformRef.current = existingTransform;
    }

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent(scaleExtent)
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        currentTransformRef.current = event.transform;
      });

    svg.call(zoom);

    return zoom;
  };

  const applyInitialTransform = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
    dimensions: { width: number; height: number }
  ) => {
    // Check if dimensions have changed significantly (layout change)
    const dimensionsChanged = lastDimensionsRef.current && (
      Math.abs(lastDimensionsRef.current.width - dimensions.width) > 100 ||
      Math.abs(lastDimensionsRef.current.height - dimensions.height) > 100
    );

    if (currentTransformRef.current && !dimensionsChanged) {
      // Restore the saved transform only if dimensions haven't changed
      svg.call(
        zoom.transform as any,
        currentTransformRef.current
      );
    } else {
      // Center the content initially with offset (first time or after layout change)
      const bounds = g.node()?.getBBox();
      if (bounds) {
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;

        const scale = 0.8 * Math.min(dimensions.width / fullWidth, dimensions.height / fullHeight);
        const translate = [
          dimensions.width / 2 - scale * midX,
          (dimensions.height / 2 - scale * midY) + initialOffset
        ];

        const initialTransform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);
        svg.call(
          zoom.transform as any,
          initialTransform
        );
        currentTransformRef.current = initialTransform;
      }
    }

    // Update last known dimensions
    lastDimensionsRef.current = { width: dimensions.width, height: dimensions.height };
  };

  return {
    setupZoom,
    applyInitialTransform,
    currentTransformRef
  };
};