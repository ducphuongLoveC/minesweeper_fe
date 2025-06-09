import React, { useEffect, useRef, useState } from 'react';

const CounterClock = () => {
  const [display, setDisplay] = useState('001');
  const counterRef = useRef(1);

  useEffect(() => {
    const intervalId = setInterval(() => {
      counterRef.current += 1;
      const formatted = String(counterRef.current).padStart(3, '0');
      setDisplay(formatted);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ fontSize: '48px', fontFamily: 'monospace' }}>
      {display}
    </div>
  );
};

export default CounterClock;
