---
title: "More Than Voice Typing: A macOS Input Method That Polishes Your Words with AI"
description: "Most voice typing apps transcribe what you said. Typeflux goes further — select any text, speak an instruction like 'make it more formal' or 'translate to English', and it rewrites in place, in any Mac app. Free and open-source."
date: 2026-09-11
---

Voice typing has a ceiling. It writes down what you *said* — not what you *meant*. So the real workflow looks like this: dictate, then clean up the spoken ramble by hand, or copy the text into an AI chat window, ask for a polish, copy the result back. Three apps, two clipboards, one broken train of thought.

Typeflux was built to collapse that into a single gesture. It's a voice input method for macOS that doesn't stop at transcription — it edits, rewrites, and polishes with AI, right where your cursor already is.

## The baseline: voice in, text out, anywhere

Hold the **Fn** key, speak naturally, release. Typeflux turns your voice into clean text and inserts it directly into whatever app you're using — email, messages, notes, documents, code comments, forms. No chat window to open first, no copy-paste step. This part is fast, accurate, and free.

But transcription is only the floor. The interesting part is what happens next.

## The superpower: select text, speak an instruction

Select any text in any app, hold Fn, and *tell* Typeflux what to do with it:

- "Make this more formal"
- "Translate it into English"
- "Condense this to three sentences"
- "Format this as a Markdown list"

Typeflux rewrites the selection in place. The AI isn't in another window — it's inside the text field you're already working in. This is the difference between a dictation tool and an AI input method: **the polish happens at the cursor, not in a separate app.**

A few ways this plays out day to day:

- **Email:** dictate a rough reply in your own words, then select it and say "make it professional." Send.
- **Chat:** type fast and loose, select, "fix the grammar and tone it down." Send.
- **Docs:** brainstorm out loud — messy, half-formed — then "organize this into an outline."
- **Code:** select a confusing function, "write a doc comment for this."

## Ask Anything: your voice, a full AI agent

Press **Fn twice** and Typeflux opens "Ask Anything" — a voice-driven AI agent for questions, rewriting, and more complex operations that go beyond a single selection. It's the same idea taken one step further: your voice isn't just an input device for text, it's a command interface for your writing tools.

## Personas: the right tone for every context

Polishing isn't one-size-fits-all. The rewrite you want for a client email is not the rewrite you want for a group chat. Typeflux lets you create **custom personas** for different scenarios — professional at work, relaxed in social settings — so "polish this" means the right thing in each context.

## Your choice of engine: local or cloud

Typeflux is free and open-source (AGPL-3.0), and the architecture follows one principle: the choice belongs to you.

- **Privacy-first:** run local speech models and a local LLM, and nothing leaves your Mac. Offline voice typing plus offline AI polish.
- **Convenience-first:** use Typeflux Cloud, or plug in your own cloud model service, for the largest models and zero local resource use.

Either way, the core experience — hold, speak, polished text at your cursor — is identical. And because local models have no word caps or quotas, you can dictate and rewrite as much as you want without watching a meter. (Curious how the offline side works? See [Fully Offline Voice Typing on macOS](/blog/local-models-offline-voice-typing).)

## Why this category is different

Most voice typing apps answer one question: *"How do I turn speech into text?"* The more useful question is *"How do I turn what I mean into finished writing?"* Spoken language is messy — full of restarts, filler, and half-sentences — and the last mile of writing has always been editing. An input method that polishes with AI doesn't just save you keystrokes; it removes the editing pass entirely for a huge share of everyday writing.

That's the bet behind Typeflux: not another editor, not another chatbot — a voice-native input layer that makes finished text the default, in every app you already use.

---

*Typeflux is free and open-source under AGPL-3.0. Download it from the [Releases page](/releases), or browse the source on [GitHub](https://github.com/mylxsw/typeflux).*
