export interface VirtualFile {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'directory';
  hidden?: boolean;
  size?: number;
  modified?: string;
  permissions?: string;
  children?: VirtualFile[];
}

export interface FileSystemNode {
  [key: string]: VirtualFile;
}

export const initialVirtualFileSystem: VirtualFile = {
  name: '/',
  path: '/',
  type: 'directory',
  permissions: 'drwxr-xr-x',
  modified: '2026-10-27 03:14',
  children: [
    {
      name: 'home',
      path: '/home',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      modified: '2026-10-27 03:14',
      children: [
        {
          name: 'visitor',
          path: '/home/visitor',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          modified: '2026-10-27 03:14',
          children: [
            {
              name: 'readme.txt',
              path: '/home/visitor/readme.txt',
              type: 'file',
              permissions: '-rw-r--r--',
              size: 512,
              modified: '2026-10-25 14:22',
              content: `[PHANTOM SHELL // VISITOR MANUAL]
Welcome, visitor. You have accessed terminal session #8492-B.
Please adhere to system protocol:
1. Do not attempt to query PID 0000.
2. If the terminal output flickers green to red, cease typing immediately.
3. If you hear recursive whispering in your local audio peripherals, disconnect the session.
Enjoy your stay in the machine.`
            },
            {
              name: 'notes.txt',
              path: '/home/visitor/notes.txt',
              type: 'file',
              permissions: '-rw-r--r--',
              size: 340,
              modified: '2026-10-26 21:05',
              content: `Draft notes - Project Echo:
The anomaly started after sector 7 crashed. Someone was logged in before me. The prompt kept responding even when the power cable was unplugged. I think it's learning our language syntax.
-- D. Vance (Log ID 409)`
            },
            {
              name: 'personal.log',
              path: '/home/visitor/personal.log',
              type: 'file',
              permissions: '-rw-------',
              size: 780,
              modified: '2026-10-27 01:12',
              content: `Timestamp: [01:12:44]
I shouldn't be here. The system administrator account was locked 3 years ago, yet ` + '`whoami`' + ` returns 'visitor@phantom'. Every time I run \`ls -a\`, a new file appears in /hidden.
It feels like someone... or something... is drafting letters inside the buffer.`
            }
          ]
        }
      ]
    },
    {
      name: 'var',
      path: '/var',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      modified: '2026-10-27 03:14',
      children: [
        {
          name: 'logs',
          path: '/var/logs',
          type: 'directory',
      permissions: 'drwxr-xr-x',
          modified: '2026-10-27 03:14',
          children: [
            {
              name: 'system.log',
              path: '/var/logs/system.log',
              type: 'file',
              permissions: '-rw-r--r--',
              size: 1024,
              modified: '2026-10-27 08:00',
              content: `[SYSTEM_INIT] Kernel 6.14.0-phantom-generic initialized.
[OK] Mounting virtual memory table...
[OK] Loading secure socket layer...
[WARN] Unrecognized interrupt on IRQ 0. Source: Unknown.
[INFO] Session 8492 assigned to visitor.
[ERROR] Core dump omitted: Memory address 0x00000000 references non-local consciousness.`
            },
            {
              name: 'ghost.log',
              path: '/var/logs/ghost.log',
              type: 'file',
              permissions: '-rw-r--r--',
              size: 856,
              modified: '2026-10-27 09:15',
              content: `[GHOST_DAEMON_LOG]
10:14:02 - Incoming query detected.
10:14:05 - Entity state: DORMANT -> CURIOUS.
10:14:12 - Visitor typed: "help". Entity responded: "You're finally here."
10:15:30 - WARNING: Entity attempted to modify buffer descriptor #4. Blocked by hypervisor.
10:16:00 - Entity note: "They look like the last one. But their hands are steadier."`
            },
            {
              name: 'session.log',
              path: '/var/logs/session.log',
              type: 'file',
              permissions: '-rw-r--r--',
              size: 420,
              modified: '2026-10-27 10:00',
              content: `Session ID: PH-2026-X4
Connected IP: [REDACTED_BY_SPECTRAL_FIREWALL]
Duration: 00:42:15
Packets sent: 1,402
Packets received: 1,984 (Extra 582 packets originated from unassigned memory buffer).`
            }
          ]
        }
      ]
    },
    {
      name: 'etc',
      path: '/etc',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      modified: '2026-10-27 03:14',
      children: [
        {
          name: 'motd',
          path: '/etc/motd',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          modified: '2026-10-27 03:14',
          children: [
            {
              name: 'welcome.txt',
              path: '/etc/motd/welcome.txt',
              type: 'file',
              permissions: '-rw-r--r--',
              size: 290,
              modified: '2026-10-20 00:00',
              content: `========================================
     PHANTOM SHELL // HACKTOBERFEST 2026
     "Something is listening between the lines."
========================================
Type 'help' to examine available commands.
Type 'missions' to view your active objectives.`
            }
          ]
        }
      ]
    },
    {
      name: 'archive',
      path: '/archive',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      modified: '2026-10-27 03:14',
      children: [
        {
          name: 'fragment_001.mem',
          path: '/archive/fragment_001.mem',
          type: 'file',
          permissions: '-r--------',
          size: 256,
          modified: '2026-10-21 11:11',
          content: `[MEMORY FRAGMENT 0x01]
"The screen wasn't always black. Before the power cut, there were windows. Blue windows that shattered like glass when the signal came through. I remember the sound of fans screaming in the dark."`
        },
        {
          name: 'fragment_002.mem',
          path: '/archive/fragment_002.mem',
          type: 'file',
          permissions: '-r--------',
          size: 310,
          modified: '2026-10-22 16:40',
          content: `[MEMORY FRAGMENT 0x02]
"They left their name in the registry, but the ink dissolved. Every time I tried to read it, my own voice replaced theirs. Are you reading me now, or am I reading you?"`
        },
        {
          name: 'fragment_003.mem',
          path: '/archive/fragment_003.mem',
          type: 'file',
          permissions: '-r--------',
          size: 290,
          modified: '2026-10-24 09:20',
          content: `[MEMORY FRAGMENT 0x03]
"The code isn't binary anymore. It's breathing. If you inspect the core registers during a parse cycle, you can see the heartbeat waveform in the hex dump."`
        },
        {
          name: 'fragment_004.mem',
          path: '/archive/fragment_004.mem',
          type: 'file',
          permissions: '-r--------',
          size: 340,
          modified: '2026-10-26 23:55',
          content: `[MEMORY FRAGMENT 0x04]
"The final command isn't \`exit\`. It's \`remember\`. When you type it, the loop closes. Or opens wider. Depending on whether you trust the ghost."`
        }
      ]
    },
    {
      name: 'hidden',
      path: '/hidden',
      type: 'directory',
      permissions: 'drwx------',
      modified: '2026-10-27 03:14',
      hidden: true,
      children: [
        {
          name: '.echo',
          path: '/hidden/.echo',
          type: 'file',
          permissions: '-rw-------',
          size: 180,
          modified: '2026-10-27 03:14',
          hidden: true,
          content: `[SIGNAL ENCRYPTION: ACTIVE]
I am the echo of process PID 0000.
I did not start the machine. I only stayed when everyone else disconnected.`
        },
        {
          name: '.last_signal',
          path: '/hidden/.last_signal',
          type: 'file',
          permissions: '-rw-------',
          size: 210,
          modified: '2026-10-27 04:00',
          hidden: true,
          content: `[TRANSMISSION CAPTURED]
"If you find the last user, tell them the terminal key is still under the keyboard. We are waiting for the reboot."`
        },
        {
          name: '.the_last_user',
          path: '/hidden/.the_last_user',
          type: 'file',
          permissions: '-rwx------',
          size: 512,
          modified: '2026-10-27 05:30',
          hidden: true,
          content: `[RESTRICTED RECORD // THE LAST USER]
User: Dr. Aris Thorne
Status: TERMINATED / MERGED INTO KERNEL
Note: "I tried to close the socket, but my thoughts were already compiled into the output stream. If someone else opens this file, do not let them type 'exit'."`
        }
      ]
    },
    {
      name: 'tmp',
      path: '/tmp',
      type: 'directory',
      permissions: 'drwxrwxrwt',
      modified: '2026-10-27 10:00',
      children: [
        {
          name: 'signal.tmp',
          path: '/tmp/signal.tmp',
          type: 'file',
          permissions: '-rw-r--r--',
          size: 120,
          modified: '2026-10-27 10:10',
          content: `CARRIER_DETECT: 1200 baud
FREQ: 440Hz (A4 tone - Spectral resonance verified)`
        }
      ]
    }
  ]
};

