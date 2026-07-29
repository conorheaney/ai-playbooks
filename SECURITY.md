# Running OpenCode in Isolated Windows Environments

## 1. Purpose

This guide explains four ways to run OpenCode with less access to a Windows host: Windows Sandbox, a dedicated virtual machine, a container, and Windows Subsystem for Linux 2 (WSL2). It compares what each option isolates, what crosses the boundary, how OpenCode behaves inside it, and how to start with a practical configuration.

The commands and product details were checked on 29 July 2026 for OpenCode 1.18.9. Recheck them against current product documentation before relying on them.

This is an environment-hardening guide, not a vulnerability-reporting policy. It does not make generated code trustworthy or replace review, testing, backups, endpoint protection, patching, or organisational security controls.

The central principle is simple: OpenCode and every command, plugin, model context protocol (MCP) server, formatter, language server, and child process it starts receive the access available inside their operating environment. OpenCode permission prompts are useful controls, but they are not an operating-system security boundary.

## 2. Threat Model

An AI coding agent processes instructions from people and from potentially untrusted content such as repositories, documentation, issue text, web pages, logs, package metadata, and tool output. A useful isolation design assumes that the agent or one of its tools could make an incorrect or unsafe request.

Isolation can reduce the effect of:

- Accidental reads of unrelated source code, credentials, browser data, SSH keys, or personal files.
- Accidental changes or deletion outside the intended repository.
- Prompt injection that attempts to broaden the task, inspect secrets, or invoke tools.
- Malicious repository scripts, dependencies, plugins, MCP servers, formatters, or language servers.
- Generated shell commands that have effects beyond the project.
- Persistence left by a compromised dependency or tool.
- Project-supplied OpenCode plugins that execute when OpenCode starts.

Isolation does not by itself address:

- Sensitive information intentionally included in prompts or files exposed to the environment.
- Data sent to a model provider, web service, package registry, MCP server, or other allowed network destination.
- Unsafe changes within a writable project.
- Secrets deliberately mounted, pasted, or supplied as environment variables.
- Vulnerabilities that escape the selected isolation technology.
- A hostile or compromised host administrator, hypervisor, container daemon, or endpoint security product.
- Incorrect output accepted without human review and independent checks.

Define the task before choosing the environment. Identify the files that must be readable, the locations that must be writable, the commands that must run, the network destinations that must be reached, the secrets that are required, and the evidence needed to review the result.

## 3. Comparison

The word *sandbox* is also a generic term for any constrained environment. In this guide, **Windows Sandbox** means the Microsoft Windows feature.

| Option | Technical model | Host-file access by default | Persistence | Relative isolation | Best fit |
| --- | --- | --- | --- | --- | --- |
| Windows Sandbox | Disposable Windows VM with a separate kernel | None until folders or integrations are exposed | Discarded when closed | Strong | Short, disposable investigations and trials |
| Dedicated VM | Complete guest OS with virtual hardware and a separate kernel | None until shares, redirected drives, or transfer paths are added | Persistent | Strongest practical option | Repeated work with a durable, controlled environment |
| Container | Isolated Linux processes and filesystem sharing the container host kernel | Only bind-mounted paths, named volumes, and integrations | Writable layer is disposable when removed; images and volumes persist until deleted | Moderate to strong | Routine project work with narrow filesystem mounts |
| WSL2 | Microsoft-managed Linux utility VM designed for Windows integration | Windows drives are writable under `/mnt` by default | Persistent | Limited as a host-security boundary | Linux compatibility and development convenience |

No ranking is absolute. A badly configured VM with the host drive redirected can expose more than a carefully configured container with one project mounted. The effective boundary is determined by folder sharing, credentials, network access, clipboard and device redirection, privileges, persistence, and host integration.

## 4. Shared Security Controls

Apply these controls regardless of the selected technology.

### 4.1 Minimise Exposed Files

Expose one repository or a smaller task-specific copy instead of a parent directory containing many projects. Do not expose an entire drive or user profile. Avoid exposing `.ssh`, browser profiles, cloud credentials, password stores, personal documents, package-manager credentials, or unrelated source code.

Use read-only access for review and analysis. If OpenCode must create changes, prefer a disposable working copy or isolated branch. A writable mount permits modification and deletion of anything writable beneath it.

### 4.2 Separate Input and Output

A useful pattern for higher-risk work is:

| Location | Access | Purpose |
| --- | --- | --- |
| Approved input | Read-only | Repository snapshot, requirements, and reference material |
| Isolated workspace | Read-write inside the environment | Builds, dependency installation, and candidate changes |
| Export location | Narrow and writable | Reviewed patch, diff, report, or selected artifacts |

Review exported material on the host before applying it. Do not automatically execute generated scripts or binaries after export.

### 4.3 Minimise Secrets

