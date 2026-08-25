---
title: "macOS 上的完全离线语音输入：Typeflux 本地模型工作原理"
description: "Typeflux 可以在你的 Mac 上完全本地完成语音转文字——不联网、不上传。这篇指南讲清楚本地语音模型是怎么工作的、有哪些可选模型、以及哪一款适合你。"
date: 2026-08-25
---

Typeflux 的核心体验很简单：按住 Fn 键说话，松手，文字就出现在你正在使用的应用里。这条链路里最关键的一步是**语音转文字（STT）**——把声音信号变成可以编辑的文字。

实现这一步有两条路：

| | 云端转写 | 本地转写 |
|---|---|---|
| 工作方式 | 把音频发到远程服务器，由服务器跑模型返回结果 | 在你自己的 Mac 上就地跑模型 |
| 优势 | 模型大、精度高、不占本地资源 | 离线可用、免费、速度快、隐私好 |
| 代价 | 需要网络、可能收费、音频要出设备 | 需要本地算力，模型文件要下载或内置 |

Typeflux 两条路都支持。这篇文章讲**本地转写**——你的声音永远不离开你的 Mac 的那条路。

## 运行时和模型：最容易混淆的两个概念

用一个类比快速说清楚：

> **运行时 = 播放器（比如 VLC），模型 = 电影文件。**

运行时是推理引擎：它知道怎么把音频喂给模型、怎么执行计算、怎么取出结果，但它本身不包含任何"语音知识"。模型则是一堆训练好的神经网络权重，存储了"听到什么声音 → 输出什么文字"的全部经验。

两者独立下载、独立存储，Typeflux 在需要时把它们组合起来工作。

## 五个本地模型，两套运行时

Typeflux 目前支持五个本地模型，背后是两套完全不同的运行时：

- **WhisperKit 运行时**（苹果 CoreML）：`whisperLocal`（medium)、`whisperLocalLarge`（large-v3）
- **Sherpa-ONNX 运行时**(ONNX Runtime）:`senseVoiceSmall`、`qwen3ASR`、`funASR`

### WhisperKit：苹果原生方案

[WhisperKit](https://github.com/argmaxinc/WhisperKit) 把 OpenAI 开源的 Whisper 模型转换成苹果 CoreML 格式，可以直接在 Apple Silicon 的**神经引擎（Neural Engine）**上高速运行。

每个 Whisper 模型由三个 CoreML 组件构成流水线：MelSpectrogram 把原始音频变成频谱图，AudioEncoder 提取语音特征，TextDecoder 逐个生成最终文字。

WhisperKit 是**进程内**运行的，直接编译进 Typeflux 主进程：

- **优势**：有流式进度回调（边转写边看到部分结果），延迟低。
- **代价**:medium 模型约 1.5GB,large-v3 约 3GB，加载后占用可观内存。
- **适合**：对转写质量要求高、Mac 内存充足的情况。

开启内存优化后，加载的 WhisperKit 实例闲置 30 分钟会自动释放；关闭则常驻内存。

### Sherpa-ONNX：轻量的跨平台方案

[Sherpa-ONNX](https://github.com/k2-fsa/sherpa-onnx) 是 k2-fsa 项目的语音处理工具包，底层使用微软的 ONNX Runtime。Typeflux 以**进程外**方式运行它：把音频转成 WAV，启动 `sherpa-onnx-offline` 子进程，从标准输出读取转写文字，随后子进程退出、内存立即释放。

- **优势**：每次转写完立刻释放内存；子进程崩溃也不会影响主 App。
- **代价**：没有中间进度，只能等整体完成。
- **适合**：日常快速语音输入——响应速度比绝对精度更重要的场景。

你会注意到这些模型文件名里的 `int8`（如 `model.int8.onnx`)，这是**量化**：把 32 位浮点权重压缩成 8 位整数。**模型体积缩小约 4 倍，精度损失通常只有 1-2%**——这就是 SenseVoice Small 只有 47MB、而 Whisper medium 要 1.5GB 的主要原因。

Typeflux 使用的 Sherpa-ONNX 运行时包是 `osx-universal2` 版本，Apple Silicon 和 Intel Mac 都支持。

## 实际使用中意味着什么

- **下载一次，永久离线可用。** 模型统一存放在 `~/Library/Application Support/Typeflux/LocalModels/`，目录里的 `prepared.json` 记录就绪状态；如果缺失，Typeflux 会在需要时自动下载。
- **有真正开箱即用的离线选择。** Full 版本把运行时和 SenseVoice 模型直接内置在安装包里，装完即可离线语音输入；Minimal 版本只内置运行时，首次使用时下载约 47MB 的模型。
- **默认隐私。** 选用本地模型后，音频完全在你的设备上处理，不会有任何上传。

## 该选哪个模型？

- **日常快速听写**（回消息、记笔记）:从 **SenseVoice Small** 开始——下载小、响应快，覆盖中、英、日、韩、粤语。
- **更重要的长转写**（会议纪要、要发布的文稿）:Mac 内存充足的话试试 **Whisper large-v3**。
- **想折腾**:Qwen3-ASR 和 FunASR/Paraformer 在设置里点一下就能下载。

模型随时可以切换——下载过程有实时进度，下载失败也不会影响你正在使用的模型。

---

*Typeflux 是免费开源软件（AGPL-3.0)。去[版本发布页](/zh-CN/releases)下载，或在 [GitHub](https://github.com/mylxsw/typeflux) 上浏览源码。*
