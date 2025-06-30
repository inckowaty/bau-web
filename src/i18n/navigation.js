// src/i18n/navigation.js
import {createNavigation} from 'next-intl/navigation';
import {locales} from './routing';      // patrz punkt 2

export const {
  Link,
  usePathname,
  useRouter,
  redirect,
  getPathname
} = createNavigation({locales});
