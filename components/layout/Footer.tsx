import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid" aria-label="Informazioni utili">
          <div className="footer-column">
            <h3 className="footer-title">Castello Mongivetto</h3>
            <p className="footer-copy">Dimora storica nel biellese dedicata a visite guidate, eventi privati e valorizzazione culturale del territorio.</p>
          </div>
          <div className="footer-column">
            <h3 className="footer-title">Contatti</h3>
            <ul className="footer-links">
              <li>Cerrione (BI), Piemonte</li>
              <li><a href="mailto:info@castellomongivetto.com">info@castellomongivetto.com</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3 className="footer-title">Navigazione</h3>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/storia">Storia</Link></li>
              <li><Link href="/galleria">Galleria</Link></li>
              <li><Link href="/contatti">Contatti</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3 className="footer-title">Canali</h3>
            <div className="social-list">
              <a href="https://www.facebook.com/people/Castello-Mongivetto/61588579214886/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f" aria-hidden="true"></i></a>
              <a href="https://www.instagram.com/castellodelmongivetto/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram" aria-hidden="true"></i></a>
              <Link href="/contatti" aria-label="Email"><i className="fas fa-envelope" aria-hidden="true"></i></Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Castello Mongivetto. Tutti i diritti riservati.</span>
          <a className="footer-backtotop" href="#top" aria-label="Torna in cima alla pagina">
            <i className="fas fa-arrow-up" aria-hidden="true"></i>
            <span>Torna su</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
