---
title: "I Spent $1,000 and Two Days on an AI UI Refactor, Then Rolled It All Back"
description: "After nearly 20 subtasks, two days, and $1,023.32 in nominal token costs, I rolled back a full UI refactor of Typeflux. Here's why passing tests were not enough."
date: 2026-10-18
languages: "en,zh-CN"
image: "https://r.wy.is/content-creation/2026/10/16-a2376562-7616-4f39-8ff3-fc8d7da42a11.png"
---

I recently had a painful AI development failure.

The project ran for two days, involved nearly 20 subtasks, and racked up $1,023.32 in nominal token costs. When I finally saw the code it produced, I had to run `git reset --hard` and roll back the whole thing.

> That was 2.7 billion tokens, mostly across Claude Opus 5.5, GPT-6-Astra, and GPT-6.1-SOL. I subscribe to ChatGPT Pro and Claude Max, so my actual out-of-pocket cost was lower 😄.

It was a sharp reminder that **the old rules of software refactoring still matter in the age of AI agents. Letting agents carry out a huge redesign on their own does not make those rules go away.**

I want to share what happened, in case you're considering an AI-assisted refactor or fully automated development project of your own.

## 01. How it started: parallel agents left the UI in pieces

I've been upgrading **Typeflux**. It started as a voice input app and is evolving into a combination of launcher, voice input app, and AI agent.

![Typeflux interface](https://r.wy.is/bilingual-reader/production/d96ebf2a-4075-47bc-8ee0-7fd91a34621d/materials/6c5f2f99-73c8-406d-8fe2-2494b57a2ab2/08b7f216-a31f-4045-af74-506dc6cdb421)

To move faster, I had several agents build different features in parallel. After a few rounds, the app had more capabilities, but an irritating problem became obvious: **its UI had become a patchwork of unrelated components.**

* Page titles varied in size and spacing from one settings screen to the next.
* Even basic controls were inconsistent. Some search fields expanded as you typed; others were permanently open with rounded corners; still others had square corners.

Each agent had made its own design decisions without enough shared direction. The result felt like several apps stitched together.

## 02. The plan that looked good on paper: automate a system-wide refactor

Looking at those mismatched screens, I had an ambitious idea: **let AI agents carry out a complete UI refactor.**

I thought I had put enough guardrails around it. The plan had three stages:

1. **Set the design rules.** An agent would write a system-wide UI specification, and I would approve it before anything else changed.
2. **Build a shared component library.** The scattered controls would become standardized, reusable components.
3. **Migrate every screen.** The agents would replace the old UI, page by page, with those new components.

The execution plan looked equally thorough:

* **Task breakdown:** nearly 20 subtasks.
* **Model roles:** Claude Opus 5.5 as the lead agent for planning and coordination, with GPT-6.1-SOL and GPT-6-Astra handling implementation tasks.
* **Quality checks:** every code change had to pass unit tests before the next task began.

It all seemed well organized, so I left the agents running in the background.

![AI refactor task plan](https://r.wy.is/bilingual-reader/production/d96ebf2a-4075-47bc-8ee0-7fd91a34621d/materials/f08893d1-d028-47af-9678-c96f5c77b8a4/07540e3b-4b37-4de0-a4f1-d6d3b12316b3)

## 03. What I got after two days: code that passed tests but looked awful

Progress was slow because each subtask changed code and ran tests before moving on.

I waited almost two full days. When the last task finished, I opened the app, expecting to see a coherent new UI. **The result was far worse than I expected.**

All the unit tests passed. The code ran without errors. But the screens themselves were hard to look at:

* Layout proportions were badly off.
* Forcing pages into the new shared components broke interactions that had worked well before.
* Instead of feeling more unified, the interface looked rigid and awkwardly assembled.

After two days and roughly $1,000 in nominal token costs, I had code I couldn't ship. I rolled back all the AI-generated changes from those two days and returned to where I had started.

![Result of the UI refactor](https://r.wy.is/bilingual-reader/production/d96ebf2a-4075-47bc-8ee0-7fd91a34621d/materials/0030469c-1954-40c5-b057-009c8551b31d/32fb675f-b855-45d3-ba4e-8d1adf647ba4)

## 04. Three lessons from the rollback

Looking at the empty Git log, I tried to work out why the project had failed so badly.

### 1. Unit tests can catch broken logic, but they cannot judge visual coherence

This was my biggest blind spot. The agents working on individual pages focused on whether the features still worked and whether tests passed. But **unit tests cannot tell you whether a UI feels balanced, whether its hierarchy is clear, or whether an interaction makes sense.** The code was logically sound while the experience was a mess.

### 2. AI does not give us a shortcut around incremental refactoring

Software engineering has long warned against a “big bang” refactor: changing everything at once makes problems harder to spot and harder to undo. Small, incremental changes are easier to validate.

I ignored that advice and tried to let AI rebuild dozens of screens in one sweep. The scale of the change made the failure much more expensive.

### 3. A long feedback loop lets mistakes compound

For two days, I handed control to the agents without checking the interface as it evolved. If an early component design or page migration went wrong, the next tasks built on that mistake. By the time I saw the result, fixing the accumulated problems cost more than starting over.

## 05. What I'll do instead: smaller changes, with a person checking each one

I still want to make Typeflux's UI more consistent. The process will be different:

1. **Work on one module or interaction at a time.** I won't hand over another system-wide redesign as a single package.
2. **Run and inspect each change before committing it.** After replacing a component, I'll check the real interface and interaction, then commit only when they work.
3. **Keep human judgment in the loop.** AI remains a powerful coding assistant, but I need to make the final calls on visual design and user experience.

Starting small and checking each step is how I'll get to a UI I'm happy to ship.

![Lessons from the rollback](https://r.wy.is/bilingual-reader/production/d96ebf2a-4075-47bc-8ee0-7fd91a34621d/materials/81d9282e-d62a-4fb7-83cd-97f88af42335/f4cfba3e-48e8-496b-98c2-a036b424d923)

Have you tried a large AI-led refactor? If you've run into a similar problem, I'd like to hear what happened.
