// 100% Procedural Web Audio API Foley & Chamber Orchestra Synthesis (Zero Stock Audio / Zero 404s)

export class MemoriaAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private isEnabled = false;
  private currentIntegrity = 1.0;

  public toggle(): boolean {
    if (!this.isEnabled) {
      this.enable();
    } else {
      this.disable();
    }
    return this.isEnabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public enable(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.28;
      this.masterGain.connect(this.ctx.destination);
      this.initChamberPad();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    this.isEnabled = true;
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0.11, this.ctx.currentTime, 0.25);
    }
  }

  public disable(): void {
    this.isEnabled = false;
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.15);
    }
  }

  private initChamberPad(): void {
    if (!this.ctx || !this.masterGain) return;
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0;

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 620;
    this.droneFilter.Q.value = 1.2;

    this.droneGain.connect(this.droneFilter);
    this.droneFilter.connect(this.masterGain);

    // Warm D-minor / D-major chamber string fifths (Cello D2, Viola A2, Violin F#3 / A3)
    const freqs = [73.42, 110.0, 146.83, 220.0];
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.droneGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx < 2 ? 'sawtooth' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = (idx % 2 === 0 ? -4 : 4);
      const voiceGain = this.ctx.createGain();
      voiceGain.gain.value = idx === 0 ? 0.38 : 0.2;
      osc.connect(voiceGain);
      voiceGain.connect(this.droneGain);
      osc.start();
      this.droneOscs.push(osc);
    });
  }

  public setIntegrity(integrity: number): void {
    this.currentIntegrity = Math.max(0, Math.min(1, integrity));
    if (!this.ctx || !this.droneFilter || !this.isEnabled) return;
    const now = this.ctx.currentTime;
    // Fractured state -> darker, muffled dissonance; Restored state -> warm open chamber brightness
    const cutoff = 260 + this.currentIntegrity * 920;
    this.droneFilter.frequency.setTargetAtTime(cutoff, now, 0.2);

    if (this.droneOscs.length >= 4) {
      // Shift upper voice detune as integrity drops
      const detuneSpread = (1 - this.currentIntegrity) * 34;
      this.droneOscs[2].detune.setTargetAtTime(-4 - detuneSpread, now, 0.2);
      this.droneOscs[3].detune.setTargetAtTime(4 + detuneSpread, now, 0.2);
    }
  }

  public playFoley(type: 'typewriter' | 'shuttle' | 'porcelain' | 'musicbox' | 'orchestra' | 'fracture' | 'stitch'): void {
    if (!this.isEnabled) {
      this.enable();
    }
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'typewriter': {
        // Sharp mechanical striker impulse + brass bell return
        const bufferSize = this.ctx.sampleRate * 0.045;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.18));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1850;
        filter.Q.value = 2.4;

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.65, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        noise.connect(filter);
        filter.connect(g);
        g.connect(this.masterGain);
        noise.start(now);

        // Subtle metallic spring ping
        const ping = this.ctx.createOscillator();
        const pg = this.ctx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(1420, now);
        ping.frequency.exponentialRampToValueAtTime(980, now + 0.06);
        pg.gain.setValueAtTime(0.18, now);
        pg.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        ping.connect(pg);
        pg.connect(this.masterGain);
        ping.start(now);
        ping.stop(now + 0.09);
        break;
      }

      case 'shuttle': {
        // Loom shuttle air sweep + taut golden silk pluck
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(196, now);
        osc.frequency.exponentialRampToValueAtTime(392, now + 0.14);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.28, now + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.56);
        break;
      }

      case 'porcelain': {
        // Crystalline inharmonic partials of vitrail & porcelain
        const ratios = [1.0, 2.756, 4.18];
        const base = 784;
        ratios.forEach((r, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = base * r;
          g.gain.setValueAtTime(0.22 / (idx + 1), now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.9 / (idx + 1));
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 1.0);
        });
        break;
      }

      case 'musicbox': {
        // 4-note delicate music-box steel comb motif
        const notes = [587.33, 739.99, 880.0, 1174.66];
        notes.forEach((freq, i) => {
          if (!this.ctx || !this.masterGain) return;
          const t = now + i * 0.14;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0.001, t);
          g.gain.linearRampToValueAtTime(0.22, t + 0.008);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.78);
        });
        break;
      }

      case 'orchestra': {
        // Warm bowed chamber chord swell (D major 9)
        const chord = [146.83, 220.0, 293.66, 369.99, 440.0];
        chord.forEach((f, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const g = this.ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.value = f;
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, now);
          filter.frequency.linearRampToValueAtTime(1400, now + 0.7);
          filter.frequency.linearRampToValueAtTime(520, now + 1.8);

          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.08, now + 0.35);
          g.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

          osc.connect(filter);
          filter.connect(g);
          g.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 2.15);
        });
        break;
      }

      case 'fracture': {
        // Heavy architectural fracture rumble + glass shard scatter
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(36, now + 0.45);

        const lpf = this.ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 340;

        g.gain.setValueAtTime(0.45, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(lpf);
        lpf.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.56);
        this.playFoley('porcelain');
        break;
      }

      case 'stitch': {
        // Golden memory thread weave chime
        const notes = [440, 659.25, 880];
        notes.forEach((freq, i) => {
          if (!this.ctx || !this.masterGain) return;
          const t = now + i * 0.06;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0.18, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.68);
        });
        break;
      }
    }
  }

  public dispose(): void {
    this.droneOscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        // Ignore already stopped
      }
    });
    this.droneOscs = [];
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
