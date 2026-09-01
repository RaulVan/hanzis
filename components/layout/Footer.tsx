import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer no-print">
      <div className="site-container flex flex-wrap items-center justify-between gap-4">
        <p>认真写字，慢慢成长。</p>
        <nav aria-label="网站信息" className="flex flex-wrap gap-6">
          <Link href="/about/">关于与帮助</Link>
          <Link href="/privacy/">隐私说明</Link>
        </nav>
      </div>
    </footer>
  );
}