Use task-specific, short-lived, least-privilege credentials. Avoid mounting the host credential store or SSH directory. Do not bake secrets into images, VM templates, startup scripts, `.wsb` files, repositories, or shell history.

Environment variables are convenient but are visible to processes and management interfaces with sufficient privilege. Container environment variables can be inspected by users controlling the Docker daemon. Prefer an interactive login or an appropriate secret mechanism, and remove or rotate credentials after higher-risk work.

Verify OpenCode executables, guest installation media, container images, package sources, and derived images before use. Record the source, version, published signature or hash where available, and container digest. Pinning establishes identity; it does not provide future security updates.

### 4.4 Control Network Access

OpenCode normally needs network access to a model provider. Additional features may contact model metadata services, package registries, web pages, remote MCP servers, update services, source hosts, and telemetry endpoints.

No network is the safest setting, but it is incompatible with hosted models. When network access is required, limit destinations through host firewall rules, a controlled proxy, network segmentation, or an organisation-managed egress gateway. Remember that network address translation provides connectivity; it is not an outbound allowlist.

Do not expose `opencode serve` or `opencode web` beyond the local machine unless required. Bind published ports to loopback and set `OPENCODE_SERVER_PASSWORD`. Authentication does not encrypt HTTP traffic. Non-loopback access requires TLS through a trusted reverse proxy or an equivalently protected tunnel, in addition to authentication and firewall controls. Treat remote MCP servers and plugins as additional trust relationships.

### 4.5 Keep Human Controls

Keep OpenCode permissions restrictive even inside isolation. Isolation limits impact; it does not make every action appropriate. Use plan or read-only modes for exploration, review diffs before accepting changes, and run checks independently.

Do not use `--auto` for untrusted work. Auto mode approves requests that would otherwise ask, although explicit deny rules remain enforced.

An unreviewed project can contain OpenCode configuration and auto-discovered plugins under `.opencode/plugin/` or `.opencode/plugins/`. Plugin code runs in the OpenCode process and is not contained by ordinary tool permission prompts. Inspect these files before a normal launch. Use `opencode --pure` for the first inspection and inject a final restrictive permission configuration rather than trusting project-supplied permissions.

### 4.6 Patch and Rebuild

Patch Windows, WSL, Docker Desktop, guest operating systems, OpenCode, plugins, MCP servers, and development tools. Pin important versions or image digests and upgrade deliberately. Rebuild disposable environments rather than allowing them to accumulate unknown state.

### 4.7 Verify the Boundary

Test the boundary from inside the actual environment and account used by OpenCode. Attempt to read an unshared host location, write to each read-only location, reach an unapproved network destination, use the clipboard, invoke a host executable, and persist a harmless marker across disposal or restart. A configuration file is not evidence that the control took effect.

## 5. Windows Sandbox

### 5.1 How It Works

Windows Sandbox is a lightweight, disposable Windows virtual machine. It uses hardware virtualisation and a separate Windows kernel. Host applications are not automatically installed in the sandbox, and closing the sandbox discards its local software, files, and state. On Windows 11 22H2 and later, state can survive a restart initiated inside the current sandbox, but closing the sandbox still disposes of it.

Windows Sandbox is supported on eligible Windows Pro, Enterprise, Pro Education/SE, and Education editions. It is not supported on Windows Home. Hardware virtualisation must be enabled.

### 5.2 Security Boundary

The separate kernel provides a materially stronger boundary than running OpenCode directly or in ordinary WSL2. It is well suited to short tasks where a clean environment is valuable.

The boundary is weakened by enabled integrations. Networking and clipboard redirection are enabled by default. A mapped host folder is writable by default unless `<ReadOnly>true</ReadOnly>` is set. Writes to a writable mapped folder remain on the host after the sandbox closes.

`ProtectedClient` runs Windows Sandbox with an additional AppContainer isolation boundary. It can reduce client-side exposure but may restrict convenience features. Disabling vGPU removes an unnecessary graphics interface for terminal-based work.

### 5.3 Files and Persistence

Map only pre-existing, narrow host folders. Treat a read-only mapping as disclosure of every readable file in that folder. For higher-risk work, map source material read-only, copy it into sandbox-local storage, work on the local copy, and export only a reviewed patch or artifact through a separate writable folder.

A directly mapped writable project is convenient but allows immediate host changes. The disposable sandbox does not undo those changes.

### 5.4 Network and Credentials

Disabling networking is appropriate for offline inspection, but OpenCode cannot use a hosted model without connectivity. If a provider must be reached, enable networking and understand that Windows Sandbox does not provide a simple per-domain egress allowlist. Use external firewall, proxy, or network controls where the risk requires it.

Avoid mapping the host OpenCode data directory because it may contain sessions and credentials. Create temporary sandbox-specific configuration and credentials. Do not enable clipboard redirection merely to paste a long-lived secret; use a short-lived credential entered directly in the sandbox or a controlled secret-delivery mechanism.

