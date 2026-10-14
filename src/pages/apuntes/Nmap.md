---
layout: ../../layouts/NotesLayout.astro
title: "Nmap"
description: "Guía rápida de escaneo de puertos, descubrimiento de hosts, servicios y scripts útiles en pruebas de seguridad."
---

# Nmap

## 1. ¿Para qué sirve?

Nmap es una herramienta de escaneo y análisis de redes. Se usa para descubrir hosts activos, puertos abiertos, servicios en ejecución y posibles vulnerabilidades o configuraciones interesantes.

## 2. Escaneo básico

```bash
nmap 10.10.10.10
```

Este escaneo realiza una comprobación rápida de puertos comunes y muestra información básica.

## 3. Escaneo de todos los puertos

```bash
nmap -p- 10.10.10.10
```

- `-p-` escanea todos los puertos TCP.
- Muy útil para localizar servicios menos habituales.

## 4. Escaneo agresivo con detección de servicios

```bash
nmap -sS -sV -sC -A 10.10.10.10
```

### Parámetros principales

- `-sS`: escaneo SYN (más silencioso y rápido).
- `-sV`: detecta versiones del servicio.
- `-sC`: ejecuta scripts por defecto de Nmap.
- `-A`: habilita detección agresiva (SO, versiones, scripts, traceroute).

## 5. Escaneo de red local

```bash
nmap 10.10.10.0/24
```

Este tipo de revisión sirve para descubrir equipos activos en una subred.

## 6. Descubrimiento de host

```bash
nmap -sn 10.10.10.0/24
```

- `-sn` hace un ping sweep sin escaneo de puertos.
- Muy útil para localizar hosts vivos antes de escanear servicios.

## 7. Escaneo con velocidades específicas

```bash
nmap -T4 -p- 10.10.10.10
```

- `-T4` aumenta la velocidad de escaneo.
- `-T0` es más lento y discreto.

## 8. Escaneo UDP

```bash
nmap -sU 10.10.10.10
```

Los puertos UDP suelen ser ignorados con frecuencia, pero pueden exponer servicios importantes.

## 9. Escaneo de puertos concretos

```bash
nmap -p 22,80,443,110 10.10.10.10
```

También puede usarse con rangos:

```bash
nmap -p 1-1000 10.10.10.10
```

## 10. Scripts útiles

Nmap incluye scripts para detectar vulnerabilidades o configuraciones:

```bash
nmap --script vuln 10.10.10.10
nmap --script smb-enum-shares 10.10.10.10
nmap --script http-enum 10.10.10.10
```

## 11. Ejemplo de escaneo útil para máquinas HTB/THM

```bash
nmap -sC -sV -p- --min-rate 1000 10.10.10.10
```

Esto suele dar una visión muy útil de:

- puertos abiertos
- servicios activos
- versiones
- posibles rutas de explotación

## 12. Salida típica

```text
PORT    STATE SERVICE VERSION
22/tcp  open  ssh     OpenSSH 8.2p1
80/tcp  open  http    Apache httpd 2.4.41
443/tcp open  https   nginx 1.18.0
```

## 13. Buenas prácticas

- No escanees demasiado rápido si el objetivo es sensible.
- Comprueba siempre el entorno antes de lanzar escaneos agresivos.
- Usa diferentes enfoques: básico, servicios, scripts y enumeración específica.

## 14. Resumen

Nmap es la base del reconocimiento activo. Si sabes usarlo bien, obtienes la información necesaria para decidir qué servicios revisar, qué puertos priorizar y qué caminos de explotación son más prometedores.
