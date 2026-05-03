import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1.2,
  ease = 'back.out(1.7)',
  scrollStart = 'top bottom-=20%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.04
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(' ').map((word, index) => (
      <span className="word inline-block mr-[0.25em]" key={index}>
        {word}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    const wordElements = el.querySelectorAll('.word');

    gsap.fromTo(
      wordElements,
      {
        willChange: 'opacity, transform',
        opacity: 0,
        y: 30,
      },
      {
        duration: 0.8,
        ease: 'power3.out',
        opacity: 1,
        y: 0,
        stagger: 0.08,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h2 ref={containerRef} className={`scroll-float ${containerClassName}`}>
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </h2>
  );
};

export default ScrollFloat;