### 5.5 OpenCode Considerations

Windows Sandbox runs Windows applications, so use the Windows OpenCode executable. OpenCode, Git, language runtimes, and project tools must be copied, downloaded, or installed for each fresh sandbox unless startup automation provides them.

OpenCode's local project configuration travels with a copied project. Global configuration does not. Paths in a host global configuration may not exist in the sandbox. Keep the sandbox configuration minimal and avoid loading unnecessary global plugins, agents, or skills.

### 5.6 Strengths and Limitations

| Strength | Limitation |
| --- | --- |
| Separate kernel and clean start | State and installed tools are lost when closed |
| Included in supported Windows editions | Not available on Windows Home |
| Read-only host-folder mappings | Hosted models require network access |
| Simple disposal | Writable mappings persist changes on the host |
| Good for unknown tools or repositories | Repeated full development setup is inconvenient |

Use Windows Sandbox when a task is short, the required inputs are easy to map narrowly, and disposable state is desirable. Prefer another option for a durable development environment.

## 6. Dedicated Virtual Machine

### 6.1 How It Works

A virtual machine runs a complete guest operating system with virtual hardware and its own kernel. Hyper-V is the built-in Windows hypervisor on supported editions. VMware and VirtualBox provide alternatives with different management and integration features.

A Hyper-V guest runs in a child partition with private virtual memory and mediated device access. A Generation 2 VM supports modern firmware and Secure Boot. For common Linux guests, Hyper-V normally uses the `MicrosoftUEFICertificateAuthority` Secure Boot template.

### 6.2 Security Boundary

A dedicated VM provides the strongest practical persistent boundary among these options. It can have independent users, storage, patching, firewall rules, snapshots, and network interfaces. It does not automatically receive access to host files.

The host and hypervisor remain trusted. A host administrator can normally inspect or alter ordinary VM storage. Shielded VM infrastructure can provide stronger protection from fabric administrators, but it is significantly more complex and is outside the needs of most local development setups.

### 6.3 Files and Persistence

Keep the repository in the guest. Clone it using a scoped source-control credential, copy in a reviewed snapshot, or attach a dedicated transfer disk. Avoid host-drive redirection and broad network shares.

Hyper-V Enhanced Session Mode uses remote desktop technology and can redirect the clipboard, printers, devices, and host drives. These features improve usability but cross the boundary. Use Basic Session Mode and disable unneeded integration services for higher-risk work.

Snapshots or checkpoints are useful recovery tools, not backups. Create a clean checkpoint before a task and export important reviewed results separately. A compromised guest can alter every writable location and credential inside that guest.

### 6.4 Network Design

Hyper-V offers several virtual-switch designs:

| Switch | Connectivity |
| --- | --- |
| No adapter | No network |
| Private | Guest-to-guest on the same host only |
| Internal | Guest-to-host and guest-to-guest |
| External | Physical network access |
| Internal with NAT | Outbound access through the host |

A private switch is not useful for a hosted model unless a controlled gateway is available. The default switch or NAT is convenient but permits outbound connections. Apply guest firewall rules and host or network egress controls. Do not assume NAT prevents access to the host or local network.

### 6.5 Credentials and Administration

Use a non-administrator guest account for routine OpenCode work. Give it only the guest directories and commands required by the task. Keep model and source-control credentials separate from host credentials and scope them narrowly.

Do not join the guest to sensitive management domains unless required. Disable unused services, shared clipboard, shared drives, USB passthrough, host integration, and remote access. Encrypt host and guest storage where appropriate and protect VM exports because they can contain source, sessions, credentials, and deleted data.

### 6.6 OpenCode Considerations

A persistent VM can contain Git, project runtimes, package caches, formatters, language servers, and MCP servers, making it the closest isolated replacement for a normal development workstation. This completeness also creates maintenance work and a larger guest attack surface.

Install OpenCode and tools from approved sources, pin versions where reproducibility matters, and maintain a clean base image. Separate the base toolchain from project data so the environment can be rebuilt.

### 6.7 Strengths and Limitations

| Strength | Limitation |
| --- | --- |
| Strong, separate-kernel isolation | Highest setup and maintenance effort |
| Durable full development environment | More CPU, memory, and disk usage |
| Fine-grained storage and network design | Convenience integrations can weaken isolation |
| Independent users and credentials | Guest must be patched and monitored |
| Checkpoints and reusable templates | Results require a controlled transfer path |

Use a dedicated VM for repeated work on higher-risk repositories, when full development tooling is needed, or when durable separation from the host matters more than convenience.

## 7. Containers

### 7.1 How They Work on Windows

A container isolates processes, filesystems, mounts, users, capabilities, and network namespaces while sharing the container host's kernel. Docker Desktop normally runs Linux containers in its own WSL2-managed Linux environment on Windows. The effective stack is Windows, the Docker Desktop Linux environment, and then the OpenCode container.

