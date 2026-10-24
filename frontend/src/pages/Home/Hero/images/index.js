// Photos of the Home "Hero" section (the big first section).
// To use your own photo: put hero-1.jpg ... hero-4.jpg in this folder (see src/utils/pickImage.js).
import { pickImage } from '../../../../utils/pickImage.js'

const FOLDER = '/src/pages/Home/Hero/images'

export const heroImages = [
  pickImage(FOLDER, 'hero-1', { id: 29526371 }),
  pickImage(FOLDER, 'hero-2', { id: 29392549 }),
  pickImage(FOLDER, 'hero-3', { id: 20418606 }),
  pickImage(FOLDER, 'hero-4', { id: 13104546 }),
]
