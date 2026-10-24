// The filter bar of the Activities page: search box, category, sort, "no equipment".
import { useLang } from '../../../context/LanguageContext.jsx'
import { CATEGORIES } from '../../../data/activities.js'

export default function ActivityFilters({ filters, setFilters, onReset }) {
  const { t } = useLang()

  function change(name) {
    return (event) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
      setFilters({ ...filters, [name]: value })
    }
  }

  return (
    <form
      className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <div>
        <label className="label" htmlFor="q">{t('search')}</label>
        <input id="q" type="search" className="field" value={filters.q} onChange={change('q')} placeholder={t('searchHint')} />
      </div>

      <div>
        <label className="label" htmlFor="cat">{t('category')}</label>
        <select id="cat" className="field" value={filters.cat} onChange={change('cat')}>
          <option value="">{t('allCats')}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(c)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="sort">{t('sortBy')}</label>
        <select id="sort" className="field" value={filters.sort} onChange={change('sort')}>
          <option value="asc">{t('shortest')}</option>
          <option value="desc">{t('longest')}</option>
        </select>
      </div>

      <div className="flex flex-col justify-end gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="h-5 w-5 accent-tealDark" checked={filters.noEquip} onChange={change('noEquip')} />
          {t('noEquip')}
        </label>
        <button type="button" className="btn-dark" onClick={onReset}>
          {t('resetFilters')}
        </button>
      </div>
    </form>
  )
}
