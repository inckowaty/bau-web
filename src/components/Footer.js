export default function Footer() {
    return (
      <footer className="mt-16 border-t border-neutral-400 bg-neutral-100 py-8 text-center text-sm">
        <p>Bau GmbH © {new Date().getFullYear()} • USt-IdNr DE-123456789</p>
        <p className="mt-1 space-x-4">
          <a href="/impressum" className="underline hover:text-accent-500">Impressum</a>
          <a href="/datenschutz" className="underline hover:text-accent-500">Datenschutz</a>
        </p>
      </footer>
    )
  }
  