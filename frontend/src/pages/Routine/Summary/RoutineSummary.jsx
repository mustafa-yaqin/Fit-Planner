// The summary box of the Routine page: total minutes, done minutes, daily goal (+ / - buttons).
import { useLang } from '../../../context/LanguageContext.jsx'
import { parseTarget } from '../../../utils/calc.js'

export default function RoutineSummary({ total, doneCount, lines, doneMinutes, targetText, setTargetText }) {
  const { t } = useLang()

  const goal = parseTarget(targetText)
  const valid = !Number.isNaN(goal)

  let message = t('badTarget')
  if (valid && goal >= total) message = t('left', { n: goal - total })
  if (valid && goal < total) message = t('over', { n: total - goal })

  function changeTarget(amount) {
    const current = valid ? goal : 60
    setTargetText(String(Math.max(5, current + amount)))
  }

  return (
    <section className="card grid gap-6 md:grid-cols-3" aria-labelledby="summary-title">
      <h2 id="summary-title" className="text-xl font-bold text-tealDark md:col-span-3">
        {t('summary')}
      </h2>

      <div>
        <p className="text-sm text-navy/80">{t('total')}</p>
        <p className="text-3xl font-extrabold">{total} {t('min')}</p>
      </div>

      <div>
        <p className="text-sm text-navy/80">{t('completed')}</p>
        <p className="text-3xl font-extrabold">{t('ofN', { a: doneCount, b: lines })}</p>
        <p className="text-sm text-navy/80">{t('doneMin', { n: doneMinutes })}</p>
      </div>

      <div>
        <label className="label" htmlFor="target">{t('target')}</label>
        <div className="flex gap-1">
          <button className="btn-dark !px-3" aria-label={t('decT')} onClick={() => changeTarget(-5)}>−</button>
          <input
            id="target"
            inputMode="numeric"
            dir="ltr"
            className="field text-center"
            value={targetText}
            onChange={(event) => setTargetText(event.target.value)}
            aria-invalid={!valid}
            aria-describedby="target-message"
          />
          <button className="btn-dark !px-3" aria-label={t('incT')} onClick={() => changeTarget(5)}>+</button>
          <button className="btn-dark" onClick={() => setTargetText('60')}>{t('reset')}</button>
        </div>
        <p id="target-message" role="status" className={valid ? 'mt-2 text-sm font-semibold text-tealDark' : 'err'}>
          {message}
        </p>
      </div>
    </section>
  )
}
