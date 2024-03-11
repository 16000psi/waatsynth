// import { organ_2 } from '.wavetables/organ_2'
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

  constructor(node: Element, audioManager: AudioManager) {
    this.node = node;
    this.audioContext = audioManager.audioContext;
    this.audioElement = this.node.querySelector("audio") as HTMLMediaElement;
    this.playButton = this.node.querySelector(
      "[data-play-button]",
    ) as HTMLElement;
    this.playButton.addEventListener("click", () => this.handlePlayButton());
    this.audioElement.addEventListener("ended", () => this.handleEnd());
    this.track = this.audioContext.createMediaElementSource(this.audioElement);
    this.firstNode = this.track;
    this.lastNode = this.track;
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

  connectBefore(targetModule: OutputStage) {
    this.lastNode.connect(targetModule.firstNode);
  }
}

class OutputStage {
  private audioContext: AudioContext;
  private node: Element;
  private volumeControl: HTMLInputElement;
  private gainNode: GainNode;
  private panControl: HTMLInputElement;
  private panNode: StereoPannerNode;
  public firstNode;
  public lastNode;

  constructor(node: Element, audioManager: AudioManager) {
    this.node = node as Element;
    this.volumeControl = this.node.querySelector(
      "[data-gain-control]",
    ) as HTMLInputElement;
    this.panControl = this.node.querySelector(
      "[data-pan-control]",
    ) as HTMLInputElement;

    this.audioContext = audioManager.audioContext;
    this.gainNode = this.audioContext.createGain();
    this.panNode = new StereoPannerNode(this.audioContext, { pan: 0 });

    this.gainNode.connect(this.panNode);

    this.volumeControl.addEventListener("input", () =>
      this.handleVolumeControl(),
    );
    this.panControl.addEventListener("input", () => this.handlePanControl());
    this.firstNode = this.gainNode;
    this.lastNode = this.panNode;
  }

  handleVolumeControl() {
    this.gainNode.gain.value = parseInt(this.volumeControl.value);
  }
  handlePanControl() {
    this.panNode.pan.value = parseInt(this.panControl.value);
  }
  connectToDestination() {
    this.lastNode.connect(this.audioContext.destination);
  }
}

const master: AudioManager = new AudioManager();

let input: InputStage | undefined;
let output: OutputStage | undefined;

const inputElement: Element | null = document.querySelector(
  "[data-audio-player]",
);
if (inputElement) {
  input = new InputStage(inputElement, master);
}

const outputElement: Element | null = document.querySelector(
  "[data-output-stage]",
);
if (outputElement) {
  output = new OutputStage(outputElement, master);
}

if (input && output) {
  input.connectBefore(output);
  output.connectToDestination();
}
