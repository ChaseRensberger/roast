import { useEffect, useState } from 'react'

export function useDemoView() {
  const [barista, setBarista] = useState(() => window.location.hash === '#barista')
  useEffect(() => {
    const sync = () => setBarista(window.location.hash === '#barista')
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  return { barista, navigate: (staff: boolean) => { window.location.hash = staff ? 'barista' : ''; setBarista(staff) } }
}
