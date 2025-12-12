import { useEffect, useId, useLayoutEffect, useRef, ReactNode, CSSProperties } from 'react';
import './ElectricBorder.css';
import { cn } from '@/lib/utils';

interface ElectricBorderProps {
  children: ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  thickness?: number;
  className?: string;
  style?: CSSProperties;
}

const ElectricBorder = ({ 
  children, 
  color = 'hsl(var(--primary))', 
  speed = 1, 
  chaos = 1, 
  thickness = 2, 
  className, 
  style 
}: ElectricBorderProps) => {
  const rawId = useId().replace(/[:]/g, '');
  const filterId = `turbulent-displace-${rawId}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<HTMLDivElement>(null);

  const updateAnim = () => {
    const svg = svgRef.current;
    const host = rootRef.current;
    if (!svg || !host) return;

    if (strokeRef.current) {
      strokeRef.current.style.filter = `url(#${filterId})`;
    }

    const width = Math.max(1, Math.round(host.clientWidth || host.getBoundingClientRect().width || 0));
    const height = Math.max(1, Math.round(host.clientHeight || host.getBoundingClientRect().height || 0));

    const dyAnims = Array.from(svg.querySelectorAll('feOffset > animate[attributeName="dy"]'));
    if (dyAnims.length >= 2) {
      dyAnims[0].setAttribute('values', `${height}; 0`);
      dyAnims[1].setAttribute('values', `0; -${height}`);
    }

    const dxAnims = Array.from(svg.querySelectorAll('feOffset > animate[attributeName="dx"]'));
    if (dxAnims.length >= 2) {
      dxAnims[0].setAttribute('values', `${width}; 0`);
      dxAnims[1].setAttribute('values', `0; -${width}`);
    }

    const baseDur = 6;
    const dur = Math.max(0.001, baseDur / (speed || 1));
    [...dyAnims, ...dxAnims].forEach(a => a.setAttribute('dur', `${dur}s`));

    const disp = svg.querySelector('feDisplacementMap');
    if (disp) disp.setAttribute('scale', String(30 * (chaos || 1)));

    const filterEl = svg.querySelector(`#${CSS.escape(filterId)}`);
    if (filterEl) {
      filterEl.setAttribute('x', '-200%');
      filterEl.setAttribute('y', '-200%');
      filterEl.setAttribute('width', '500%');
      filterEl.setAttribute('height', '500%');
    }

    requestAnimationFrame(() => {
      [...dyAnims, ...dxAnims].forEach(a => {
        if (typeof (a as SVGAnimateElement).beginElement === 'function') {
          try {
            (a as SVGAnimateElement).beginElement();
          } catch {
            console.warn('ElectricBorder: beginElement failed, this may be due to a browser limitation.');
          }
        }
      });
    });
  };

  useEffect(() => {
    updateAnim();
  }, [speed, chaos]);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ro = new ResizeObserver(() => updateAnim());
    ro.observe(rootRef.current);
    updateAnim();
    return () => ro.disconnect();
  }, []);

  const vars = {
    ['--electric-border-color']: color,
    ['--eb-border-width']: `${thickness}px`
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={cn('electric-border-container', className)}
      style={{ ...vars, ...style }}
    >
      <svg ref={svgRef} className="electric-border-svg" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
            <feOffset in="SourceGraphic" result="o1">
              <animate attributeName="dy" values="100; 0" dur="6s" repeatCount="indefinite" />
            </feOffset>
            <feOffset in="SourceGraphic" result="o2">
              <animate attributeName="dy" values="0; -100" dur="6s" repeatCount="indefinite" />
            </feOffset>
            <feOffset in="SourceGraphic" result="o3">
              <animate attributeName="dx" values="100; 0" dur="6s" repeatCount="indefinite" />
            </feOffset>
            <feOffset in="SourceGraphic" result="o4">
              <animate attributeName="dx" values="0; -100" dur="6s" repeatCount="indefinite" />
            </feOffset>
            <feComposite in="o1" in2="o2" operator="xor" result="c12" />
            <feComposite in="o3" in2="o4" operator="xor" result="c34" />
            <feComposite in="c12" in2="c34" operator="xor" result="lines" />
            <feDisplacementMap
              in="lines"
              in2="noise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="electric-border-stroke-container">
        <div ref={strokeRef} className="electric-border-stroke" />
        <div className="electric-border-stroke" />
        <div className="electric-border-stroke" />
        <div className="electric-border-stroke" />
      </div>

      <div className="electric-border-content">{children}</div>
    </div>
  );
};

export default ElectricBorder;
