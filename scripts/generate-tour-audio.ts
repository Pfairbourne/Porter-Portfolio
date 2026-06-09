/**
 * Generates the guided-tour narration clips into public/audio/tour/<id>.mp3
 * from the captions in src/lib/tour.ts (the single source of truth, shared with
 * the Tour component). The clips are committed as static files, so there is zero
 * runtime TTS cost. Run after editing the script:
 *
 *   npm run tour:audio
 *
 * VOICE: by default this uses the SAME voice the live Q&A agent uses, read straight
 * from your ElevenLabs agent (ELEVENLABS_AGENT_ID) — so the pre-recorded tour and the
 * live agent are literally the same voice, and stay in sync if you change the agent's
 * voice later. The agent's voice settings (stability, similarity, speed) are mirrored
 * too, and its realtime model is mapped to the closest file-generation model.
 *
 * Overrides (all optional, loaded from .env):
 *   TOUR_VOICE_ID   force a specific ElevenLabs voice id (skips the agent lookup)
 *   TOUR_MODEL      force the TTS model (e.g. eleven_v3, eleven_multilingual_v2)
 *   OPENAI_API_KEY  fall back to OpenAI TTS when no ElevenLabs key is present
 *                   (override that voice with TOUR_VOICE)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOUR_AUDIO_CLIPS } from '../src/lib/tour.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', 'public', 'audio', 'tour');

const EL_KEY = process.env.ELEVENLABS_API_KEY;
const OAI_KEY = process.env.OPENAI_API_KEY;

type ElVoice = { voiceId: string; modelId: string; settings: Record<string, unknown>; source: string };

// The conversational agent and the text-to-speech endpoint use different model ids,
// so map the agent's realtime model to the closest file-generation model. v3 is the
// pre-recorded sibling of the agent's eleven_v3_conversational, so the character matches.
function ttsModelFor(agentModel?: string): string {
  switch (agentModel) {
    case 'eleven_v3_conversational':
    case 'eleven_v3':
      return 'eleven_v3';
    case 'eleven_turbo_v2_5':
      return 'eleven_turbo_v2_5';
    case 'eleven_flash_v2_5':
      return 'eleven_flash_v2_5';
    case 'eleven_multilingual_v2':
      return 'eleven_multilingual_v2';
    default:
      return 'eleven_multilingual_v2';
  }
}

// eleven_v3 accepts only a reduced voice-settings set; the v2-family models take the
// fuller set (style, speaker boost, speed). Mirror whatever the agent has configured.
function settingsFor(
  model: string,
  s: { stability?: number; similarity_boost?: number; speed?: number },
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    stability: typeof s.stability === 'number' ? s.stability : 0.5,
    similarity_boost: typeof s.similarity_boost === 'number' ? s.similarity_boost : 0.75,
  };
  if (model === 'eleven_v3') return base;
  base.style = 0;
  base.use_speaker_boost = true;
  if (typeof s.speed === 'number') base.speed = s.speed;
  return base;
}

// Resolve the narration voice: an explicit TOUR_VOICE_ID override wins, otherwise pull
// the live agent's voice + settings + model so the tour matches the Q&A voice exactly.
async function resolveElVoice(): Promise<ElVoice> {
  const overrideVoice = process.env.TOUR_VOICE_ID;
  const overrideModel = process.env.TOUR_MODEL;
  let agentVoice: string | undefined;
  let agentModel: string | undefined;
  let agentName: string | undefined;
  let stability: number | undefined;
  let similarity_boost: number | undefined;
  let speed: number | undefined;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (EL_KEY && agentId && !overrideVoice) {
    try {
      const r = await fetch(
        `https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(agentId)}`,
        { headers: { 'xi-api-key': EL_KEY } },
      );
      if (r.ok) {
        const a = (await r.json()) as any;
        const tts = (a && a.conversation_config && a.conversation_config.tts) || {};
        agentVoice = tts.voice_id;
        agentModel = tts.model_id;
        agentName = a && a.name;
        stability = tts.stability;
        similarity_boost = tts.similarity_boost;
        speed = tts.speed;
      } else {
        console.warn(`  (agent lookup failed: ${r.status}; falling back to default voice)`);
      }
    } catch (err) {
      console.warn(`  (agent lookup error: ${err instanceof Error ? err.message : err})`);
    }
  }
  const voiceId = overrideVoice || agentVoice || 'pNInz6obpgDQGcFmaJgB'; // last-resort stock "Adam"
  const modelId = overrideModel || ttsModelFor(agentModel);
  const settings = settingsFor(modelId, { stability, similarity_boost, speed });
  const source = overrideVoice
    ? 'TOUR_VOICE_ID override'
    : agentVoice
      ? `live agent voice "${agentName || 'agent'}"`
      : 'stock fallback (no agent configured)';
  return { voiceId, modelId, settings, source };
}

async function synthEl(text: string, voice: ElVoice): Promise<ArrayBuffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': EL_KEY as string, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: voice.modelId, voice_settings: voice.settings }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return res.arrayBuffer();
}

async function synthOpenAI(text: string): Promise<ArrayBuffer> {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OAI_KEY as string}`, 'content-type': 'application/json' },
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

  let elVoice: ElVoice | null = null;
  if (EL_KEY) {
    elVoice = await resolveElVoice();
    console.log(`Generating ${TOUR_AUDIO_CLIPS.length} narration clips with ElevenLabs`);
    console.log(`  voice : ${elVoice.voiceId}  (${elVoice.source})`);
    console.log(`  model : ${elVoice.modelId}`);
    console.log(`  → ${OUT_DIR}\n`);
  } else {
    console.log(`Generating ${TOUR_AUDIO_CLIPS.length} narration clips with OpenAI`);
    console.log(`  → ${OUT_DIR}\n`);
  }

  for (const clip of TOUR_AUDIO_CLIPS) {
    process.stdout.write(`  ${clip.id} … `);
    const buf = elVoice ? await synthEl(clip.narration, elVoice) : await synthOpenAI(clip.narration);
    writeFileSync(join(OUT_DIR, `${clip.id}.mp3`), Buffer.from(buf));
    console.log(`ok (${Math.round(buf.byteLength / 1024)} KB)`);
  }

  console.log('\nDone. Commit the new files in public/audio/tour/.');
}

main().catch((err) => {
  console.error('\n✗', err instanceof Error ? err.message : err);
  process.exit(1);
});
