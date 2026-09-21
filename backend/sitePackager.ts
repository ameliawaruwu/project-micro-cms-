import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

export interface PackageResult {
  success: boolean;
  siteDir: string;
  indexPath: string;
  error?: string;
}

export class SitePackager {
  private deployRoot: string;
  private engineDistDir: string;

  constructor() {
    this.deployRoot = process.env.KROOMIFY_DEPLOY_ROOT || '/volume1/web/www/KroomBox/kroomify';
    this.engineDistDir = path.join(this.deployRoot, 'engine', 'dist');
  }

  /**
   * Menyiapkan webroot fisik toko individual di /volume1/web/www/KroomBox/kroomify/sites/<slug>
   */
  async packageStoreSite(slug: string, store: any, products: any[] = []): Promise<PackageResult> {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const siteDir = path.join(this.deployRoot, 'sites', cleanSlug);
    const indexPath = path.join(siteDir, 'index.html');

    try {
      // 1. Pastikan folder engine dist ada (jika belum, salin dari dist CMS utama)
      if (!fs.existsSync(path.join(this.engineDistDir, 'index.html'))) {
        fs.mkdirSync(this.engineDistDir, { recursive: true });
        const sourceDist = path.resolve(process.cwd(), 'dist');
        if (fs.existsSync(sourceDist)) {
          await execAsync(`cp -r "${sourceDist}"/* "${this.engineDistDir}"/`);
        }
      }

      // 2. Buat folder situs target
      fs.mkdirSync(siteDir, { recursive: true });

      // 3. Tulis file JSON data toko & produk
      fs.writeFileSync(path.join(siteDir, 'store.json'), JSON.stringify(store, null, 2), 'utf8');
      fs.writeFileSync(path.join(siteDir, 'products.json'), JSON.stringify(products, null, 2), 'utf8');

      // 4. Buat symlink assets ke engine bersama (menghemat storage NAS)
      const siteAssetsSymlink = path.join(siteDir, 'assets');
      if (!fs.existsSync(siteAssetsSymlink)) {
        try {
          fs.symlinkSync('../../engine/dist/assets', siteAssetsSymlink);
        } catch {
          // Jika symlink relatif gagal, coba salin atau symlink absolut
          try {
            fs.symlinkSync(path.join(this.engineDistDir, 'assets'), siteAssetsSymlink);
          } catch {}
        }
      }

      // 5. Salin logo ikon statis jika ada di engine dist
      const logoIcon = path.join(this.engineDistDir, 'Logo-Icon.png');
      if (fs.existsSync(logoIcon) && !fs.existsSync(path.join(siteDir, 'Logo-Icon.png'))) {
        try {
          fs.linkSync(logoIcon, path.join(siteDir, 'Logo-Icon.png'));
        } catch {
          fs.copyFileSync(logoIcon, path.join(siteDir, 'Logo-Icon.png'));
        }
      }

      // 6. Baca template index.html dari engine
      const baseIndexContent = fs.readFileSync(path.join(this.engineDistDir, 'index.html'), 'utf8');

      // 7. Injeksi metadata SEO & initial store data untuk auto-hydration tanpa loading flicker
      const storeName = String(store?.name || 'Toko Online').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const storeDesc = String(store?.description || store?.tagline || 'Pusat belanja online resmi')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Sanitasi data toko & produk agar aman dari XSS injection di script tag
      const safeStoreJson = JSON.stringify(store).replace(/</g, '\\u003c');
      const safeProductsJson = JSON.stringify(products).replace(/</g, '\\u003c');

      const injectedScript = `
    <!-- Kroomify Preloaded Store Data & Hydration Guard -->
    <script>
      window.__KROOMIFY_STORE_SLUG__ = "${cleanSlug}";
      window.__KROOMIFY_INITIAL_STORE__ = ${safeStoreJson};
      window.__KROOMIFY_INITIAL_PRODUCTS__ = ${safeProductsJson};
    </script>
`;

      let customizedHtml = baseIndexContent;

      // Update Title
      customizedHtml = customizedHtml.replace(
        /<title>.*?<\/title>/i,
        `<title>${storeName} — Toko Online Resmi</title>`
      );

      // Update Meta Description
      if (customizedHtml.includes('name="description"')) {
        customizedHtml = customizedHtml.replace(
          /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
          `<meta name="description" content="${storeDesc}" />`
        );
      } else {
        customizedHtml = customizedHtml.replace(
          /<\/head>/i,
          `  <meta name="description" content="${storeDesc}" />\n</head>`
        );
      }

      // Inject Script sebelum </head>
      customizedHtml = customizedHtml.replace(/<\/head>/i, `${injectedScript}\n</head>`);

      // Tulis index.html toko
      fs.writeFileSync(indexPath, customizedHtml, 'utf8');

      // 8. Terapkan izin akses 755/644 agar Nginx (user http) bisa membaca direktori
      await execAsync(`chmod -R a+rX "${siteDir}"`);

      return {
        success: true,
        siteDir,
        indexPath,
      };
    } catch (err: any) {
      console.error('[SitePackager] Error packaging site:', err);
      return {
        success: false,
        siteDir,
        indexPath,
        error: err.message || 'Gagal menyiapkan berkas webroot situs',
      };
    }
  }

  /**
   * Hapus direktori situs saat di-unpublish
   */
  async deleteStoreSite(slug: string): Promise<boolean> {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const siteDir = path.join(this.deployRoot, 'sites', cleanSlug);
    try {
      if (fs.existsSync(siteDir)) {
        fs.rmSync(siteDir, { recursive: true, force: true });
      }
      return true;
    } catch (err) {
      console.warn('[SitePackager] Delete store site warning:', err);
      return false;
    }
  }
}

export const sitePackager = new SitePackager();
