import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

export interface NginxDeployResult {
  success: boolean;
  vhostPath: string;
  serverNames: string[];
  error?: string;
}

export class NginxDeployer {
  private sudoPassword: string;
  private sitesAvailableDir: string;
  private sitesEnabledDir: string;
  private deployRoot: string;
  private apiBackendPort: number;

  constructor() {
    this.sudoPassword = process.env.NAS_SUDO_PASSWORD || 'ASLAB@kolablogin123';
    this.sitesAvailableDir = '/etc/nginx/sites-available';
    this.sitesEnabledDir = '/etc/nginx/sites-enabled';
    this.deployRoot = process.env.KROOMIFY_DEPLOY_ROOT || '/volume1/web/www/KroomBox/kroomify';
    this.apiBackendPort = Number(process.env.PORT || 5055);
  }

  private escapeShellArg(val: string): string {
    return `'${String(val || '').replace(/'/g, `'"'"'`)}'`;
  }

  private async execSudoCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    const escapedPassword = this.sudoPassword.replace(/'/g, `'"'"'`);
    const fullCmd = `echo '${escapedPassword}' | sudo -S ${command}`;
    return await execAsync(fullCmd);
  }

  /**
   * Bangun string konfigurasi virtual host Nginx untuk storefront
   */
  generateVhostConfig(slug: string, serverNames: string[]): string {
    const webroot = `${this.deployRoot}/sites/${slug}`;
    const serverNameString = serverNames.join(' ');

    return `# =========================================================================
# KROOMIFY AUTO-GENERATED VHOST FOR STORE: ${slug}
# Generated: ${new Date().toISOString()}
# =========================================================================

server {
    listen 8080;
    server_name ${serverNameString};

    # Keamanan & Header Standar
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root ${webroot};
    index index.html;

    # Dynamic fallback untuk SPA / Storefront Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API Dinamis Kroomify (Midtrans Snap, Biteship Ongkir, Notifikasi, Email)
    location /api/ {
        proxy_pass http://127.0.0.1:${this.apiBackendPort}/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    # Reverse proxy untuk Umami Analytics (menghindari CORS/Mixed content)
    location ^~ /umami-analytics/ {
        proxy_pass http://100.90.80.95:3005/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache Aset Statis Hashed (1 tahun)
    location ~* \\.(js|css|woff2?|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable" always;
    }

    # Media Gambar & Ikon
    location ~* \\.(png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000" always;
    }

    # File HTML selalu segar (tidak dicache)
    location ~* \\.html?$ {
        try_files $uri /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        expires -1;
    }

    access_log /var/log/nginx/kroomify-${slug}-access.log;
    error_log  /var/log/nginx/kroomify-${slug}-error.log;
}
`;
  }

  /**
   * Tulis vhost, symlink, validasi sintaks, dan reload Nginx
   */
  async deployVhost(slug: string, serverNames: string[]): Promise<NginxDeployResult> {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const vhostFilename = `kroomify-${cleanSlug}.conf`;
    const availablePath = path.join(this.sitesAvailableDir, vhostFilename);
    const enabledPath = path.join(this.sitesEnabledDir, vhostFilename);

    const configContent = this.generateVhostConfig(cleanSlug, serverNames);

    try {
      // 1. Tulis berkas sementara di /tmp
      const tempPath = `/tmp/${vhostFilename}.${Date.now()}`;
      fs.writeFileSync(tempPath, configContent, 'utf8');

      // 2. Salin ke /etc/nginx/sites-available via sudo
      await this.execSudoCommand(`cp ${this.escapeShellArg(tempPath)} ${this.escapeShellArg(availablePath)}`);
      await this.execSudoCommand(`rm -f ${this.escapeShellArg(tempPath)}`);
      await this.execSudoCommand(`chmod 644 ${this.escapeShellArg(availablePath)}`);

      // 3. Buat symlink di sites-enabled
      await this.execSudoCommand(`ln -sf ${this.escapeShellArg(availablePath)} ${this.escapeShellArg(enabledPath)}`);

      // 4. PRE-FLIGHT VALIDASI: Uji sintaks Nginx (WAJIB)
      try {
        await execAsync('sudo /usr/sbin/nginx -t');
      } catch (syntaxErr: any) {
        // Rollback seketika agar Nginx global tidak rusak
        await this.execSudoCommand(`rm -f ${this.escapeShellArg(enabledPath)}`);
        throw new Error(`Nginx syntax check failed: ${syntaxErr?.stderr || syntaxErr?.message}`);
      }

      // 5. Muat ulang Nginx secara aman (NOPASSWD di sudoers)
      await execAsync('sudo /usr/sbin/nginx -s reload');

      return {
        success: true,
        vhostPath: availablePath,
        serverNames,
      };
    } catch (err: any) {
      console.error('[NginxDeployer] Error deploying vhost:', err);
      return {
        success: false,
        vhostPath: availablePath,
        serverNames,
        error: err.message || 'Gagal mengonfigurasi dan memuat ulang Nginx',
      };
    }
  }

  /**
   * Hapus vhost Nginx dan reload
   */
  async removeVhost(slug: string): Promise<boolean> {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const vhostFilename = `kroomify-${cleanSlug}.conf`;
    const availablePath = path.join(this.sitesAvailableDir, vhostFilename);
    const enabledPath = path.join(this.sitesEnabledDir, vhostFilename);

    try {
      await this.execSudoCommand(`rm -f ${this.escapeShellArg(enabledPath)}`);
      await this.execSudoCommand(`rm -f ${this.escapeShellArg(availablePath)}`);

      // Uji sintaks sebelum reload
      await execAsync('sudo /usr/sbin/nginx -t');
      await execAsync('sudo /usr/sbin/nginx -s reload');

      return true;
    } catch (err) {
      console.warn('[NginxDeployer] Remove vhost error:', err);
      return false;
    }
  }
}

export const nginxDeployer = new NginxDeployer();
