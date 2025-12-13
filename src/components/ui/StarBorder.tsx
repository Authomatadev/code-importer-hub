import React from 'react';
import './StarBorder.css';

interface StarBorderProps {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  children: React.ReactNode;
}

const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = 'div',
  className = '',
  color = 'hsl(207, 55%, 48%)',
  speed = '6s',
  thickness = 1,
  children,
  ...rest
}) => {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{ '--star-speed': speed } as React.CSSProperties}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          height: `${100 / thickness}%`,
          animationDuration: speed,
        }}
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          height: `${100 / thickness}%`,
          animationDuration: speed,
        }}
      />
      <div className="star-border-inner-content">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