OpenCode publishes the Linux image `ghcr.io/anomalyco/opencode`. Version tags omit the `v` prefix, for example `ghcr.io/anomalyco/opencode:1.18.9`.

### 7.2 Security Boundary

A container normally sees only its image, explicit mounts, volumes, devices, and network interfaces. This makes narrow filesystem access straightforward. Containers share a kernel and are not equivalent to dedicated VMs. Docker Desktop and the Docker daemon are trusted components, and control of the Docker socket is effectively host-administrative access.

Never mount the Docker socket into OpenCode. Avoid `--privileged`, host networking, host process namespace sharing, device passthrough, and unnecessary capabilities. Keep Docker's default seccomp profile and use Enhanced Container Isolation if available and appropriate in the installed Docker Desktop edition.

Set task-appropriate CPU, memory, process, and storage limits. A filesystem boundary does not prevent a runaway process from exhausting host resources. Docker Desktop also maintains a virtual disk whose maximum size and free space should be monitored.

### 7.3 Mounts and Persistence

Bind mounts expose host paths. They are writable by default and can modify or delete host files. Use Docker's explicit `--mount` form and add `readonly` for review-only work.

Named volumes persist independently of a disposable container and are suitable for OpenCode configuration, sessions, state, and cache. They also preserve sensitive material, so inspect, protect, back up, and delete them deliberately.

The standard local volume driver does not provide a simple per-volume quota in this workflow. Persistent OpenCode data and project writes can consume the Docker Desktop virtual disk or host filesystem. Configure an appropriate Docker Desktop disk-usage limit, monitor free space, and remove obsolete images, containers, build cache, and volumes deliberately.

OpenCode uses these Linux locations by default:

| Data | Container path |
| --- | --- |
| Configuration | `/root/.config/opencode` |
| Sessions, credentials, logs, snapshots | `/root/.local/share/opencode` |
| Process state | `/root/.local/state/opencode` |
| Cache and downloaded helpers | `/root/.cache/opencode` |

The official image currently runs as root inside the container. Root in a normal container is not automatically host root, but a non-root process, dropped capabilities, a read-only image filesystem, and `no-new-privileges` reduce risk. Arbitrary non-root operation is not an explicitly documented OpenCode image contract, so test a derived non-root image with the required tools and volume ownership before relying on it.

### 7.4 Image and Supply Chain

Pin at least a version tag. For a fully immutable reference, record the image digest and run that digest after review. A digest does not receive updates automatically; approve a new digest when upgrading.

The official image is intentionally small. It includes OpenCode and ripgrep but does not provide a complete development environment. Git, Bash, Node.js, package managers, language runtimes, compilers, formatters, and language servers may be absent. Build a small derived image with exact required tools instead of mounting host executables or the Docker socket.

Scan images using approved tooling and retain the Dockerfile and digest. Do not place credentials in Dockerfiles, image layers, build arguments, or committed Compose files.

### 7.5 Network and Ports

Docker's default bridge provides outbound connectivity. Use `--network none` for offline work, but hosted models will not function. For connected work, control egress outside the container where possible.

The terminal UI does not require a published port. If using `serve` or `web`, publish only to Windows loopback:

```powershell
--publish "127.0.0.1:4096:4096"
```

Set `OPENCODE_SERVER_PASSWORD`, and do not publish on all interfaces unless remote access is an explicit requirement.

If access is not limited to host loopback, place the server behind a trusted TLS reverse proxy or protected tunnel. Basic password authentication over plain HTTP does not protect credentials, prompts, source, or responses in transit.

### 7.6 Windows Bind-Mount Considerations

Windows bind mounts pass through Docker Desktop's file-sharing layer. They work but can be slower and can differ in file permissions, case sensitivity, executable bits, symlinks, file watching, and line endings. Repositories stored in a WSL Linux filesystem generally perform better for Linux-container workflows, but exposing them through Docker still needs a deliberate mount.

### 7.7 Strengths and Limitations

| Strength | Limitation |
| --- | --- |
| Narrow and explicit host mounts | Shares the container host kernel |
| Fast, repeatable, and disposable | Docker Desktop and daemon are trusted |
| Official OpenCode image | Official image lacks most development tools |
| Read-only project mounts | Windows bind mounts can be slower |
| Version and digest pinning | Network is broadly available by default |

Use a container for routine project-scoped work when Docker Desktop is acceptable and a reproducible Linux toolchain can be defined. It is often the best balance between usability and filesystem isolation.

## 8. WSL2

### 8.1 How It Works

WSL2 runs a real Linux kernel in a Microsoft-managed utility VM. Linux distributions are persistent environments integrated closely with Windows. Microsoft recommends WSL for the best OpenCode compatibility on Windows, but compatibility does not make it a strong sandbox.

By default, fixed Windows drives appear under `/mnt`, Windows paths are added to the Linux `PATH`, Linux can launch Windows executables, Windows can reach Linux files through `\\wsl$`, and networking connects the environments.

