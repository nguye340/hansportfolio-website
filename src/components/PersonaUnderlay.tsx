import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

type Persona = "sec" | "dev" | "game" | "art";

export default function PersonaUnderlay({ persona }: { persona: Persona }) {
  const root = useRef<HTMLDivElement>(null);

  // Per-persona palettes (very translucent for readability)
  const tint = useMemo(() => {
    const map: Record<Persona, [string, string]> = {
      sec:  ["rgba(59,130,246,0.14)", "rgba(59,130,246,0.06)"],   // blue
      dev:  ["rgba(234,179,8,0.18)",  "rgba(234,179,8,0.08)"],    // yellow
      game: ["rgba(244,63,94,0.18)",  "rgba(244,63,94,0.08)"],    // red/rose
      art:  ["rgba(34,197,94,0.18)",  "rgba(34,197,94,0.08)"],    // green
    };
    return map[persona];
  }, [persona]);

  // Build DOM for the persona (so we can animate distinct shapes)
  useEffect(() => {
    if (!root.current) return;
    const host = root.current;
    host.innerHTML = ""; // reset
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Helpers
    const make = (cls: string, style: Partial<CSSStyleDeclaration> = {}) => {
      const el = document.createElement("div");
      el.className = cls;
      Object.assign(el.style, style);
      host.appendChild(el);
      return el;
    };

    const floatLoop = (els: Element[] | NodeListOf<Element>, amt = 12, dur = 5, delay = 0) => {
      if (reduce) return;
      gsap.to(els, {
        y: () => gsap.utils.random(-amt, amt),
        x: () => gsap.utils.random(-amt, amt),
        rotate: () => gsap.utils.random(-2, 2),
        duration: () => gsap.utils.random(dur * 0.8, dur * 1.2),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.1, from: "random" },
        delay,
      });
    };

    // Persona-specific shapes + enter transition
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (persona === "sec") {
      // SECURITY — scanning elements + radar effect
      
      // Vertical scanning bars
      for (let i = 0; i < 14; i++) {
        make("u-bar", {
          position: "absolute",
          top: "0", bottom: "0",
          width: "7%",
          left: `${i * 7}%`,
          background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)",
          mixBlendMode: "overlay",
          transform: "translateY(-100%)",
        });
      }
      
      // Grid dots (sensor grid)
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 10; x++) {
          make("u-dot", {
            position: "absolute",
            width: "6px", 
            height: "6px", 
            borderRadius: "9999px",
            left: `${8 + x * 9}%`,
            top: `${10 + y * 14}%`,
            background: tint[0],
            opacity: "0.4",
          });
        }
      }

      // Radar circle (static)
      make("u-radar", {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "min(80vw, 600px)",
        height: "min(80vw, 600px)",
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        border: `1px solid ${tint[0]}`,
        opacity: "0.2",
        pointerEvents: "none",
      });
      
      // Digital particles (random bits of data)
      for (let i = 0; i < 25; i++) {
        const size = gsap.utils.random(2, 4);
        make("u-particle", {
          position: "absolute",
          left: `${gsap.utils.random(5, 95)}%`,
          top: `${gsap.utils.random(5, 95)}%`,
          width: `${size}px`,
          height: `${size}px`,
          background: tint[0],
          opacity: gsap.utils.random(0.2, 0.6).toString(),
          borderRadius: "1px",
          transform: `rotate(${gsap.utils.random(0, 45)}deg)`,
        });
      }

      // Binary code rain effect
      make("u-binary-container", {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        opacity: "0.1",
      });
      
      for (let i = 0; i < 15; i++) {
        const binary = make("u-binary", {
          position: "absolute",
          left: `${gsap.utils.random(0, 95)}%`,
          top: "-50px",
          color: tint[0],
          fontSize: `${gsap.utils.random(14, 18)}px`,
          fontFamily: "monospace",
          whiteSpace: "nowrap",
          textShadow: `0 0 6px ${tint[0]}`,
          opacity: gsap.utils.random(0.3, 0.7).toString(),
        });
        binary.textContent = Array.from(
          {length: gsap.utils.random(6, 12)}, 
          () => Math.round(Math.random()).toString()
        ).join('');
        
        // Animate binary rain
        gsap.to(binary, {
          y: "100vh",
          duration: gsap.utils.random(6, 12),
          repeat: -1,
          delay: gsap.utils.random(0, 5),
          ease: "none",
        });
      }

      // Store drop positions for grid
      const dropPositions = [];
      
      // Electrical current drops (circular)
      for (let i = 0; i < 8; i++) {
        const size = gsap.utils.random(4, 8);
        const duration = gsap.utils.random(2, 4);
        const delay = gsap.utils.random(0, 3);
        const xPos = gsap.utils.random(5, 95);
        
        // Create the drop container
        const dropContainer = make("u-current-drop", {
          position: "absolute",
          left: `${xPos}%`,
          top: "-20px",
          width: `${size}px`,
          height: `calc(100% + 20px)`,
          overflow: "visible",
          zIndex: "2"
        });
        
        // Create multiple circles for the electrical effect
        const circleCount = 5;
        for (let j = 0; j < circleCount; j++) {
          const circle = make("u-current-circle", {
            position: "absolute",
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            background: tint[0],
            opacity: gsap.utils.random(0.3, 0.8).toString(),
            filter: `blur(${gsap.utils.random(1, 3)}px)`, 
            left: "50%",
            transform: "translateX(-50%) translateY(-10px)",
            zIndex: "3"
          });
          
          // Animate each circle with a slight delay
          gsap.to(circle, {
            y: `calc(100% + 10px)`,
            duration: duration,
            delay: delay + (j * 0.3),
            repeat: -1,
            repeatDelay: gsap.utils.random(1, 3),
            ease: "sine.inOut",
            onStart: () => {
              // Reset position when animation restarts
              gsap.set(circle, { y: "-10px" });
            }
          });
          
          // Add the circle to the container
          dropContainer.appendChild(circle);
          
          // Store position for grid lines (only for the first circle in each drop)
          if (j === 0) {
            dropPositions.push({
              x: xPos,
              y: 10 + (j * 20), // Staggered vertical positions
              element: circle
            });
          }
        }
        
        // Add subtle horizontal movement to the entire drop
        gsap.to(dropContainer, {
          x: `${gsap.utils.random(-20, 20)}px`,
          duration: gsap.utils.random(3, 6),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      }

      // Create grid lines between drops
      if (dropPositions.length > 1) {
        // Sort positions by x-coordinate
        dropPositions.sort((a, b) => a.x - b.x);
        
        // Create horizontal grid lines
        for (let i = 0; i < dropPositions.length - 1; i++) {
          const start = dropPositions[i];
          const end = dropPositions[i + 1];
          
          // Only draw lines between reasonably close points
          if (Math.abs(start.x - end.x) < 30) {
            const line = make("u-grid-line", {
              position: "absolute",
              height: "1px",
              width: `${end.x - start.x}%`,
              left: `${start.x}%`,
              top: `${start.y}%`,
              background: `linear-gradient(90deg, 
                ${tint[0]}00, 
                ${tint[0]}33, 
                ${tint[0]}00)`, // Gradient for a fading effect
              opacity: "0.1",
              transform: "translateY(-50%)",
              zIndex: "1"
            });
            
            // Add subtle animation to the grid lines
            gsap.to(line, {
              opacity: gsap.utils.random(0.05, 0.15),
              duration: gsap.utils.random(2, 4),
              yoyo: true,
              repeat: -1,
              ease: "sine.inOut"
            });
          }
        }
        
        // Create vertical grid lines at each drop position
        dropPositions.forEach(pos => {
          const line = make("u-grid-line-vertical", {
            position: "absolute",
            width: "1px",
            height: "100%",
            left: `${pos.x}%`,
            top: "0",
            background: `linear-gradient(to bottom, 
              ${tint[0]}00, 
              ${tint[0]}22 10%, 
              ${tint[0]}22 90%, 
              ${tint[0]}00)`, // Gradient for a fading effect
            opacity: "0.1",
            zIndex: "1"
          });
          
          // Add subtle animation to the vertical lines
          gsap.to(line, {
            opacity: gsap.utils.random(0.05, 0.15),
            duration: gsap.utils.random(3, 6),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: gsap.utils.random(0, 2)
          });
        });
      }
      
      // Initial animations
      tl.to(".u-bar", { yPercent: 100, duration: 0.55, stagger: 0.045 }, 0)
        .to(".u-bar", { yPercent: 200, duration: 0.6, stagger: 0.04 }, "+=0.05")
        .to(".u-radar", { opacity: 0.1, scale: 1.1, duration: 1.5, ease: "sine.inOut" }, "-=0.5");
      
      // Float dots and particles
      floatLoop(host.querySelectorAll(".u-dot"), 5, 6);
      floatLoop(host.querySelectorAll(".u-particle"), 8, 3, 0.5);

    } else if (persona === "dev") {
      // Add page transition elements
      const transitionOverlay = make("u-transition-overlay", {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "#1a1a1a",
        zIndex: "1000",
        opacity: "1",
        pointerEvents: "none"
      });
      
      // Animate page transition
      gsap.to(transitionOverlay, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => transitionOverlay.remove()
      });

      // Subtle grid pattern
      const gridSize = 8;
      const cellSize = 100 / gridSize;
      
      // Create a subtle grid of dots
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          make("u-grid-dot", {
            position: "absolute",
            width: "2px",
            height: "2px",
            borderRadius: "50%",
            background: `rgba(234, 179, 8, 0.2)`,
            left: `${x * cellSize + cellSize/2}%`,
            top: `${y * cellSize + cellSize/2}%`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none"
          });
        }
      }

      // Create simple geometric shapes with subtle movement
      const shapes = [
        { type: 'circle', size: 150, color: 'rgba(234, 179, 8, 0.1)' },
        { type: 'square', size: 120, color: 'rgba(234, 179, 8, 0.08)' },
        { type: 'triangle', size: 180, color: 'rgba(234, 179, 8, 0.05)' }
      ];

      shapes.forEach((shape, i) => {
        const shapeEl = make(`u-shape-${i}`, {
          position: 'absolute',
          width: `${shape.size}px`,
          height: `${shape.size}px`,
          background: shape.color,
          left: `${gsap.utils.random(10, 90)}%`,
          top: `${gsap.utils.random(10, 90)}%`,
          opacity: '0',
          pointerEvents: 'none',
          borderRadius: shape.type === 'circle' ? '50%' : '4px',
          clipPath: shape.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
          transform: 'scale(0.8) rotate(0deg)'
        });

        // Animate shapes in
        gsap.to(shapeEl, {
          opacity: 1,
          scale: 1,
          rotation: gsap.utils.random(-10, 10),
          duration: 1.5,
          delay: i * 0.3,
          ease: 'power2.out'
        });

        // Add subtle floating animation
        gsap.to(shapeEl, {
          y: gsap.utils.random(-30, 30),
          x: gsap.utils.random(-20, 20),
          rotation: gsap.utils.random(-5, 5),
          duration: gsap.utils.random(8, 12),
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      });

      // Light mode adjustments
      const lightModeStyles = document.createElement('style');
      lightModeStyles.textContent = `
        @media (prefers-color-scheme: light) {
          .u-bracket,
          .u-code,
          .u-binary,
          .u-tech-stack {
            filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
          }
          
          .u-code {
            background: rgba(255, 255, 255, 0.8) !important;
            border: 1px solid rgba(0,0,0,0.1) !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
          }
        }
        
        .u-bracket {
          font-family: 'Fira Code', 'Courier New', monospace;
          font-weight: bold;
          user-select: none;
          will-change: transform, opacity;
          transition: all 0.3s ease;
        }
        
        .u-tech-stack {
          will-change: transform, opacity;
          transition: all 0.3s ease;
          mix-blend-mode: multiply;
        }
      `;
      document.head.appendChild(lightModeStyles);

      // Tech stack names to display
      const techStack = [
        // Core Technologies
        "MongoDB", "Express", "React", "Node.js", "MERN", "JavaScript", "TypeScript",
        "Python", "Django", "Flask", "C#", ".NET", "ASP .NET", "C++", "Java", "Spring MVC",
        
        // Cloud & DevOps
        "AWS", "AWS ECS", "AWS EC2", "Azure", "Azure CI/CD", "Docker", "Docker Compose", 
        "Kubernetes", "Digital Ocean S3", "GitHub", "Git", "CI/CD",
        
        // Databases
        "MongoDB", "MS SQL Server", "PostgreSQL", "MySQL", "SQL", "NoSQL", "Firebase",
        
        // Testing & QA
        "QA/QC", "Regression Testing", "Unit Testing", "TDD", "Jest", "Mocha", "Cypress",
        
        // Methodologies
        "OOP", "COP", "REST APIs", "GraphQL", "Agile", "Scrum", 
        
        // Tools & IDEs
        "VS Code", "Jira", "Figma", "Adobe XD"
      ];  

      // Add floating tech stack names - more subtle and spread out
      for (let i = 0; i < 25; i++) {  
        const tech = techStack[Math.floor(Math.random() * techStack.length)];
        const techElement = make("u-tech-stack", {
          position: "absolute",
          color: `rgba(${tint[0].substring(4, tint[0].length-1)}, ${gsap.utils.random(0.3, 0.6)})`,  
          fontSize: `${gsap.utils.random(9, 12)}px`,  
          fontWeight: `${gsap.utils.random(300, 500)}`,  
          left: `${gsap.utils.random(2, 98)}%`,  
          top: `${gsap.utils.random(2, 98)}%`,
          opacity: "0",
          zIndex: "1",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: '"Fira Code", "Courier New", monospace',
          textShadow: `0 0 6px ${tint[0]}33`,  
          filter: 'none',
          mixBlendMode: 'overlay',  
          willChange: 'transform, opacity',
          transition: 'all 0.5s ease-out'
        });
        
        techElement.textContent = tech;
        
        // Animate tech stack names - more subtle animations
        gsap.to(techElement, {
          opacity: gsap.utils.random(0.2, 0.5),  
          duration: gsap.utils.random(2, 4),  
          delay: gsap.utils.random(0, 3),  
          ease: "sine.inOut"
        });
        
        // Floating animation - more subtle movement
        gsap.to(techElement, {
          y: gsap.utils.random(-30, 30),
          x: gsap.utils.random(-20, 20),
          rotation: gsap.utils.random(-2, 2),
          duration: gsap.utils.random(20, 40),  
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }

      // Floating tech icons
      const icons = ["</>", "{}()", "<div>", "fn()", "=>", "const", "let", "class"];
      for (let i = 0; i < 15; i++) {
        make("u-icon", {
          position: "absolute",
          left: `${gsap.utils.random(2, 96)}%`,
          top: `${gsap.utils.random(5, 95)}%`,
          fontSize: `${gsap.utils.random(14, 22)}px`,
          fontFamily: '"Fira Code", monospace',
          color: tint[Math.floor(Math.random() * 2)],
          opacity: gsap.utils.random(0.3, 0.8).toString(),
          transform: `rotate(${gsap.utils.random(-15, 15)}deg)`,
          pointerEvents: "none",
        }).textContent = icons[Math.floor(Math.random() * icons.length)];
      }

      // Animate brackets bouncing in
      tl.to(".u-bracket", {
        opacity: 0.6,
        scale: 1,
        duration: 0.8,
        ease: "bounce.out",
        stagger: 0.1,
        rotation: () => gsap.utils.random(-5, 5),
      }, 0);

      // Animate code blocks fading in
      tl.to(".u-codeblock", {
        opacity: 0.8,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "back.out(1.2)",
        stagger: 0.15,
      }, 0.3);

      // Add floating animations
      const floatElements = [
        ...host.querySelectorAll(".u-bracket"),
        ...host.querySelectorAll(".u-codeblock"),
        ...host.querySelectorAll(".u-icon")
      ];
      
      gsap.to(floatElements, {
        y: () => gsap.utils.random(-15, 15),
        x: () => gsap.utils.random(-10, 10),
        rotation: () => gsap.utils.random(-3, 3),
        duration: () => gsap.utils.random(3, 6),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.1, from: "random" },
      });

    } else if (persona === "game") {
      // GAME — Enhanced game elements with diagonal shards and speed lines
      
      // Diagonal shards with varied thickness and opacity
      const shardCount = 20; // Increased number of shards
      for (let i = 0; i < shardCount; i++) {
        const thickness = gsap.utils.random(2, 12); // Varied thickness
        const speed = gsap.utils.random(5, 15); // Varied animation speed
        const opacity = gsap.utils.random(0.4, 0.9); // Varied opacity
        const skew = gsap.utils.random(-30, -15); // Varied skew angle
        
        const shard = make("u-shard", {
          position: "absolute",
          width: `${gsap.utils.random(8, 25)}vw`, // More varied widths
          height: `${thickness}px`, // Dynamic thickness
          left: `${gsap.utils.random(-10, 80)}%`,
          top: `${gsap.utils.random(5, 95)}%`,
          background: tint[0],
          opacity: opacity.toString(),
          transform: `skewX(${skew}deg) translateX(-120vw)`,
          filter: `drop-shadow(0 0 ${thickness/2}px ${tint[0]}${Math.floor(opacity * 50).toString(16).padStart(2, '0')})`,
          zIndex: "1"
        });
        
        // Animate shards with varied speeds
        gsap.to(shard, {
          x: '120vw',
          duration: speed,
          repeat: -1,
          ease: 'none',
          delay: gsap.utils.random(0, 5)
        });
      }
      
      // Speed lines with varied thickness and length
      const speedLineCount = 15; // Increased number of speed lines
      for (let i = 0; i < speedLineCount; i++) {
        const thickness = gsap.utils.random(1, 4); // Varied thickness
        const length = gsap.utils.random(20, 50); // Varied length
        const opacity = gsap.utils.random(0.2, 0.6); // Varied opacity
        const speed = gsap.utils.random(2, 6); // Varied animation speed
        
        const speedLine = make("u-speed", {
          position: "absolute",
          width: `${length}vw`,
          height: `${thickness}px`, // Dynamic thickness
          left: `${gsap.utils.random(-30, 30)}%`,
          top: `${gsap.utils.random(5, 95)}%`,
          background: `linear-gradient(90deg, 
            ${tint[0]}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}, 
            transparent)`,
          transform: 'translateX(-100%)',
          zIndex: "1"
        });
        
        // Animate speed lines with varied delays and speeds
        gsap.to(speedLine, {
          x: '100vw',
          duration: speed,
          repeat: -1,
          ease: 'none',
          delay: gsap.utils.random(0, 3)
        });
      }
      
      // Power-up orbs
      for (let i = 0; i < 8; i++) {
        const size = gsap.utils.random(15, 35);
        const duration = gsap.utils.random(3, 6);
        const delay = gsap.utils.random(0, 2);
        
        const orb = make("u-orb", {
          position: "absolute",
          width: `${size}px`,
          height: `${size}px`,
          left: `${gsap.utils.random(5, 95)}%`,
          top: `${gsap.utils.random(5, 95)}%`,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, ${tint[0]}, ${tint[1]})`,
          boxShadow: `0 0 15px ${tint[0]}`,
          opacity: "0.8",
          zIndex: "2"
        });
        
        // Add pulsing animation to orbs
        gsap.to(orb, {
          scale: 1.2,
          duration: duration / 2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: delay
        });
        
        // Add subtle floating animation
        gsap.to(orb, {
          y: `+=${gsap.utils.random(-20, 20)}`,
          x: `+=${gsap.utils.random(-15, 15)}`,
          duration: gsap.utils.random(3, 6),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: delay
        });
      }
      
      // Platform elements with varied thickness and effects
      for (let i = 0; i < 8; i++) { // Increased number of platforms
        const width = gsap.utils.random(40, 180); // More varied widths
        const thickness = gsap.utils.random(4, 16); // Varied thickness
        const platform = make("u-platform", {
          position: "absolute",
          width: `${width}px`,
          height: `${thickness}px`, // Dynamic thickness
          left: `${gsap.utils.random(5, 85)}%`,
          top: `${gsap.utils.random(10, 90)}%`,
          background: `linear-gradient(
            to right, 
            ${tint[0]}, 
            ${tint[1]}, 
            ${tint[0]}
          )`, // Gradient that fades between colors
          borderRadius: `${thickness/2}px`, // Rounded corners based on height
          opacity: gsap.utils.random(0.2, 0.5).toString(), // Varied opacity
          zIndex: "1",
          filter: `drop-shadow(0 0 ${thickness/2}px ${tint[0]}33)` // Subtle glow
        });
        
        // Add subtle floating animation
        gsap.to(platform, {
          y: `+=${gsap.utils.random(-5, 5)}`,
          duration: gsap.utils.random(2, 4),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      }
      
      
      // Animate the original shards and speed lines
      tl.to(".u-shard", {
        x: "140vw", 
        duration: 0.7, 
        stagger: 0.03,
      }, 0)
      .to(".u-speed", { 
        x: "120vw", 
        duration: 0.9, 
        stagger: 0.05 
      }, 0.05);
      
      // Add floating animation to shards
      floatLoop(host.querySelectorAll(".u-shard"), 8, 5);

    } else {
      // ART — Dynamic design elements with smooth transitions
      
      // Color palette for more vibrant design elements
      const colors = [
        tint[0],
        tint[1],
        gsap.utils.interpolate(tint[0], '#ffffff', 0.3),
        gsap.utils.interpolate(tint[1], '#000000', 0.2)
      ];

      // Define shape types
      type ShapeType = 'blob' | 'circle' | 'rect' | 'triangle' | 'menu' | 'button' | 'card' | 'search' | 'grid' | 'layers' | 'settings';
      
      interface BaseShape {
        type: ShapeType;
        x: number;
        y: number;
        color: string;
        opacity?: number;
        rotation?: number;
        blur?: number;
        isBlob?: boolean;
        size?: number;
      }
      
      interface BlobShape extends BaseShape {
        type: 'blob';
        size: number;
        blur: number;
      }
      
      interface CircleShape extends BaseShape {
        type: 'circle';
        size: number;
      }
      
      interface RectShape extends BaseShape {
        type: 'rect';
        size?: number; // Make size optional since we're using width/height
        width?: number;
        height?: number;
        borderRadius?: number;
      }
      
      interface TriangleShape extends BaseShape {
        type: 'triangle';
        size: number;
      }
      
      interface UIShape extends BaseShape {
        type: 'menu' | 'button' | 'card' | 'search' | 'grid' | 'layers' | 'settings';
      }
      
      type Shape = BlobShape | CircleShape | RectShape | TriangleShape | UIShape;
      
      // Create abstract shapes with better spacing and variety
      const shapes: Shape[] = [];
      
      // Grid-based positioning for better spacing
      const gridSize = 5; // 5x5 grid
      const cellSize = 100 / gridSize;
      const usedPositions = new Set();
      
      // Add floating blobs with better distribution
      for (let i = 0; i < 8; i++) {
        let x, y, posKey;
        let attempts = 0;
        const maxAttempts = 50;
        
        // Find an unused position
        do {
          x = Math.floor(gsap.utils.random(0, gridSize)) * cellSize + cellSize/2;
          y = Math.floor(gsap.utils.random(0, gridSize)) * cellSize + cellSize/2;
          posKey = `${Math.round(x)}_${Math.round(y)}`;
          attempts++;
        } while (usedPositions.has(posKey) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) continue;
        
        usedPositions.add(posKey);
        const size = gsap.utils.random(80, 200);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const isBlurry = Math.random() > 0.4; // 60% chance of being blurry
        
        // Add some randomness to the position
        x += gsap.utils.random(-cellSize/3, cellSize/3);
        y += gsap.utils.random(-cellSize/3, cellSize/3);
        
        shapes.push({
          type: 'blob',
          size,
          color,
          x,
          y,
          blur: isBlurry ? gsap.utils.random(20, 60) : 0,
          opacity: isBlurry ? gsap.utils.random(0.1, 0.25) : gsap.utils.random(0.2, 0.4),
          rotation: gsap.utils.random(0, 360),
          isBlob: true
        });
      }
      
      // Add abstract geometric shapes with better spacing
      const shapeTypes = ['circle', 'rect', 'triangle'] as const;
      
      for (let i = 0; i < 12; i++) {
        let x, y, posKey;
        let attempts = 0;
        const maxAttempts = 50;
        
        // Find an unused position
        do {
          x = Math.floor(gsap.utils.random(0, gridSize)) * cellSize + cellSize/2;
          y = Math.floor(gsap.utils.random(0, gridSize)) * cellSize + cellSize/2;
          posKey = `${Math.round(x)}_${Math.round(y)}`;
          attempts++;
        } while ((usedPositions.has(posKey) || x < 0 || x > 100 || y < 0 || y > 100) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) continue;
        
        usedPositions.add(posKey);
        
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const size = gsap.utils.random(30, 100);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotation = gsap.utils.random(-180, 180);
        const isBlurry = Math.random() > 0.8; // 20% chance of being blurry
        const blurAmount = isBlurry ? gsap.utils.random(2, 10) : 0;
        
        // Add some randomness to the position
        x += gsap.utils.random(-cellSize/3, cellSize/3);
        y += gsap.utils.random(-cellSize/3, cellSize/3);
        
        if (type === 'circle') {
          shapes.push({
            type: 'circle',
            size,
            color,
            rotation,
            x,
            y,
            opacity: isBlurry ? gsap.utils.random(0.2, 0.4) : gsap.utils.random(0.5, 0.9),
            blur: blurAmount,
            isBlob: false
          });
        } else if (type === 'rect') {
          shapes.push({
            type: 'rect',
            size,
            color,
            rotation,
            x,
            y,
            opacity: isBlurry ? gsap.utils.random(0.2, 0.4) : gsap.utils.random(0.5, 0.9),
            borderRadius: gsap.utils.random(0, 50),
            width: size * gsap.utils.random(0.7, 1.3),
            height: size * gsap.utils.random(0.7, 1.3),
            blur: blurAmount,
            isBlob: false
          });
        } else if (type === 'triangle') {
          shapes.push({
            type: 'triangle',
            size,
            color,
            rotation,
            x,
            y,
            opacity: isBlurry ? gsap.utils.random(0.2, 0.4) : gsap.utils.random(0.5, 0.9),
            blur: blurAmount,
            isBlob: false
          });
        }
      }
      
      // UI elements - using square shapes and UI symbols
      const uiElements: UIShape[] = [
        // Navigation elements
        { type: 'menu', x: 15, y: 15, color: colors[0] },
        { type: 'search', x: 30, y: 15, color: colors[1] },
        
        // UI components
        { type: 'button', x: 85, y: 20, color: colors[1] },
        { type: 'card', x: 25, y: 70, color: colors[0] },
        
        // UI symbols
        { type: 'grid', x: 80, y: 70, color: colors[1] },
        { type: 'layers', x: 50, y: 50, color: colors[0] },
        { type: 'settings', x: 85, y: 80, color: colors[1] }
      ];
      
      // Create and animate all elements
      const allElements: Shape[] = [...shapes, ...uiElements];
      allElements.forEach((el, i) => {
        const elm = make(`art-${i}`, {
          position: 'absolute',
          left: `${el.x}%`,
          top: `${el.y}%`,
          opacity: '0',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
          transform: `translate(-50%, -50%) scale(0) rotate(${el.rotation || 0}deg)`
        });
        
        if (el.type === 'blob') {
          // Create organic blob shapes using SVG filters for smoother blurs
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.style.position = 'absolute';
          svg.style.top = '0';
          svg.style.left = '0';
          
          // Create a filter for the blob
          const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
          filter.setAttribute('id', `blob-filter-${i}`);
          filter.setAttribute('x', '-50%');
          filter.setAttribute('y', '-50%');
          filter.setAttribute('width', '200%');
          filter.setAttribute('height', '200%');
          
          // Add turbulence for organic shape
          const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
          turbulence.setAttribute('type', 'fractalNoise');
          turbulence.setAttribute('baseFrequency', '0.05');
          turbulence.setAttribute('numOctaves', '3');
          turbulence.setAttribute('result', 'turbulence');
          
          // Add displacement map
          const displacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
          displacement.setAttribute('in', 'SourceGraphic');
          displacement.setAttribute('in2', 'turbulence');
          displacement.setAttribute('scale', '30');
          displacement.setAttribute('xChannelSelector', 'R');
          displacement.setAttribute('yChannelSelector', 'G');
          
          // Add blur
          const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
          blur.setAttribute('stdDeviation', `${el.blur / 2}`);
          
          filter.appendChild(turbulence);
          filter.appendChild(displacement);
          filter.appendChild(blur);
          svg.appendChild(filter);
          
          // Create the blob shape
          const blob = document.createElement('div');
          Object.assign(blob.style, {
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: el.color,
            filter: `blur(${el.blur}px)`,
            opacity: el.opacity,
            transform: 'translate(-50%, -50%) scale(0.5)'
          });
          
          elm.appendChild(svg);
          elm.appendChild(blob);
          
          // Add subtle pulsing animation to blobs
          if (el.isBlob) {
            gsap.to(blob, {
              scale: gsap.utils.random(0.8, 1.2),
              duration: gsap.utils.random(8, 15),
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut'
            });
          }
          
        } 
        else if (el.type === 'circle') {
          Object.assign(elm.style, {
            width: `${el.size}px`,
            height: `${el.size}px`,
            borderRadius: '50%',
            background: el.color,
            border: `1px solid ${gsap.utils.interpolate(el.color, '#ffffff', 0.5)}`,
            boxShadow: `0 0 ${el.blur || 0}px ${el.color}${Math.floor((el.opacity || 0.8) * 255).toString(16).padStart(2, '0')}`,
            opacity: el.opacity || 0.8,
            filter: el.blur ? `blur(${el.blur}px)` : 'none',
            transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`
          });
        }
        else if (el.type === 'rect') {
          // For UI elements, use square shapes with no border radius
          const isUIElement = ['menu', 'button', 'card', 'search', 'grid', 'layers', 'settings'].includes(el.type);
          const borderRadius = isUIElement ? '0' : `${gsap.utils.random(0, 50)}%`;
          
          Object.assign(elm.style, {
            width: el.width ? `${el.width}px` : `${el.size}px`,
            height: el.height ? `${el.height}px` : `${el.size}px`,
            borderRadius: el.borderRadius ? `${el.borderRadius}%` : borderRadius,
            background: isUIElement 
              ? el.color 
              : `linear-gradient(${gsap.utils.random(0, 180)}deg, ${el.color}, ${gsap.utils.interpolate(el.color, '#ffffff', 0.3)})`,
            transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
            boxShadow: `0 2px 5px rgba(0,0,0,0.1)`,
            opacity: el.opacity || 0.8,
            filter: el.blur && !isUIElement ? `blur(${el.blur}px)` : 'none',
            border: isUIElement 
              ? 'none' 
              : `1px solid ${gsap.utils.interpolate(el.color, '#ffffff', 0.3)}`
          });
        }
        else if (el.type === 'triangle') {
          // Create triangle using CSS borders
          const triangleSize = el.size || 50;
          Object.assign(elm.style, {
            width: '0',
            height: '0',
            borderLeft: `${triangleSize/2}px solid transparent`,
            borderRight: `${triangleSize/2}px solid transparent`,
            borderBottom: `${triangleSize}px solid ${el.color}`,
            background: 'transparent',
            transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
            opacity: el.opacity || 0.8,
            filter: el.blur ? `blur(${el.blur}px)` : 'none',
            boxShadow: `0 0 ${el.blur || 0}px ${el.color}${Math.floor((el.opacity || 0.8) * 255).toString(16).padStart(2, '0')}`,
          });
          
          // Add subtle rotation animation
          gsap.to(elm, {
            rotation: 360,
            duration: gsap.utils.random(20, 40),
            repeat: -1,
            ease: 'none',
            transformOrigin: 'center center'
          });
        }
        else if (el.type === 'menu') {
          // Menu icon (3 lines)
          for (let j = 0; j < 3; j++) {
            const line = document.createElement('div');
            Object.assign(line.style, {
              width: '20px',
              height: '2px',
              background: el.color,
              margin: '4px 0',
              borderRadius: '2px',
              transition: 'transform 0.3s ease',
              transformOrigin: 'center'
            });
            elm.appendChild(line);
          }
        }
        else if (el.type === 'button') {
          elm.textContent = 'Button';
          Object.assign(elm.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '500',
            fontSize: '11px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            width: '80px',
            height: '32px',
            borderRadius: '0',
            background: el.color,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          });
        }
        else if (el.type === 'card') {
          Object.assign(elm.style, {
            width: '120px',
            height: '80px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${el.color}20, ${el.color}05)`,
            border: `1px solid ${el.color}40`,
            backdropFilter: 'blur(4px)',
            padding: '12px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          });
          
          const header = document.createElement('div');
          header.style.height = '12px';
          header.style.background = el.color;
          header.style.borderRadius = '6px';
          header.style.opacity = '0.5';
          
          const content = document.createElement('div');
          content.style.display = 'flex';
          content.style.gap = '6px';
          content.style.flexDirection = 'column';
          
          for (let j = 0; j < 3; j++) {
            const line = document.createElement('div');
            line.style.height = '4px';
            line.style.background = el.color;
            line.style.borderRadius = '2px';
            line.style.opacity = '0.3';
            line.style.width = `${gsap.utils.random(60, 100)}%`;
            content.appendChild(line);
          }
          
          elm.appendChild(header);
          elm.appendChild(content);
        }
        else if (el.type === 'grid') {
          // Grid icon
          const grid = document.createElement('div');
          Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            width: '20px',
            height: '20px'
          });
          
          for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            Object.assign(cell.style, {
              width: '4px',
              height: '4px',
              background: el.color,
              opacity: '0.8'
            });
            grid.appendChild(cell);
          }
          
          elm.appendChild(grid);
        }
        else if (el.type === 'layers') {
          // Layers icon
          for (let i = 0; i < 3; i++) {
            const layer = document.createElement('div');
            Object.assign(layer.style, {
              position: 'absolute',
              width: '20px',
              height: '16px',
              border: `2px solid ${el.color}`,
              left: `${i * 4}px`,
              top: `${i * 4}px`,
              transform: `translate(-50%, -50%)`,
              opacity: 1 - (i * 0.2)
            });
            elm.appendChild(layer);
          }
        }
        else if (el.type === 'settings') {
          // Settings icon (gear)
          const gear = document.createElement('div');
          Object.assign(gear.style, {
            width: '20px',
            height: '20px',
            position: 'relative',
            borderRadius: '50%',
            border: `2px solid ${el.color}`
          });
          
          // Add gear teeth
          for (let i = 0; i < 8; i++) {
            const tooth = document.createElement('div');
            Object.assign(tooth.style, {
              position: 'absolute',
              width: '4px',
              height: '8px',
              background: el.color,
              left: '50%',
              top: '-6px',
              transform: `translateX(-50%) rotate(${i * 45}deg)`,
              transformOrigin: 'center 16px'
            });
            gear.appendChild(tooth);
          }
          
          elm.appendChild(gear);
        }
        else if (el.type === 'search') {
          // Search icon (simplified square design)
          const icon = document.createElement('div');
          Object.assign(icon.style, {
            width: '16px',
            height: '16px',
            border: `2px solid ${el.color}`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          });
          
          const line = document.createElement('div');
          Object.assign(line.style, {
            position: 'absolute',
            width: '8px',
            height: '2px',
            background: el.color,
            transform: 'rotate(45deg)',
            right: '-5px',
            top: '14px'
          });
          
          const dot = document.createElement('div');
          Object.assign(dot.style, {
            width: '4px',
            height: '4px',
            background: el.color,
            position: 'absolute',
            right: '3px',
            bottom: '3px'
          });
          
          icon.appendChild(dot);
          icon.appendChild(line);
          elm.appendChild(icon);
          
          // Placeholder text
          const placeholder = document.createElement('div');
          Object.assign(placeholder.style, {
            width: '60px',
            height: '8px',
            background: el.color,
            opacity: '0.5',
            borderRadius: '4px'
          });
          elm.appendChild(placeholder);
        }
        
        // Animate in with staggered delays
        const delay = gsap.utils.random(0.1, 0.5);
        const duration = gsap.utils.random(0.6, 1);
        const rotation = 'rotation' in el ? el.rotation : 0;
        const opacity = 'opacity' in el ? el.opacity : 0.8;
        
        gsap.to(elm, {
          opacity: opacity,
          scale: 1,
          rotation: rotation,
          duration,
          delay,
          ease: 'back.out(1.7)',
          transformOrigin: 'center center'
        });
        
        // Add floating animation for shape elements
        if (el.type === 'blob' || el.type === 'circle' || el.type === 'rect') {
          gsap.to(elm, {
            y: `+=${gsap.utils.random(-20, 20)}`,
            x: `+=${gsap.utils.random(-15, 15)}`,
            rotation: `+=${gsap.utils.random(-10, 10)}`,
            duration: gsap.utils.random(8, 12),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: gsap.utils.random(0, 2)
          });
        }
      });
      
      // Add some connecting lines between elements
      for (let i = 0; i < 8; i++) {
        const line = make('art-connector', {
          position: 'absolute',
          height: '1px',
          background: `linear-gradient(90deg, ${colors[0]}40, ${colors[1]}40)`,
          transformOrigin: 'left center',
          opacity: '0',
          zIndex: '0'
        });
        
        // Animate in after a delay
        gsap.to(line, {
          opacity: 0.3,
          duration: 1,
          delay: 1 + i * 0.1
        });
        
        // Update line position between random elements
        const updateLine = () => {
          const elements = host.querySelectorAll('[class^="art-"]:not(.art-connector)');
          if (elements.length < 2) return;
          
          const start = elements[Math.floor(Math.random() * elements.length)];
          const end = elements[Math.floor(Math.random() * elements.length)];
          
          if (!start || !end) return;
          
          const startRect = start.getBoundingClientRect();
          const endRect = end.getBoundingClientRect();
          const hostRect = host.getBoundingClientRect();
          
          const x1 = startRect.left + startRect.width / 2 - hostRect.left;
          const y1 = startRect.top + startRect.height / 2 - hostRect.top;
          const x2 = endRect.left + endRect.width / 2 - hostRect.left;
          const y2 = endRect.top + endRect.height / 2 - hostRect.top;
          
          const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
          
          gsap.set(line, {
            left: `${x1}px`,
            top: `${y1}px`,
            width: `${length}px`,
            rotation: angle
          });
        };
        
        // Update line position periodically
        updateLine();
        setInterval(updateLine, 3000);
      }

      // Add some connecting lines between elements
      const pairs = [[0,1], [2,3], [4,5], [6,7]];
      pairs.forEach(([i, j]) => {
        const line = make(`u-line-${i}-${j}`, {
          position: 'absolute',
          height: '1px',
          background: `linear-gradient(90deg, ${tint[0]}, ${tint[1]})`,
          opacity: '0',
          transformOrigin: '0 50%',
        });
        
        // Position and animate the line
        const updateLine = () => {
          const el1 = host.querySelector(`.u-design-${i}`);
          const el2 = host.querySelector(`.u-design-${j}`);
          if (el1 && el2) {
            const rect1 = el1.getBoundingClientRect();
            const rect2 = el2.getBoundingClientRect();
            const x1 = rect1.left + rect1.width/2 - host.getBoundingClientRect().left;
            const y1 = rect1.top + rect1.height/2 - host.getBoundingClientRect().top;
            const x2 = rect2.left + rect2.width/2 - host.getBoundingClientRect().left;
            const y2 = rect2.top + rect2.height/2 - host.getBoundingClientRect().top;
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            Object.assign(line.style, {
              width: `${length}px`,
              left: `${x1}px`,
              top: `${y1}px`,
              transform: `rotate(${angle}deg)`,
              opacity: '0.2',
            });
          }
        };
        
        // Update line position on animation frame
        const animate = () => {
          updateLine();
          if (!reduce) requestAnimationFrame(animate);
        };
        
        animate();
      });
    }

    return () => {
      gsap.killTweensOf(host.querySelectorAll("*"));
      host.innerHTML = "";
    };
  }, [persona, tint]);

  // Subtle global gradient wash (per persona)
  return (
    <div
      ref={root}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0,
        margin: 0,
        padding: 0,
        pointerEvents: 'none',
        contain: 'layout paint',
        transform: 'translateZ(0)'
      }}
    />
  );
}