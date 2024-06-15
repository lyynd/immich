import { browser } from '$app/environment';
import { serverInfo } from '$lib/stores/server-info.store';
import { preferences as preferences$, user as user$ } from '$lib/stores/user.store';
import { getMyPreferences, getMyUser, getStorage } from '@immich/sdk';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { AppRoute } from '../constants';

export interface AuthOptions {
  admin?: true;
  public?: true;
}

export const loadUser = async () => {
  try {
    let user = get(user$);
    let preferences = get(preferences$);
    debugger;
    if (!user || !preferences) {
      [user, preferences] = await Promise.all([getMyUser(), getMyPreferences()]);
      user$.set(user);
      preferences$.set(preferences);
    }
    return user;
  } catch {
    return null;
  }
};

const hasAuthCookie = (): boolean => {
  if (!browser) {
    return false;
  }

  for (const cookie of document.cookie.split('; ')) {
    const [name] = cookie.split('=');
    if (name === 'immich_is_authenticated') {
      return true;
    }
  }

  return false;
};

export const authenticate = async (options?: AuthOptions) => {
  const { public: publicRoute, admin: adminRoute } = options || {};
  const user = await loadUser();

  if (publicRoute) {
    return;
  }

  if (!user) {
    redirect(302, AppRoute.AUTH_LOGIN);
  }

  if (adminRoute && !user.isAdmin) {
    redirect(302, AppRoute.PHOTOS);
  }
};

export const requestServerInfo = async () => {
  if (get(user$)) {
    const data = await getStorage();
    serverInfo.set(data);
  }
};