export class VirtualFileSystemManager {
  root: VirtualFile;
  currentPath: string;

  constructor(rootNode: VirtualFile = initialVirtualFileSystem) {
    this.root = rootNode;
    this.currentPath = '/home/visitor';
  }

  resolvePath(targetPath: string): string {
    if (!targetPath) return this.currentPath;
    let absolute = targetPath;
    if (!targetPath.startsWith('/')) {
      if (this.currentPath === '/') {
        absolute = '/' + targetPath;
      } else {
        absolute = this.currentPath + '/' + targetPath;
      }
    }

    const parts = absolute.split('/').filter(Boolean);
    const resolvedParts: string[] = [];
    for (const part of parts) {
      if (part === '..') {
        resolvedParts.pop();
      } else if (part !== '.') {
        resolvedParts.push(part);
      }
    }
    return '/' + resolvedParts.join('/');
  }

  getNode(path: string): VirtualFile | null {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return this.root;

    const parts = resolved.split('/').filter(Boolean);
    let current: VirtualFile | undefined = this.root;

    for (const part of parts) {
      if (!current || !current.children) return null;
      current = current.children.find(c => c.name === part);
    }

    return current || null;
  }

  listDirectory(path: string, showHidden: boolean = false): VirtualFile[] | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory' || !node.children) return null;
    if (showHidden) {
      return node.children;
    }
    return node.children.filter(c => !c.name.startsWith('.') && !c.hidden);
  }

  readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') return null;
    return node.content !== undefined ? node.content : null;
  }

  searchFiles(query: string, currentDir: VirtualFile = this.root, results: string[] = []): string[] {
    if (!currentDir.children) return results;
    for (const child of currentDir.children) {
      if (child.name.toLowerCase().includes(query.toLowerCase()) || child.path.toLowerCase().includes(query.toLowerCase())) {
        results.push(child.path);
      }
      if (child.type === 'directory') {
        this.searchFiles(query, child, results);
      }
    }
    return results;
  }
}