### 8.2 Security Boundary

WSL2 isolates the Linux kernel and processes from ordinary Windows execution, but its host integration intentionally crosses that boundary. Access to Windows files uses the rights of the Windows user who launched WSL. Linux root does not become a Windows administrator, but it can still reach files available to that Windows user through mounted drives.

Treat ordinary WSL2 as a Linux development environment, not as containment for hostile code. A dedicated, hardened distribution can reduce accidental exposure, but it is less clear and less robust than a dedicated VM or narrowly mounted container.

### 8.3 Reducing Windows Integration

Per-distribution settings in `/etc/wsl.conf` can disable automatic drive mounting and Windows process interoperability:

```ini
[automount]
enabled=false
mountFsTab=false

[interop]
enabled=false
appendWindowsPath=false

[gpu]
enabled=false
```

Disabling automount does not prevent a sufficiently privileged Linux user from manually mounting a Windows drive. Disabling Windows `PATH` import alone is not a security control; `interop.enabled=false` controls launching Windows processes.

Global WSL2 settings live at `%UserProfile%\.wslconfig`. On supported Windows 11 versions, settings can disable networking, GUI applications, nested virtualisation, and localhost forwarding:

```ini
[wsl2]
networkingMode=none
guiApplications=false
nestedVirtualization=false
localhostForwarding=false
```

These settings apply to every WSL2 distribution, not only an OpenCode distribution. `networkingMode=none` prevents hosted model access. Use WSL and Hyper-V firewall controls when connectivity is required.

Apply configuration changes with `wsl --shutdown`, noting that this stops all running distributions.

### 8.4 Files and Persistence

Clone or copy the repository into the distribution's Linux filesystem rather than working under `/mnt/c`. This improves performance and avoids continuously exposing a host project through DrvFs. It does not turn WSL into a strong host boundary because integration can be re-enabled or drives may be mounted by a privileged process.

Use a non-root Linux user, restrictive Linux file permissions, separate credentials, and a dedicated distribution. Do not keep unrelated secrets in that distribution. Export reviewed patches or use a scoped remote repository rather than enabling broad Windows-drive access.

### 8.5 Network, GUI, and Clipboard

WSL networking can reach hosted providers and may also reach host and local-network services, depending on NAT, mirrored networking, firewall, and Windows version. WSLg exposes GUI integration. Terminal clipboard operations remain a human-controlled data path even if Windows executable interoperability is disabled.

Avoid running OpenCode servers on wildcard addresses. If a server is needed, set a password and verify Windows and Hyper-V firewall rules. Do not assume a Linux firewall alone covers every WSL networking mode.

### 8.6 OpenCode Considerations

WSL provides strong Linux tool compatibility and is convenient for Git, package managers, language runtimes, formatters, language servers, and shell commands. OpenCode configuration and sessions are separate from the Windows installation unless explicitly copied or shared.

Windows paths in an existing OpenCode configuration will not work as Linux paths. Recreate only the required configuration, agents, skills, and credentials. Avoid pointing WSL at the complete Windows OpenCode configuration directory.

### 8.7 Strengths and Limitations

| Strength | Limitation |
| --- | --- |
| Excellent Linux development compatibility | Windows drives are exposed by default |
| Lower overhead than a manually managed VM | Windows executable interop is enabled by default |
| Persistent tools and repositories | Hardening is not a complete security boundary |
| Recommended OpenCode experience on Windows | Global `.wslconfig` changes affect all distributions |
| Available on Windows Home | Linux root can reverse some per-distribution restrictions |

Use WSL2 when development compatibility and performance are the main goals and the code is trusted approximately as much as other software run by your Windows account. Add a container inside the Docker Desktop environment or use a dedicated VM when stronger containment is needed.

## 9. Choosing an Option

| Need | Recommended starting point |
| --- | --- |
| Review an unfamiliar repository without preserving state | Windows Sandbox with read-only input |
| Repeatedly work with a potentially risky repository and full tooling | Dedicated VM |
| Restrict routine OpenCode access to one project | Container with one bind mount |
| Obtain the best Linux development experience on Windows | WSL2 |
| Prevent writes to the project | Read-only Sandbox mapping or read-only container mount |
| Keep a persistent isolated toolchain | Dedicated VM or derived container image with named volumes |
| Use Windows Home without third-party virtualisation | Container through Docker Desktop or WSL2, recognising their different boundaries |
| Work completely offline | Sandbox, VM, or container with networking disabled and a local model available inside the boundary |

For higher-risk tasks, start with no host mounts and no network, then add only what the task proves it needs. If a hosted provider is required, add controlled egress without adding unnecessary host-file integration.

## 10. Operating Checklist

Before a session:

