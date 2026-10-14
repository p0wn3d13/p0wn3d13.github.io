---
layout: ../../layouts/NotesLayout.astro
title: "Reconocimiento web"
description: "Pasos básicos para mapear una web, buscar información útil y descubrir endpoints, tecnologías y superficie de ataque."
---

# Reconocimiento web

## 1. Objetivo

Antes de explotar una aplicación web, es necesario construir una imagen clara del sistema objetivo. La fase de reconocimiento ayuda a responder preguntas como:

- ¿Qué tecnología usa?
- ¿Qué endpoints existen?
- ¿Qué puertos y servicios responden?
- ¿Hay subdominios o rutas ocultas?
- ¿Hay archivos sensibles o vulnerabilidades de configuración?

## 2. Reconocimiento pasivo

### WHOIS y DNS

```bash
whois example.com
dig example.com
nslookup example.com
```

Esto ayuda a identificar:

- propietario del dominio
- servidores DNS
- registros MX, NS y A
- infraestructura básica

### Technology fingerprinting

```bash
whatweb https://example.com
curl -I https://example.com
```

También es útil revisar:

- `robots.txt`
- `sitemap.xml`
- cabeceras HTTP
- tecnologías visibles en HTML

## 3. Reconocimiento activo

```bash
nmap -sC -sV example.com
```

Con esto se puede saber si hay:

- `http`
- `https`
- servicios alternativos
- tecnologías ocultas por detrás de la web

## 4. Directorios y endpoints

```bash
gobuster dir -u https://example.com -w /usr/share/wordlists/dirb/common.txt
```

Otras herramientas muy útiles:

```bash
ffuf -u https://example.com/FUZZ -w /usr/share/wordlists/dirb/common.txt
feroxbuster -u https://example.com -w /usr/share/wordlists/dirb/common.txt
```

Esto sirve para encontrar:

- paneles de administración
- archivos ocultos
- rutas de API
- endpoints de login

## 5. Archivos interesantes

Al realizar reconocimiento web, conviene revisar rápidamente estas rutas:

```text
/robots.txt
/sitemap.xml
/.git/
/.env
/admin/
/login/
/api/
```

También puede ser útil buscar errores o mensajes que filtren:

- versiones de frameworks
- rutas internas
- nombres de archivos
- stack tecnológico

## 6. WAF y protección

```bash
wafw00f https://example.com
```

Un WAF puede alterar el comportamiento de la aplicación y complicar la explotación, pero también suele revelar qué infraestructura está protegiendo la web.

## 7. Enumeración de subdominios

```bash
sublist3r -d example.com
amass enum -d example.com
```

Los subdominios suelen ocultar:

- APIs internas
- paneles de administración
- entornos de prueba
- servicios externos no visibles desde el dominio principal

## 8. Técnica recomendada

El flujo más habitual suele ser:

1. Información DNS y WHOIS
2. Escaneo de puertos y servicios
3. Identificación de tecnologías
4. Enumeración de caminos y archivos
5. Intercepción y análisis de peticiones
6. Explotación de las vulnerabilidades detectadas

## 9. Resumen

El reconocimiento web es la base del pentesting web. Un buen mapeo del sitio, de sus rutas y de sus tecnologías suele ahorrar tiempo, reduce ruido y permite atacar de forma más segura y eficaz.
