// Theme: follow the system ("auto") or force light/dark. Kept in localStorage so index.html
// can apply it before the first paint.
export type ThemeChoice = 'auto' | 'light' | 'dark';
const KEY = 'k3k-theme';

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

class Theme {
  choice = $state<ThemeChoice>(read());

  set(choice: ThemeChoice) {
    this.choice = choice;
    try {
      if (choice === 'auto') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, choice);
    } catch {
      /* storage unavailable: the choice still applies to this visit */
    }
    if (choice === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = choice;
  }

  cycle() {
    this.set(this.choice === 'auto' ? 'light' : this.choice === 'light' ? 'dark' : 'auto');
  }
}

export const theme = new Theme();
