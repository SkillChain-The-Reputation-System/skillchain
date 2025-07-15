import { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  pauseDelay?: number;
}

export default function TypingText({
  text,
  className,
  typingSpeed = 100,
  pauseDelay = 2000,
}: TypingTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleTick = () => {
      if (!isDeleting) {
        if (displayed.length < text.length) {
          setDisplayed(text.slice(0, displayed.length + 1));
          timeout = setTimeout(handleTick, typingSpeed);
        } else {
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDelay);
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(text.slice(0, displayed.length - 1));
          timeout = setTimeout(handleTick, typingSpeed / 2);
        } else {
          setIsDeleting(false);
          timeout = setTimeout(handleTick, typingSpeed);
        }
      }
    };

    timeout = setTimeout(handleTick, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, text, typingSpeed, pauseDelay]);

  return (
    <span className={`typing-caret ${className ?? ""}`}>{displayed}</span>
  );
}