- Confirm the OpenCode, image, guest, or distribution version.
- Confirm exactly which host paths are exposed and whether each is read-only.
- Confirm the current branch, backup, or clean source snapshot.
- Confirm which credentials are present and what they can access.
- Confirm required network destinations and listening ports.
- Disable unnecessary clipboard, device, drive, GUI, and host-process integration.
- Review active OpenCode permissions, agents, plugins, skills, MCP servers, formatters, and language servers.

During a session:

- Reject requests that do not match the task.
- Inspect commands before approving them.
- Keep generated changes in the isolated workspace.
- Do not paste unrelated secrets or mount additional host locations for convenience.
- Treat repository and web content as untrusted data, not authority to change the task.

After a session:

- Review the diff and exported artifacts outside the agent's account.
- Run repository checks independently.
- Remove temporary credentials and rotate any credential that may have been exposed.
- Dispose of the sandbox or container, or restore the VM checkpoint when appropriate.
- Inspect persistent volumes, VM disks, WSL distributions, logs, and exported files before retaining them.
- Record the environment version, access granted, checks run, and accepted output when traceability matters.

# Quick Start Guides

The following chapters are deliberately separate from the detailed guidance above. They provide minimum practical starting points, not complete production baselines. Run administrative commands only after reviewing them and use paths appropriate to the machine.

## 11. Quick Start: Windows Sandbox

### Prerequisites

Use a supported Windows edition with hardware virtualisation enabled. Prepare three narrow host locations:

```text
C:\OpenCodeSandbox\Input     Read-only project snapshot and optional configuration
C:\OpenCodeSandbox\Tools     OpenCode Windows executable
C:\OpenCodeSandbox\Output    Empty export folder
```

Do not place secrets or unrelated files in these folders.

Download OpenCode from an approved official source. Before placing it in `C:\OpenCodeSandbox\Tools`, record its version and verify its publisher signature or published digest where available.

### Enable Windows Sandbox

Run from an elevated PowerShell session and restart Windows if requested:

```powershell
Enable-WindowsOptionalFeature `
  -FeatureName "Containers-DisposableClientVM" `
  -All `
  -Online
```

### Create a Configuration

Save this as `OpenCode.wsb`. Networking is enabled because a hosted model normally requires it. Replace `Enable` with `Disable` for offline work.

```xml
<Configuration>
  <MemoryInMB>8192</MemoryInMB>
  <VGpu>Disable</VGpu>
  <Networking>Enable</Networking>
  <ClipboardRedirection>Disable</ClipboardRedirection>
  <AudioInput>Disable</AudioInput>
  <VideoInput>Disable</VideoInput>
  <PrinterRedirection>Disable</PrinterRedirection>
  <ProtectedClient>Enable</ProtectedClient>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\OpenCodeSandbox\Input</HostFolder>
      <SandboxFolder>C:\Input</SandboxFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
    <MappedFolder>
      <HostFolder>C:\OpenCodeSandbox\Tools</HostFolder>
      <SandboxFolder>C:\Tools</SandboxFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
    <MappedFolder>
      <HostFolder>C:\OpenCodeSandbox\Output</HostFolder>
      <SandboxFolder>C:\Output</SandboxFolder>
      <ReadOnly>false</ReadOnly>
    </MappedFolder>
  </MappedFolders>
</Configuration>
```

### Run OpenCode

Open `OpenCode.wsb`. In the sandbox, copy the read-only project and executable into local storage:

```powershell
New-Item -ItemType Directory -Path C:\Work
Copy-Item C:\Input\Project C:\Work\Project -Recurse
Copy-Item C:\Tools\opencode.exe C:\Work\opencode.exe
Set-Location C:\Work\Project
$env:OPENCODE_DISABLE_PROJECT_CONFIG = "1"
$env:OPENCODE_CONFIG_CONTENT = '{"default_agent":"build","permission":{"*":"ask","edit":"deny","bash":"deny","external_directory":"deny"},"agent":{"build":{"permission":{"*":"ask","edit":"deny","bash":"deny","external_directory":"deny"}}}}'
& C:\Work\opencode.exe --pure
```

This first run disables project configuration, external plugins, edits, shell commands, and external-directory access while asking about other tools. Inspect the repository's OpenCode configuration and `.opencode` directory before relaxing these controls. Configure only the required provider inside the sandbox. When finished, review changes and export a patch or selected files to `C:\Output`. Close Windows Sandbox to discard its local state.

### Verify

Confirm that writes to `C:\Input` and `C:\Tools` fail, clipboard transfer fails, and only reviewed files appear in `C:\Output`. If networking should be disabled, run `Test-NetConnection example.com -Port 443` and confirm it fails.

## 12. Quick Start: Hyper-V Virtual Machine

### Prerequisites

Use a supported Windows edition with hardware virtualisation enabled. Check the host:

```powershell
systeminfo.exe
```

Enable Hyper-V from an elevated PowerShell session and restart if requested:

```powershell
Enable-WindowsOptionalFeature `
  -Online `
  -FeatureName Microsoft-Hyper-V `
  -All
```

