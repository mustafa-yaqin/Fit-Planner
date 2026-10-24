// Photos of the Home "Categories" section (movement, stretching, sports practice).
// To use your own photo: put movement.jpg, stretching.jpg, sports-practice.jpg in this folder.
import { pickImage } from '../../../../utils/pickImage.js'

const FOLDER = '/src/pages/Home/Categories/images'

export const categoryImages = {
  movement: pickImage(FOLDER, 'movement', { id: 20418606 }),
  stretching: pickImage(FOLDER, 'stretching', { id: 6046980, ext: 'png' }),
  'sports practice': pickImage(FOLDER, 'sports-practice', { id: 6796964 }),
}
