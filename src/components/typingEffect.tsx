import React, { useState, useEffect } from 'react';

const TypingEffect: React.FC = () => {
  const words: string[] = ["Debugging", "Testing", "Coding", "Designing", "Building"];
  const [currentWord, setCurrentWord] = useState<number>(0);
  const [letterIndex, setLetterIndex] = useState<number>(0);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [displayedWord, setDisplayedWord] = useState<string>("");

  useEffect(() => {
    const updateText = () => {
      if (deleting) {
        if (letterIndex > 0) {
          setLetterIndex(prevIndex => prevIndex - 1);
          setDisplayedWord(words[currentWord].slice(0, letterIndex - 1));
        } else {
          setDeleting(false);
          setCurrentWord(prevCurrent => (prevCurrent + 1) % words.length);
        }
      } else {
        if (letterIndex < words[currentWord].length) {
          setLetterIndex(prevIndex => prevIndex + 1);
          setDisplayedWord(words[currentWord].slice(0, letterIndex + 1));
        } else {
          setTimeout(() => { setDeleting(true); }, 1000);
        }
      }
    };

    const typingSpeed = deleting ? 100 : 200;
    const timeout = setTimeout(updateText, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentWord, deleting, letterIndex, words]);

  return (
    <p className="title">
      10,000 Hours <br/>of <span>{displayedWord}</span><span className="cursor">|</span>
    </p>
  );
};

export default TypingEffect;
