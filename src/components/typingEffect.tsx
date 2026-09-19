import * as React from "react"

const WORDS = ["debugging", "testing", "coding", "designing", "building", "ranting"]

/** Typewriter for the hero accent line: types a word, holds, deletes, next. */
const TypingEffect: React.FC = () => {
  const [word, setWord] = React.useState(0)
  const [len, setLen] = React.useState(0)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    const full = WORDS[word]
    let delay = deleting ? 70 : 140
    if (!deleting && len === full.length) delay = 1400
    if (deleting && len === 0) delay = 300

    const t = setTimeout(() => {
      if (!deleting && len === full.length) return setDeleting(true)
      if (deleting && len === 0) {
        setDeleting(false)
        return setWord((w) => (w + 1) % WORDS.length)
      }
      setLen((n) => n + (deleting ? -1 : 1))
    }, delay)
    return () => clearTimeout(t)
  }, [word, len, deleting])

  return (
    <span className="hero__accent">
      of {WORDS[word].slice(0, len)}
      <span className="typed-caret" aria-hidden="true" />
    </span>
  )
}

export default TypingEffect
