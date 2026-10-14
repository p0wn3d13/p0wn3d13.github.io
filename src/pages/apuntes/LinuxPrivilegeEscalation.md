---
layout: ../../layouts/NotesLayout.astro
title: "Privilege escalation en Linux"
description: "Notas rápidas sobre enumeración, permisos, sudo, cron, SUID y rutas comunes de escalada de privilegios en Linux."
---

# Privilege escalation en Linux

## 1. Objetivo

La escalada de privilegios consiste en pasar de un usuario con permisos limitados a otro con más privilegios, normalmente `root`.

## 2. Enumeración inicial

Antes de intentar explotar nada, conviene revisar:

```bash
id
whoami
sudo -l
uname -a
cat /etc/os-release
```

También es útil revisar:

```bash
ls -la
find / -perm -4000 2>/dev/null
find / -type f -name "*.conf" 2>/dev/null | head
```

## 3. Revisar sudo

```bash
sudo -l
```

Si un usuario puede ejecutar ciertos comandos como root, ese es un origen muy común de escalada.

Ejemplos:

```bash
sudo /usr/bin/python3 -c 'import os; os.system("/bin/bash")'
```

## 4. SUID y SGID

Los binarios con permisos SUID pueden ejecutarse con privilegios del propietario.

```bash
find / -perm -4000 2>/dev/null
find / -perm -2000 2>/dev/null
```

Si se encuentra un binario vulnerable o útil, puede explotarse para obtener un shell con privilegios.

## 5. Cron jobs

Los trabajos programados en cron pueden ser una puerta de escalada si se ejecutan como root y el contenido es modificable por el atacante.

```bash
ls -l /etc/crontab
ls -l /etc/cron* 
cat /etc/crontab
```

## 6. Archivos de configuración sensibles

Mucha información útil se encuentra en archivos de configuración o credenciales almacenadas sin protección adecuada.

```bash
cat /etc/passwd
cat /etc/shadow
ls -la /home
```

Si hay archivos con permisos laxos, a veces es posible extraer credenciales o contenido sensible.

## 7. Capabilities

Algunos binarios pueden tener capabilities Linux que permiten ejecutar comandos como root sin un sudo directo.

```bash
getcap -r / 2>/dev/null
```

## 8. Misconfiguraciones comunes

- usuario con permisos de sudo
- binarios SUID inesperados
- cron con archivos modificables
- scripts con permisos amplios
- archivos de configuración con credenciales sin cifrar
- `sudoers` mal configurado

## 9. Ejemplo de escalada por sudo

```bash
sudo -l
sudo /bin/bash
```

Si el usuario puede ejecutar `bash` como root, la escalada es inmediata.

## 10. Recomendaciones

- Enumerar siempre antes de ejecutar acciones peligrosas.
- Revisar `sudo -l`, permisos SUID y cron es casi siempre prioritario.
- Asegurarse de entender qué se está ejecutando como root antes de intentar cualquier payload.

## 11. Resumen

La escalada de privilegios en Linux normalmente se basa en entender permisos, procesos, tareas automáticas y rutas de ejecución privilegiada. La clave está en la enumeración: casi siempre hay un buen punto de entrada si miras con atención los permisos y las configs.
