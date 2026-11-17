# AGENTS.md

Repo ini berisi satu skill: **remotion-explainer-video** — alur kerja membuat video explainer vertikal (1080x1920, 60 fps) dengan Remotion dari sebuah topik.

Untuk agent apa pun (Codex, Hermes, Cursor, Gemini CLI, dll.):

- Saat user meminta video Remotion / video explainer / video "cara kerja X", **baca dan ikuti** `skills/remotion-explainer-video/SKILL.md` langkah demi langkah.
- Template proyek ada di `skills/remotion-explainer-video/template/`. Salin isinya ke folder baru bernama judul video (UPPERCASE); jangan mengedit template di repo ini kecuali sedang memperbaiki skill-nya.
- Tool yang dibutuhkan di mesin user: Node.js 18+, Python 3 + numpy, ffmpeg, dan whisper.cpp (untuk sinkron VO).
- Jangan commit file media (mp4/wav/mp3), `node_modules`, `out/`, atau `.whisper/`.

Mengembangkan repo ini:
- Cek template: salin `template/` ke folder sementara, `npm install`, lalu `npx tsc --noEmit` dan `node scripts/stills.mjs 60 300 600`.
