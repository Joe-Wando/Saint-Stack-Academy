'use client';

import { DependencyList, useEffect, useState } from 'react';

/** Charge des données au montage (et quand `deps` change) ; renvoie les données, l'erreur et un rechargement. */
export function useDonnees<T>(charger: () => Promise<T>, deps: DependencyList = []) {
  const [donnees, setDonnees] = useState<T | null>(null);
  const [erreur, setErreur] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let actif = true;
    charger().then((d) => { if (actif) setDonnees(d); }).catch((e) => { if (actif) setErreur((e as Error).message); });
    return () => { actif = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);
  return { donnees, erreur, recharger: () => setVersion((v) => v + 1) };
}
