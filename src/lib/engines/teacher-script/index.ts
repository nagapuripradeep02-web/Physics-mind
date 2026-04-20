/**
 * Engine 7: Teacher Script Engine
 *
 * Reads resolved tts_sentences[] per state and syncs narration to state.
 * Respects advance_mode:
 *   auto_after_tts        → TeacherScript advances automatically after TTS_SENTENCE_END
 *   manual_click          → wait for student click
 *   wait_for_answer       → wait for text input
 *   interaction_complete  → wait for slider/interaction
 */

import type { Engine, SimSession, SimEvent } from '../types';

export type AdvanceMode =
  | 'auto_after_tts'
  | 'manual_click'
  | 'wait_for_answer'
  | 'interaction_complete';

export interface TtsSentence {
  id: string;
  text_en: string;
}

export interface TeacherScriptStateDef {
  advanceMode: AdvanceMode;
  sentences: TtsSentence[];
}

export interface TeacherScriptConfig {
  states?: Record<string, TeacherScriptStateDef>;
}

export interface TeacherScriptState {
  currentStateId: string | null;
  currentSentences: TtsSentence[];
  currentSentenceIndex: number;
  advanceMode: AdvanceMode;
}

const DEFAULT_ADVANCE_MODE: AdvanceMode = 'manual_click';

function emptyState(): TeacherScriptState {
  return {
    currentStateId: null,
    currentSentences: [],
    currentSentenceIndex: 0,
    advanceMode: DEFAULT_ADVANCE_MODE,
  };
}

export class TeacherScriptEngine implements Engine<TeacherScriptConfig, TeacherScriptState> {
  readonly id = 'teacher-script';
  readonly dependencies: string[] = ['state-machine'];

  private config: TeacherScriptConfig = {};
  private session: SimSession | null = null;
  private state: TeacherScriptState = emptyState();

  async init(config: TeacherScriptConfig, session: SimSession): Promise<TeacherScriptState> {
    this.config = config ?? {};
    this.session = session;
    this.state = emptyState();
    return this.state;
  }

  async reset(): Promise<void> {
    this.state = emptyState();
  }

  async destroy(): Promise<void> {
    this.session = null;
    this.config = {};
    this.state = emptyState();
  }

  loadState(stateId: string, sentences: TtsSentence[], advanceMode?: AdvanceMode): void {
    const cfgState = this.config.states?.[stateId];
    this.state = {
      currentStateId: stateId,
      currentSentences: sentences.map((s) => ({ ...s })),
      currentSentenceIndex: 0,
      advanceMode: advanceMode ?? cfgState?.advanceMode ?? DEFAULT_ADVANCE_MODE,
    };
  }

  getCurrentSentence(): TtsSentence | null {
    const { currentSentences, currentSentenceIndex } = this.state;
    if (currentSentenceIndex < 0 || currentSentenceIndex >= currentSentences.length) {
      return null;
    }
    return currentSentences[currentSentenceIndex];
  }

  advance(): TtsSentence | null {
    const { currentSentences } = this.state;
    if (currentSentences.length === 0) return null;

    const idx = this.state.currentSentenceIndex;
    if (idx >= currentSentences.length) return null;

    const isLast = idx === currentSentences.length - 1;
    if (isLast) {
      const lastId = currentSentences[idx].id;
      this.state.currentSentenceIndex = currentSentences.length;
      this.session?.emit({ type: 'TTS_SENTENCE_END', sentence_id: lastId });
      return null;
    }

    this.state.currentSentenceIndex = idx + 1;
    return currentSentences[this.state.currentSentenceIndex];
  }

  getAdvanceMode(): AdvanceMode {
    return this.state.advanceMode;
  }

  onEvent(event: SimEvent): void {
    if (event.type === 'STATE_ENTER') {
      const cfg = this.config.states?.[event.state];
      if (cfg) {
        this.loadState(event.state, cfg.sentences, cfg.advanceMode);
      }
      return;
    }

    if (event.type === 'TTS_SENTENCE_END') {
      if (this.state.advanceMode !== 'auto_after_tts') return;
      const current = this.getCurrentSentence();
      if (current !== null && current.id === event.sentence_id) {
        this.advance();
      }
      return;
    }
  }
}
