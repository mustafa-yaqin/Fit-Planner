// The table of shared activities with Edit and Delete buttons.
import { useLang } from '../../../context/LanguageContext.jsx'

const heads = ['title', 'category', 'minutes', 'equipment', 'actions']

export default function ActivityTable({ activities, onEdit, onDelete }) {
  const { t, pick } = useLang()

  return (
    <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
      <table className="min-w-full text-sm">
        <caption className="sr-only">{t('manage')}</caption>
        <thead className="bg-sky">
          <tr>
            {heads.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 text-start font-bold text-tealDark">{t(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => (
            <tr key={a.id} className="border-t border-navy/10 transition hover:bg-sky/70">
              <th scope="row" className="px-4 py-3 text-start font-semibold">{pick(a, 'title')}</th>
              <td className="px-4 py-3">{t(a.category)}</td>
              <td className="px-4 py-3">{a.durationMinutes}</td>
              <td className="px-4 py-3">{a.equipmentRequired ? pick(a, 'equipmentDescription') : t('noneNeeded')}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button className="btn-dark" aria-label={t('edit') + ' ' + pick(a, 'title')} onClick={() => onEdit(a)}>
                    {t('edit')}
                  </button>
                  <button className="btn-danger" aria-label={t('del') + ' ' + pick(a, 'title')} onClick={() => onDelete(a)}>
                    {t('del')}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
