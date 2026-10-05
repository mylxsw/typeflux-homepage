---
title: "Why Bluetooth Voice Typing Loses the First Words—and How We Fixed It in Typeflux"
description: "The first audio buffer arrived in 25 ms, but sound took 1.67 seconds. We traced the gap to zero-filled Bluetooth audio, changed microphone selection and readiness, and corrected a misleading delivery timer."
date: 2026-10-05
---

You press Typeflux's voice-input shortcut while wearing Bluetooth headphones. The recording overlay appears, you start speaking, and the result comes back without the first few words.

One number made us look closer: **25 ms**. That's how quickly the driver delivered the first audio buffer in the recording we investigated. If audio was arriving that fast, where did the beginning of the sentence go?

The first **1.42 seconds of audio contained nothing but zeros**. The app had told the user it was ready before the microphone was delivering sound.

## A buffer can arrive before sound does

These measurements come from one recording before the fix. They aren't a benchmark for every Bluetooth headset.

| Measurement | This recording | What it tells us |
|---|---|---|
| Wait for first device buffer | 25 ms | The driver started delivering data quickly |
| Leading zero-filled audio | 1.42 s | That data initially contained no sound signal |
| Key press to first microphone signal | 1.67 s | The full gap between activation and nonzero audio |

[![Typeflux diagnostics before the fix: a 25 ms first-buffer wait, 1.42 seconds of zero-filled audio, and 1.67 seconds from key press to microphone signal](/blog-assets/bluetooth-voice-input-delay/diagnostics-before.png)](/blog-assets/bluetooth-voice-input-delay/diagnostics-before.png)

Our readiness check accepted any audio buffer with a positive frame count. That worked for an input that started delivering sound immediately. With Bluetooth, it also accepted the zero-filled buffers arriving during startup.

The user spoke during that gap. A better speech model couldn't recover words that had never been captured.

## Opening the headset microphone changes the connection

Common Bluetooth headsets use a high-quality playback profile, usually A2DP, for listening. Opening their microphone switches them to a two-way call profile, typically HFP.

[Apple's support documentation](https://support.apple.com/en-us/102217) describes the same tradeoff: using a Bluetooth headset's microphone switches its operating mode and reduces playback quality until the microphone is no longer in use.

In our recording, the input delivered exact zeros for 1.42 seconds before sound appeared. That was consistent with a Bluetooth route still preparing. The duration depends on the headset, macOS, and the connection's current state; it isn't a fixed delay for all devices.

A built-in microphone doesn't need that Bluetooth profile switch.

## Our first proposal still left the user waiting

The first suggestion was to delay the ready cue on Bluetooth inputs until a nonzero sample arrived.

That doesn't mean asking the user to say something before recording can begin. Ordinary quiet audio, including background noise, counts as a signal. We're distinguishing exact digital zeros from a working microphone, rather than waiting for recognizable speech.

This would reduce early cues and missing words, but it would leave the startup delay in place. Keeping the microphone open between dictations could avoid another switch. Typeflux's Instant Voice Input already had a warm window for that purpose.

The cost was hard to accept as a default: a Bluetooth microphone held open can keep the headphones in call mode. Faster dictation shouldn't require leaving someone's music at reduced quality afterward.

## Let the headphones play and the Mac record

We looked at other open-source approaches. [OpenWhisper's fix](https://github.com/marcoshernanz/OpenWhisper/pull/10) uses the built-in microphone when Bluetooth headphones are playing audio. [A transcripted dictation change](https://github.com/r3dbars/transcripted/pull/1827) also avoids Bluetooth input in its microphone-selection policy.

That helped clarify the default we wanted. Wearing headphones doesn't necessarily mean their microphone is the best input for a short dictation at a MacBook.

For that desk-bound use, I'd rather leave playback on the headphones and capture speech through the Mac. If you're away from the computer, or the headset microphone works better in your surroundings, an explicit microphone choice should take priority.

We put the new policy into Typeflux's existing **Automatic microphone mode**:

- Keep the system default when it isn't Bluetooth.
- When it is Bluetooth, prefer a usable built-in microphone, then USB, then supported wired inputs such as Thunderbolt.
- Skip the built-in microphone when a MacBook's lid is closed. Use a suitable external input if available; otherwise keep the Bluetooth default.
- Respect an explicitly selected microphone, including a Bluetooth headset.

The app identifies Bluetooth through the system's device transport type, rather than checking for “AirPods” in a name. It doesn't substitute virtual or remote microphones automatically.

An early proposal suggested a separate toggle. The implementation instead changes Automatic mode and updates its settings explanation. Both regular recording and Instant Voice Input use this selection policy.

There is also a timing detail for developers: **choose the device before opening capture where the audio API permits it.** OpenWhisper's investigation found that creating an `AVAudioEngine` input node could open the default microphone before another device was selected. Typeflux's regular Core Audio recorder binds its input device before starting capture, so device selection can happen first.

Instant Voice Input still uses `AVAudioEngine`. Both paths now share the selection policy, but whether this older engine briefly opens the Bluetooth default during initialization still needs a hardware check.

## When Bluetooth is the input, the ready cue waits

Sometimes there's no suitable alternative microphone. Sometimes the user deliberately chooses the headset.

For those recordings, Typeflux now waits for nonzero audio before presenting the ready recording state. Built-in and wired inputs retain first-buffer readiness. An [unmerged Handy proposal](https://github.com/cjpais/Handy/pull/2154) discusses a similar nonzero-sample check.

The signal wait is capped at **2.5 seconds**, provided audio buffers have arrived. If those buffers still contain no signal, the recording UI is allowed to proceed. This avoids an indefinite wait; it doesn't prove that a muted or faulty input has recovered.

We keep the captured audio, including the opening zeros. The change affects when we tell the user to speak, rather than trimming the recording.

The headset still takes time to switch. The fallback reduces the chance that our own cue invites speech before the input is ready.

## The other 1.67 seconds belonged to clipboard cleanup

The same screenshot contained another **1.67 s** measurement: result delivery.

That was a separate stage after recording stopped. The total post-stop processing time was 3.38 seconds, with 230 ms for audio preparation, 631 ms for recognition confirmation, and 537 ms for AI generation. Delivery appeared to account for a large share of the remaining time.

Typeflux sometimes inserts text through paste. Some editors don't reliably expose the resulting text change through macOS accessibility APIs, so we can't immediately confirm success. In that case, Typeflux keeps the clipboard payload available for 1.5 seconds from paste dispatch before attempting to restore the previous contents.

The old timer ended after that cleanup. It included clipboard retention in “result delivery,” even though the paste might already have put the words on screen.

We now record the write time when native insertion returns or paste has been dispatched. Clipboard restoration still runs through the existing flow, but no longer inflates delivery timing. For an unconfirmed paste, this timestamp measures dispatch; it isn't frame-by-frame proof that text appeared.

A smaller number from this correction isn't a faster speech model or AI request. It gives us a more useful account of the wait.

The fix is in the [Typeflux source](https://github.com/mylxsw/typeflux/pull/291), with tests covering selection, Bluetooth readiness, and delivery timing.

## Choosing a microphone now

If you usually dictate at an open MacBook while listening through Bluetooth headphones, leave Typeflux's microphone set to Automatic. It will prefer the built-in microphone or a suitable wired input when the system default is Bluetooth.

For a closed-lid setup with an external microphone, you can select that device directly. If you need the headset microphone while moving around, choose it explicitly and wait for the recording-ready state before speaking.
