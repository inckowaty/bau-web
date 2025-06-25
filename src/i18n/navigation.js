import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

// Exportujemy wrappery, które będziemy używać w komponentach klienta
export const {Link, usePathname, useRouter, redirect, getPathname} =
  createNavigation(routing);