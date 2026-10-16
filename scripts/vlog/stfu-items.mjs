// Starting text for StfuStage's Items field, one entry per line. It is copied into each clip,
// where it can be edited in Neon's inspector. A quote scene uses the line's subtitle instead.
const sceneItems = {
  pipeline: ['Hold key', 'Microphone', 'Whisper', 'LLM cleanup', 'Paste'],
  compare: ['Whisper heard: um can you send the notes to the team and uh put the screenshots in the folder', 'Cleanup returned: Can you send the notes to the team and put the screenshots in the folder?'],
  demo: ['Can you send the notes to the team and put the screenshots in the folder?', 'Speak your message…'],
  speed: ['2.5×', 'Typing: 0.4', 'Talking: 1'],
  ownership: ['The recording', 'The raw transcript', 'The cleanup prompt', 'The pasted text'],
  retention: ['Lossless audio compression', 'Separate audio and text limits', 'Review before deleting', 'Transcripts can outlive audio'],
  fallback: ['Cleanup unavailable', 'Paste the raw transcript'],
  outro: ['macOS', 'Windows', 'Linux'],
};
const hasNoItems = ['title', 'end', 'pill'];

export const stageProps = ({ scene, title, subtitle = '', image = '' }) => ({
  scene,
  title,
  items: (sceneItems[scene] ?? (hasNoItems.includes(scene) || image ? [] : [subtitle])).join('\n'),
  image,
});
