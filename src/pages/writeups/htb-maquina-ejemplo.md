---
layout: ../../layouts/Layout.astro
title: "HTB Writeup: Máquina Ejemplo | p0wn3d"
---

<div class="section">
    <div class="section-header">
        <i class="fas fa-flag text-slate-400"></i>
        <h3>HackTheBox: Máquina Ejemplo</h3>
    </div>

Aquí es donde escribes tu texto en Markdown puro y duro. Puedes usar **negritas**, hacer listas de tus hallazgos o documentar cómo explotaste una vulnerabilidad.

## 1. Enumeración

Empezamos lanzando un escaneo de puertos básico con Nmap para ver qué tenemos expuesto en la máquina objetivo:

```bash
nmap -p- --open -sS --min-rate 5000 -n -Pn 10.10.10.10 -oG allPorts