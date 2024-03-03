class AudioManager {
  public audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
  }
}

class InputStage {
  private track: MediaElementAudioSourceNode;
  private node: Element;
  private playButton: HTMLElement;
  private audioElement: HTMLMediaElement;
  private audioContext: AudioContext;
  public firstNode;
  public lastNode;

  constructor(node, AudioManager) {
    this.audioContext = AudioManager.audioContext;
    this.audioElement = node.querySelector("audio") as HTMLMediaElement;
    this.playButton = node.querySelector("[data-play-button]");
    this.playButton.addEventListener("click", () => this.handlePlayButton());
    this.audioElement.addEventListener("ended", () => this.handleEnd());
    this.track = this.audioContext.createMediaElementSource(this.audioElement);
    this.firstNode = this.track
    this.lastNode = this.track
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

  connectBefore(targetModule) {
    this.lastNode.connect(targetModule.firstNode);
  }
}

class OutputStage {
  private audioContext: AudioContext;
  private audioElement: HTMLMediaElement;
  private node: Element;
  private playButton: HTMLElement;
  private volumeControl: HTMLInputElement;
  private gainNode: GainNode;
  private panControl: HTMLInputElement;
  private panNode: StereoPannerNode;
  public firstNode;
  public lastNode;

  constructor(node, AudioManager) {
    this.node = node;
    this.volumeControl = node.querySelector("[data-gain-control]");
    this.panControl = node.querySelector("[data-pan-control]");

    this.audioContext = AudioManager.audioContext;
    this.gainNode = this.audioContext.createGain();
    this.panNode = new StereoPannerNode(this.audioContext, { pan: 0 });

    this.gainNode.connect(this.panNode)

    this.volumeControl.addEventListener("input", () =>
      this.handleVolumeControl(),
    );
    this.panControl.addEventListener("input", () => this.handlePanControl());
    this.firstNode = this.gainNode
    this.lastNode = this.panNode
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
  connectBefore(targetModule) {
    this.lastNode.connect(targetModule.firstNode);
  }
  connectToDestination() {
    this.lastNode.connect(this.audioContext.destination);
  }
}

const master: AudioManager = new AudioManager();

const inputElement: Element = document.querySelector("[data-audio-player]");
const input: InputStage = new InputStage(inputElement, master);

const outputElement: Element = document.querySelector("[data-output-stage]");
const output: OutputStage = new OutputStage(outputElement, master);

input.connectBefore(output)
output.connectToDestination()
