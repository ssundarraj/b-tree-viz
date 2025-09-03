import React, { useEffect, useRef } from 'react';
import { ConsoleMessage } from '../App';

interface ConsoleProps {
  messages: ConsoleMessage[];
}

const Console: React.FC<ConsoleProps> = ({ messages }) => {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="console-output" ref={consoleRef}>
      {messages.length === 0 ? (
        <div className="console-line" style={{ opacity: 0.5 }}>
          Console output will appear here...
        </div>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className={`console-line ${msg.type}`}>
            {msg.message}
          </div>
        ))
      )}
    </div>
  );
};

export default Console;