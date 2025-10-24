import { forwardRef, useState } from 'react';
import './Chip.css';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Chip = forwardRef<HTMLDivElement, ChipProps>(({ children, className = '', style, ...props }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      ref={ref}
      className={`chip ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1.5px solid rgb(var(--accent))',
        boxShadow: '0 0 0 0.5px rgba(var(--accent), 0.5)',
        ...style
      }}
      {...props}
    >
      <span className="chip-text">
        {children}
      </span>
      <div 
        className="chip-shine"
        style={{
          position: 'absolute',
          top: 0,
          left: isHovered ? '150%' : '-100%',
          width: '50%',
          height: '100%',
          transform: 'skewX(-25deg)',
          zIndex: 1,
          transition: isHovered ? 'left 0.8s ease-out' : 'none',
        }}
      />
    </div>
  );
});

Chip.displayName = 'Chip';

export default Chip;