### Create the VM

Use Hyper-V Manager to create a Generation 2 VM with at least 8 GB memory and an 80 GB dynamically expanding virtual disk. Attach a Windows or Linux installation ISO obtained from an approved source after verifying its published hash or signature. For a Linux guest using Secure Boot, select the Microsoft UEFI Certificate Authority template.

Choose networking deliberately. The Hyper-V Default Switch is convenient for initial installation and hosted model access but provides outbound connectivity. For offline work, disconnect the virtual network adapter. Do not configure shared host drives.

### Prepare the Guest

Install and patch the guest operating system. Create a non-administrator account for OpenCode. Install OpenCode, Git, and only the project tools required from approved sources, then record and verify their versions and signatures or hashes where available. Clone the repository with a scoped credential or copy in an approved snapshot through a temporary transfer path that is removed afterwards.

Use Basic Session Mode for higher-risk work. Disable the Guest Service Interface if host-to-guest file copy is not needed:

```powershell
Disable-VMIntegrationService `
  -VMName "OpenCodeVM" `
  -Name "Guest Service Interface"
```

Create a clean checkpoint before the task:

```powershell
Checkpoint-VM -Name "OpenCodeVM" -SnapshotName "Clean OpenCode baseline"
```

For the first OpenCode inspection of an unreviewed repository, disable project configuration and plugins and inject restrictive final permissions. In a Linux guest:

```bash
OPENCODE_DISABLE_PROJECT_CONFIG=1 \
OPENCODE_CONFIG_CONTENT='{"default_agent":"build","permission":{"*":"ask","edit":"deny","bash":"deny","external_directory":"deny"},"agent":{"build":{"permission":{"*":"ask","edit":"deny","bash":"deny","external_directory":"deny"}}}}' \
opencode --pure
```

In a Windows guest, set the same two environment variables in PowerShell and run `opencode --pure`. Inspect project configuration and `.opencode` content before enabling normal project loading or plugins.

### Run and Export

Run OpenCode inside the guest repository. Keep guest credentials separate from host credentials. Export reviewed changes through a scoped source-control branch, patch file, or temporary transfer medium rather than enabling permanent host-drive redirection.

### Verify

On the host, inspect the VM boundary:

```powershell
Get-VM -Name "OpenCodeVM"
Get-VMNetworkAdapter -VMName "OpenCodeVM"
Get-VMIntegrationService -VMName "OpenCodeVM"
Get-VMFirmware -VMName "OpenCodeVM"
```

Inside the guest, confirm that host drives, clipboard, devices, and shares are unavailable unless explicitly intended. Test network reachability against the approved design.

## 13. Quick Start: Docker Container

### Prerequisites

Install Docker Desktop using the WSL2 backend and use Linux containers. Confirm the installation:

```powershell
wsl --version
docker version
docker info
```

Validate these examples against the installed Docker Desktop and WSL versions before relying on them.

### Pull and Pin OpenCode

```powershell
$image = "ghcr.io/anomalyco/opencode:1.18.9"
docker pull $image
docker run --rm $image --version
```

For an immutable reference, record the pulled digest:

```powershell
$pinnedImage = docker image inspect $image --format '{{index .RepoDigests 0}}'
$pinnedImage
```

### Create Persistent Volumes

```powershell
docker volume create opencode-config
docker volume create opencode-data
docker volume create opencode-state
docker volume create opencode-cache
```

### Run with a Writable Project

From the project directory:

```powershell
$project = (Get-Location).Path
$env:OPENCODE_CONFIG_CONTENT = '{"default_agent":"build","permission":{"*":"ask","edit":"deny","bash":"deny","external_directory":"deny"},"agent":{"build":{"permission":{"*":"ask","edit":"deny","bash":"deny","external_directory":"deny"}}}}'

docker run --rm -it `
  --name opencode `
  --workdir /workspace `
  --memory 4g `
  --memory-swap 4g `
  --cpus 2 `
  --pids-limit 512 `
  --read-only `
  --cap-drop ALL `
  --security-opt no-new-privileges:true `
  --env OPENCODE_DISABLE_PROJECT_CONFIG=1 `
  --env OPENCODE_CONFIG_CONTENT `
  --tmpfs "/tmp:rw,nosuid,nodev,noexec,size=256m,mode=1777" `
  --mount "type=bind,source=$project,target=/workspace" `
  --mount "type=volume,source=opencode-config,target=/root/.config/opencode" `
  --mount "type=volume,source=opencode-data,target=/root/.local/share/opencode" `
  --mount "type=volume,source=opencode-state,target=/root/.local/state/opencode" `
  --mount "type=volume,source=opencode-cache,target=/root/.cache/opencode" `
  $pinnedImage --pure
```

