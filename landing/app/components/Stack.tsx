// Deck slide 10 (Intelligence stack). Strings from i18n dictionary.
// Category columns only (no brand names). ⚠ 待 Danny 审字.

import type { Dict } from "../i18n";

export function Stack({ t }: { t: Dict["stack"] }) {
  return (
    <section className="section" id="stack">
      <div className="wrap">
        <div className="masthead">
          <span>{t.mastheadL}</span>
          <span>{t.mastheadR}</span>
        </div>
        <div className="split-head">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2>{t.h2}</h2>
          </div>
          <p className="lede">{t.lede}</p>
        </div>

        <div className="matrix-scroll">
          <table className="matrix">
            <thead>
              <tr>
                <th>{t.colLayer}</th>
                <th className="is-avery">{t.colAvery}</th>
                <th>{t.colGeneric}</th>
                <th>{t.colBi}</th>
                <th>{t.colTask}</th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r) => (
                <tr key={r.layer}>
                  <td className="layer"><strong>{r.layer}</strong><span>{r.sub}</span></td>
                  <td className="is-avery">{r.avery}</td>
                  <td>{r.generic}</td>
                  <td>{r.bi}</td>
                  <td>{r.task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
