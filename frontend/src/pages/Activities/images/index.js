// Photos of the activities (activity-1 ... activity-12, default). Put activity-1.jpg etc. here to use your own.
import { pickImage } from '../../../utils/pickImage.js'

const FOLDER = '/src/pages/Activities/images'

const activityPhotos = {
  1: { id: 13104546 },
  2: { id: 20418606 },
  3: { id: 6796964 },
  4: { id: 29392549 },
  5: { id: 6046980, ext: 'png' },
  6: { id: 9545909 },
  7: { id: 29224211 },
  8: { id: 6389513 },
  9: { id: 9545914 },
  10: { id: 29526372 },
  11: { id: 29392546 },
  12: { id: 29526371 },
}

export function activityImage(activity) {
  if (activity.image) return activity.image
  return pickImage(FOLDER, 'activity-' + activity.id, activityPhotos[activity.id]) ||
    pickImage(FOLDER, 'default')
}
