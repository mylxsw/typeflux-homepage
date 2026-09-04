---
title: "Fully Offline Voice Typing on macOS: How Typeflux's Local Models Work"
description: "Typeflux can transcribe your voice entirely on your Mac — no network, no uploads. This guide explains how local speech models work, which ones you can choose, and which one fits you."
date: 2026-08-25
---

Typeflux's core experience is simple: hold the Fn key, speak, release — and the text lands in whatever app you're using. The critical step in that chain is speech-to-text (STT): turning sound into editable words.

There are two ways to do that:

| | Cloud transcription | Local transcription |
|---|---|---|
| How it works | Audio is sent to a remote server, which runs a model and returns the text | The model runs on your own Mac, in place |
| Strengths | Larger models, high accuracy, no local resource usage | Works offline, free, fast, private |
| Trade-offs | Needs a network, may be billed, audio leaves your device | Needs local compute, model files must be downloaded or bundled |

Typeflux supports both. This post is about the local path — the one where **your voice never leaves your Mac**.

## Runtime vs. model: the two pieces everyone confuses

A quick analogy:

> **Runtime = a video player (like VLC). Model = a movie file.**

The runtime is an inference engine: it knows how to feed audio into a model, run the computation, and read the result — but it contains no "speech knowledge" itself. The model is a set of trained neural-network weights that stores all the experience of "this sound → these words."

The two are downloaded and stored separately, and Typeflux combines them when needed.

## Five local models, two runtimes

Typeflux currently supports five local models built on two very different runtimes:

- **WhisperKit runtime** (Apple CoreML): `whisperLocal` (medium), `whisperLocalLarge` (large-v3)
- **Sherpa-ONNX runtime** (ONNX Runtime): `senseVoiceSmall`, `qwen3ASR`, `funASR`

### WhisperKit: the Apple-native path

[WhisperKit](https://github.com/argmaxinc/WhisperKit) converts OpenAI's Whisper models into Apple's CoreML format so they can run at high speed on the Apple Silicon **Neural Engine**.

Each Whisper model is a pipeline of three CoreML components: a MelSpectrogram stage that turns raw audio into a spectrogram, an AudioEncoder that extracts speech features, and a TextDecoder that generates the final text token by token.

WhisperKit runs **in-process**, directly inside Typeflux:

- **Plus**: streaming progress callbacks (you see partial results as it works) and low latency.
- **Cost**: the medium model is about 1.5 GB, large-v3 about 3 GB — and they hold memory while loaded.
- **Best for**: when transcription quality matters most and your Mac has memory to spare.

With memory optimization enabled, a loaded WhisperKit instance is released after 30 idle minutes; otherwise it stays resident.

### Sherpa-ONNX: the lightweight, cross-platform path

[Sherpa-ONNX](https://github.com/k2-fsa/sherpa-onnx) is a speech toolkit from the k2-fsa project, built on Microsoft's ONNX Runtime. Typeflux runs it **out-of-process**: it converts your audio to WAV, spawns the `sherpa-onnx-offline` command-line tool with the right model, reads the transcribed text from stdout, and the subprocess exits — freeing its memory immediately.

- **Plus**: memory is released as soon as each transcription finishes, and a crash can never take down the main app.
- **Cost**: no intermediate progress — you get the result when it's done.
- **Best for**: everyday quick voice input, where responsiveness matters more than absolute precision.

You'll notice `int8` in these model file names (e.g. `model.int8.onnx`). That's quantization: compressing 32-bit floating-point weights down to 8-bit integers. **The model shrinks roughly 4×, usually at the cost of only 1–2% accuracy** — which is why SenseVoice Small is just 47 MB while Whisper medium needs 1.5 GB.

The Sherpa-ONNX runtime bundle Typeflux uses is `osx-universal2`, so it works on both Apple Silicon and Intel Macs.

## What this means in practice

- **Download once, use forever offline.** Models are stored under `~/Library/Application Support/Typeflux/LocalModels/`, with a `prepared.json` marker recording readiness. If it's missing, Typeflux downloads the model on demand.
- **A truly offline option exists.** The Full build variant bundles the runtime and the SenseVoice model inside the app — voice typing works out of the box, no download required. The Minimal variant bundles just the runtime and fetches the ~47 MB model on first use.
- **Privacy by default.** With a local model selected, audio is processed entirely on your device. Nothing is uploaded.

## Which model should you pick?

- **Daily quick dictation** (messages, notes, quick replies): start with **SenseVoice Small** — small download, fast turnaround, and it covers Chinese, English, Japanese, Korean, and Cantonese.
- **Higher-stakes, longer transcription** (meeting notes, drafts you'll publish): try **Whisper large-v3** if your Mac has the headroom.
- **Want to experiment**: Qwen3-ASR and FunASR/Paraformer are one download away in Settings.

You can switch models at any time in Typeflux's settings — downloads show live progress, and a failed download never interrupts the model you're currently using.

---

*Typeflux is free and open-source under AGPL-3.0. Download it from the [Releases page](/releases), or browse the source on [GitHub](https://github.com/mylxsw/typeflux).*
