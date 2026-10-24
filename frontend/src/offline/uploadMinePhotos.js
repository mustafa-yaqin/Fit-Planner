// A user's photo is first kept on the device (data: url). Before the list is saved on the server,
// each such photo is uploaded; the activity then points to the web address of the photo.
import { api } from '../utils/api.js'

export async function uploadMinePhotos(list) {
  const done = []
  for (const activity of list) {
    if (!activity.image || !activity.image.startsWith('data:')) continue
    try {
      const result = await api.post('/api/upload', { data: activity.image }, 40000)
      done.push({ id: activity.id, from: activity.image, url: result.url })
    } catch (error) {
      // no internet or login problem: try again later. A photo the server refuses is dropped, so it cannot block saving.
      if (error.code === 'network' || error.status === 401 || error.status >= 500) throw error
      done.push({ id: activity.id, from: activity.image, url: '' })
    }
  }
  return done
}
