/**
 * Generates the guided-tour narration clips into public/audio/tour/<id>.mp3
 * from the captions in src/lib/tour.ts (the single source of truth, shared with
 * the Tour component). The clips are committed as static files, so there is zero
 * runtime TTS cost. Run after editing the script:
 *
 *   npm run tour:audio
 *
 * Provider is auto-detected from the environment (loaded from .env):
 *   ELEVENLABS_API_KEY  → ElevenLabs   (override voice with TOUR_VOICE_ID)
 *   OPENAI_API_KEY      → OpenAI TTS   (override voice with TOUR_VOICE)
 * Optionally set TOUR_MODEL to override the model for either provider.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOUR_AUDIO_CLIPS } from '../src/lib/tour.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', 'public', 'audio', 'tour');

const EL_KEY = process.env.ELEVENLABS_API_KEY;
const OAI_KEY = process.env.OPENAI_API_KEY;

async function synth(text: string): Promise<ArrayBuffer> {
  if (EL_KEY) {
    // Default voice: "Adam" (a stock ElevenLabs narrator). Pick another from your
    // ElevenLabs voice library and set TOUR_VOICE_ID to override.
    const voiceId = process.env.TOUR_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': EL_KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: process.env.TOUR_MODEL || 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    return res.arrayBuffer();
  }
  if (OAI_KEY) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OAI_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.TOUR_MODEL || 'gpt-4o-mini-tts',
        voice: process.env.TOUR_VOICE || 'onyx',
        input: text,
        response_format: 'mp3',
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    return res.arrayBuffer();
  }
  throw new Error('no key'); // unreachable; guarded in main()
}

async function main() {
  if (!EL_KEY && !OAI_KEY) {
    console.error(
      '\n✗ No TTS key found.\n' +
        '  Add ELEVENLABS_API_KEY (recommended) or OPENAI_API_KEY to .env, then re-run:\n' +
        '    npm run tour:audio\n',
    );
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const provider = EL_KEY ? 'ElevenLabs' : 'OpenAI';
  console.log(`Generating ${TOUR_AUDIO_CLIPS.length} narration clips with ${provider}`);
  console.log(`  → ${OUT_DIR}\n`);

  for (const clip of TOUR_AUDIO_CLIPS) {
    process.stdout.write(`  ${clip.id} … `);
    const buf = await synth(clip.narration);
    writeFileSync(join(OUT_DIR, `${clip.id}.mp3`), Buffer.from(buf));
    console.log(`ok (${Math.round(buf.byteLength / 1024)} KB)`);
  }

  console.log('\nDone. Commit the new files in public/audio/tour/.');
}

main().catch((err) => {
  console.error('\n✗', err instanceof Error ? err.message : err);
  process.exit(1);
});