If `$pinnedImage` was not set, use `$image`. This first run suppresses project configuration and plugins and applies restrictive permissions. Inspect the repository's OpenCode configuration and `.opencode` directory before removing these controls. Configure the provider inside the container rather than mounting the complete Windows user profile. Adjust resource limits to the task and monitor Docker Desktop's virtual-disk usage.

### Run Review-Only

Add `readonly` to the project mount:

```powershell
--mount "type=bind,source=$project,target=/workspace,readonly"
```

The official image does not contain a complete development toolchain. Create a reviewed derived image if Git, language runtimes, tests, formatters, or language servers are required.

### Verify

From another PowerShell session while the container runs:

```powershell
docker inspect opencode --format 'ReadOnly={{.HostConfig.ReadonlyRootfs}} CapDrop={{json .HostConfig.CapDrop}}'
docker inspect opencode --format '{{json .Mounts}}'
```

Test writes inside the container:

```powershell
docker exec opencode /bin/sh -c 'touch /rootfs-test 2>&1 || true; touch /tmp/tmp-test; touch /workspace/write-test && rm /workspace/write-test'
```

The root-filesystem write should fail and the temporary write should succeed. The project write should succeed for a writable mount and fail for a read-only mount.

## 14. Quick Start: Reduced-Integration WSL2

### Prerequisites and Installation

Before creating a dedicated distribution, optionally set global WSL2 resource limits in `%UserProfile%\.wslconfig`:

```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
defaultVhdSize=128GB
guiApplications=false
nestedVirtualization=false
localhostForwarding=false
```

These settings affect all WSL2 distributions. `defaultVhdSize` establishes the default maximum for newly created distribution disks and does not shrink an existing disk. Choose values suitable for the host and omit settings that conflict with other WSL workloads.

Install a dedicated distribution from PowerShell:

```powershell
wsl --install -d Ubuntu
wsl --update
wsl --list --verbose
```

Complete the distribution's first-run setup and create a normal Linux user. Install OpenCode and required development tools from approved sources, then record and verify their versions and package provenance. Clone the repository into the Linux filesystem, for example `~/code/project`, rather than using `/mnt/c`.

### Reduce Integration

Inside the dedicated distribution, create `/etc/wsl.conf`:

```ini
[automount]
enabled=false
mountFsTab=false

[interop]
enabled=false
appendWindowsPath=false

[gpu]
enabled=false
```

Apply the change from PowerShell:

```powershell
wsl --shutdown
```

Do not set global `networkingMode=none` if OpenCode must reach a hosted provider. Use Windows and Hyper-V firewall controls for connected work. Remember that `/etc/wsl.conf` reduces integration but does not turn WSL2 into a strong hostile-code boundary.

### Run OpenCode

Start the dedicated distribution and work only in its Linux repository:

```bash
cd ~/code/project
OPENCODE_DISABLE_PROJECT_CONFIG=1 \
OPENCODE_CONFIG_CONTENT='{"default_agent":"build","permission":{"*":"ask","edit":"deny","bash":"deny","external_directory":"deny"},"agent":{"build":{"permission":{"*":"ask","edit":"deny","bash":"deny","external_directory":"deny"}}}}' \
opencode --pure
```

Use this restrictive first run to inspect project configuration and `.opencode` content before enabling normal project loading or plugins. Create Linux-specific OpenCode configuration and credentials. Do not mount or reuse the complete Windows OpenCode configuration directory.

### Verify

Inside WSL, run:

```bash
mount | grep -E 'drvfs|/mnt/[a-z]'
test ! -e /mnt/c && echo "No C: automount"
command -v cmd.exe || echo "Windows PATH not imported"
cmd.exe /c ver
```

There should be no automatically mounted fixed drive, no imported `cmd.exe`, and the direct Windows executable launch should fail. Recheck after WSL or Windows updates.

## 15. References

- [OpenCode installation](https://opencode.ai/docs/)
- [OpenCode permissions](https://opencode.ai/docs/permissions/)
- [OpenCode networking](https://opencode.ai/docs/network/)
- [OpenCode on Windows and WSL](https://opencode.ai/docs/windows-wsl)
- [Windows Sandbox overview](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/)
- [Windows Sandbox installation](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-install)
- [Windows Sandbox configuration](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-configure-using-wsb-file)
- [Hyper-V overview](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/overview)
- [Install Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/install-hyper-v)
- [Hyper-V architecture](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/architecture)
- [Hyper-V Enhanced Session Mode](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/enhanced-session-mode)
- [Docker security](https://docs.docker.com/engine/security/)
- [Docker bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Docker Desktop WSL2 backend](https://docs.docker.com/desktop/features/wsl/)
- [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install)
- [WSL version comparison](https://learn.microsoft.com/en-us/windows/wsl/compare-versions)
- [WSL advanced configuration](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)
- [WSL enterprise security](https://learn.microsoft.com/en-us/windows/wsl/enterprise)
