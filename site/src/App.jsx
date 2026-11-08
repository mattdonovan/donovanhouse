import { useEffect, useState } from "react";
import { projects, contact } from "./data/projects.js";
import { Shelf } from "./components/Shelf.jsx";
import { Reader } from "./components/Reader.jsx";
import { go, useHashRoute } from "./hooks.js";
import { asset } from "./asset.js";

const mailto = `mailto:${contact.email}?subject=${encodeURIComponent("Hello from your portfolio")}`;

// Hide the header while scrolling down; bring it back on scroll up or when the
// pointer moves to the top edge of the window.
function useNavHidden() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) setHidden(false);
      else if (y > lastY + 4) setHidden(true);
      else if (y < lastY - 4) setHidden(false);
      lastY = y;
    };
    const onMove = (e) => {
      if (e.clientY < 72) setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);
  return hidden;
}

function Nav({ route }) {
  const hidden = useNavHidden();
  return (
    <header className={`nav${hidden ? " is-hidden" : ""}`}>
      <a href="#/" className="nav-mark" aria-label="Kristin Donovan — home">
        <span className="nav-kd">Kristin Donovan</span>
      </a>
      <nav className="nav-links">
        <a href="#/about" aria-current={route === "/about" ? "page" : undefined}>
          About me
        </a>
        <a href="#/work" aria-current={route.startsWith("/work") ? "page" : undefined}>
          Work
        </a>
        <a href={mailto} className="btn btn-orange btn-sm">
          Connect
        </a>
      </nav>
    </header>
  );
}

function Landing() {
  return (
    <main className="landing">
      <h1 className="wordmark-type wm-portfolio">
        portfolio <span className="wm-script">Kristin Donovan</span>
      </h1>
      <div className="landing-actions">
        <a className="btn btn-navy" href="#/about">
          About me
        </a>
        <a className="btn btn-navy" href="#/work">
          Work
        </a>
        <a className="btn btn-orange" href={mailto}>
          Connect
        </a>
      </div>
    </main>
  );
}

function About() {
  return (
    <main className="about">
      <section className="about-hello">
        <div>
          <h1 className="display">
            Hello,
            <span>I'm Kristin Donovan</span>
          </h1>
          <p className="lede">
            Residential designer with hands-on experience managing remodeling and builder-driven projects from presale
            through pre-construction. Proven ability to develop clear scopes of work, create finish selections aligned
            with client budgets, and maintain project profitability in fast-paced environments. Skilled in managing
            multiple concurrent projects, collaborating with builders and trades, and supporting seamless handoff to
            construction teams. Proficient in Buildertrend, Chief Architect, and client-focused design communication.
          </p>
        </div>
        <img className="portrait" src={asset("/about/kristin.jpg")} alt="Portrait of Kristin Donovan" />
      </section>

      <section className="about-why">
        <p className="script">Why residential?</p>
        <p className="placeholder-note">
          Placeholder — a short paragraph on why Kristin loves residential interior design.
        </p>
      </section>

      <section className="about-edu">
        <div>
          <h2 className="display">Education</h2>
          <p>
            My education began at the University of North Texas in Home Furnishings Merchandising and continues through
            an Associate's Degree in Interior Design at Johnson County Community College, where I am deepening my
            technical and design knowledge. In addition, I serve as an active board member for the Interior Design
            Student Association (IDSA) and a student member of the National Kitchen &amp; Bath Association (NKBA).
          </p>
          <dl className="creds">
            <div>
              <dt>Johnson County Community College</dt>
              <dd>Associate's Degree, Interior Design</dd>
              <dd>
                <em>Graduating Fall 2026</em>
              </dd>
            </div>
            <div>
              <dt>University of North Texas</dt>
              <dd>Bachelor of Science, Home Furnishings Merchandising</dd>
              <dd>Spring 1999</dd>
            </div>
            <div>
              <dt>IDSA — Board member</dt>
              <dd>2024 – 2026</dd>
            </div>
            <div>
              <dt>Professional affiliations</dt>
              <dd>NKBA · ASID</dd>
            </div>
          </dl>
        </div>
        <div className="edu-photos">
          <img src={asset("/about/jccc.jpg")} alt="Johnson County Community College campus" />
          <img src={asset("/about/unt.jpg")} alt="University of North Texas campus" />
        </div>
      </section>

      <section className="about-quotes">
        <p className="script">Kind words</p>
        <div className="quotes">
          {[1, 2, 3].map((i) => (
            <blockquote key={i}>
              <p>"Placeholder — a quote from a client, classmate, instructor or coworker."</p>
              <footer>— Name, relationship</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <div className="about-next">
        <a className="btn btn-navy" href="#/work">
          See the work
        </a>
      </div>
    </main>
  );
}

function Work({ openId }) {
  const open = projects.find((p) => p.id === openId);
  return (
    <main className="work">
      <section className="work-hero">
        <h1 className="wordmark-type wm-work">
          work <span className="wm-script">Check it out</span>
        </h1>
        <p className="work-intro">
          Each project is bound like a magazine. Hover to flip through, click to open it.
        </p>
      </section>
      <Shelf projects={projects} onOpen={(id) => go(`/work/${id}`)} paused={!!open} />
      {open && <Reader key={open.id} project={open} onClose={() => go("/work")} />}
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer" id="connect">
      <p className="script">Let's connect</p>
      <a className="btn btn-orange" href={mailto}>
        {contact.email}
      </a>
      <p className="footer-small">© {new Date().getFullYear()} Kristin Donovan · Donovan House</p>
    </footer>
  );
}

export default function App() {
  const route = useHashRoute();
  const [, section, id] = route.split("/");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  return (
    <>
      {section !== "" && <Nav route={route} />}
      {section === "about" ? <About /> : section === "work" ? <Work openId={id} /> : <Landing />}
      {section !== "" && <Footer />}
    </>
  );
}
