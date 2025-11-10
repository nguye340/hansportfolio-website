import type { CSSProperties, ReactNode, ElementType } from 'react';
import { forwardRef } from 'react';
import './StarBorder.css';

interface StarBorderProps extends React.HTMLAttributes<HTMLElement> {
  as?: ElementType;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

const StarBorder = forwardRef<HTMLElement, StarBorderProps>(({
  as: Component = 'div',
  className = '',
  color = 'rgba(var(--accent), 1)',
  speed = '6s',
  thickness = 1,
  children,
  style,
  ...rest
}, ref) => {
  const ComponentElement = Component as ElementType;
  
  return (
    <ComponentElement
      ref={ref}
      className={`star-border-container ${className}`}
      style={{
        padding: `${thickness}px 0`,
        ...style
      }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
          animationDuration: speed,
          opacity: 0.7,
        }}
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
          animationDuration: speed,
          opacity: 0.7,
        }}
      />
      <div className="inner-content">{children}</div>
    </ComponentElement>
  );
});

StarBorder.displayName = 'StarBorder';

export default StarBorder;
