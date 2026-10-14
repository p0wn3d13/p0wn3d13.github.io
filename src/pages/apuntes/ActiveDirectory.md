---
layout: ../../layouts/NotesLayout.astro
title: "Active Directory para Hacking Ético"
description: "Introducción a Active Directory, Kerberos, enumeración, trusts y movimiento lateral desde un enfoque ofensivo."
---

# Active Directory para Hacking Ético

## 1. ¿Qué es Active Directory?

Active Directory (AD) es el servicio de directorio que centraliza la administración de usuarios, equipos, grupos, políticas y permisos en entornos Windows empresariales.

Desde una perspectiva ofensiva, AD es clave porque:

- centraliza autenticación
- agrupa usuarios y equipos en dominios
- permite la administración basada en permisos
- almacena credenciales y hashes importantes
- facilita el movimiento lateral dentro de la red

## 2. Estructura básica

```text
Forest
└── Domain
    ├── Users
    ├── Groups
    ├── Computers
    ├── OUs
    └── Domain Controllers
```

### Componentes principales

- Forest: nivel superior del bosque de dominios.
- Domain: frontera administrativa y de seguridad.
- Domain Controller (DC): servidor encargado de autenticación y directorio.
- OU (Organizational Unit): contenedor lógico para aplicar políticas.
- Groups: agrupan permisos y acceso.
- Trusts: relaciones de confianza entre dominios o bosques.

## 3. Objetivos del atacante

Cuando se compromete un punto del dominio, el objetivo suele ser:

- enumerar usuarios y grupos
- localizar DCs y equipos activos
- identificar permisos privilegiados
- obtener credenciales o hashes
- moverse lateralmente
- comprometer el dominio completo

## 4. Enumeración básica

```powershell
whoami /groups
whoami /user
net user /domain
net group /domain
net group "Domain Admins" /domain
```

También es útil revisar:

```powershell
nltest /domain_trusts
dsquery user -name *
Get-ADUser -Filter *
Get-ADGroup -Filter *
```

## 5. Kerberos

Kerberos es el protocolo de autenticación principal en AD. En lugar de enviar contraseñas en claro, el cliente obtiene tickets cifrados.

### Flujo general

```text
Usuario -> AS-REQ -> KDC
KDC -> TGT -> Usuario
Usuario -> TGS-REQ -> Servicio
Servicio -> Acceso autorizado
```

### Conceptos clave

- TGT: Ticket Granting Ticket, ticket de autenticación inicial.
- TGS: Ticket Granting Service, ticket para acceder a un servicio concreto.
- krbtgt: cuenta de Kerberos del dominio, muy sensible.

## 6. Ataques comunes

### Kerberoasting

Consiste en solicitar TGS a servicios con cuentas de servicio y luego crackearlos offline.

### Pass-the-Hash

Permite autenticarse con un hash NTLM sin necesidad de la contraseña en claro.

### Golden Ticket

Es una técnica avanzada que reutiliza el hash de krbtgt para generar tickets falsificados de alta confianza.

### Pass-the-Ticket

Permite reutilizar tickets Kerberos robados de memoria.

## 7. Movimiento lateral y escalada

En entornos AD, el movimiento lateral suele ser más crítico que la explotación local. Los caminos típicos son:

- reutilización de credenciales
- abuso de permisos en grupos
- delegación de control
- GPOs para ejecución remota
- abuso de servicios con privilegios elevados

## 8. Detecciones útiles

```powershell
Get-ADComputer -Filter *
Get-ADUser -Properties * -Filter *
Get-ADGroupMember "Domain Admins"
```

También puedes revisar la presencia de:

- cuentas con privilegios de administración
- usuarios activos sin MFA
- grupos con permisos excesivos
- equipos en OU críticas
- servicios con asignación de contraseña conocida

## 9. Consejos prácticos

- No te quedes solo con usuarios y grupos; analiza las relaciones.
- AD debe verse como un grafo de permisos, no como un conjunto de máquinas aisladas.
- Las rutas de ataque más comunes suelen venir de credenciales reutilizadas, permisos excesivos y configuración débil.

## 10. Resumen

Active Directory es el centro neurálgico de los entornos Windows empresariales. Desde la fase de reconocimiento hasta la explotación final, entender su estructura, Kerberos y relaciones de permisos es clave para comprender cómo se mueve un atacante dentro del dominio.

En otras palabras: si comprometes una cuenta con permisos adecuados, puedes llegar a controlar más de lo que parece.
