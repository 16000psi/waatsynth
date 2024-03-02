class AudioPlayer {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
  }

  async loadAndPlay(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  async play () {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.loadAndPlay('6_raid_-_words_outro.mp3');
  }
}

const player = new AudioPlayer();
document.addEventListener('click', () => player.play())
