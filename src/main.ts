class AudioPlayer {
  private audioContext: AudioContext;
  private audioElement: HTMLMediaElement;
  private track: MediaElementAudioSourceNode;
  private node: Element;
  private playButton: HTMLElement;
  private volumeControl: HTMLInputElement;
  private gainNode: GainNode;
  private panControl: HTMLInputElement;
  private panNode: StereoPannerNode;

  constructor(node) {
    this.node = node;
    this.audioElement = node.querySelector("audio") as HTMLMediaElement;
    this.playButton = node.querySelector("[data-play-button]");
    this.volumeControl = node.querySelector("[data-gain-control]");
    this.panControl = node.querySelector("[data-pan-control]");

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.panNode = new StereoPannerNode(this.audioContext, { pan: 0 });

    this.track = this.audioContext.createMediaElementSource(this.audioElement);
    this.track.connect(this.gainNode).connect(this.panNode).connect(this.audioContext.destination);

    this.playButton.addEventListener("click", () => this.handlePlayButton());
    this.audioElement.addEventListener("ended", () => this.handleEnd());
    this.volumeControl.addEventListener("input", () =>
      this.handleVolumeControl(),
    );
    this.panControl.addEventListener("input", () =>
      this.handlePanControl(),
    );
  }

  async handlePlayButton() {
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    if (this.playButton.dataset.playing === "false") {
      this.audioElement.play();
      this.playButton.dataset.playing = "true";
    } else if (this.playButton.dataset.playing === "true") {
      this.audioElement.pause();
      this.playButton.dataset.playing = "false";
    }
  }

  handleEnd() {
    this.playButton.dataset.playing = "false";
  }

  handleVolumeControl() {
    this.gainNode.gain.value = this.volumeControl.value;
  }
  handlePanControl() {
    this.panNode.pan.value = this.panControl.value;
  }
}

const playerElement: Element = document.querySelector("[data-audio-player]");
const player: AudioPlayer = new AudioPlayer(playerElement);
