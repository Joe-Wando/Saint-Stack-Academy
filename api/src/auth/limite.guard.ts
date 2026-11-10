import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

const FENETRE_MS = 60_000;
const MAX = 5;

/**
 * Limitation de débit en mémoire : 5 tentatives par minute, par adresse IP et par route.
 * Au-delà, la réponse est 429. Suffisant pour une seule instance de l'API.
 */
@Injectable()
export class LimiteGuard implements CanActivate {
  private readonly essais = new Map<string, number[]>();

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const ip = String(req.ip ?? req.socket?.remoteAddress ?? 'inconnue');
    const cle = `${req.method} ${req.route?.path ?? req.url} ${ip}`;
    const maintenant = Date.now();
    const recents = (this.essais.get(cle) ?? []).filter((t) => maintenant - t < FENETRE_MS);
    if (recents.length >= MAX) {
      this.essais.set(cle, recents);
      throw new HttpException('Trop de tentatives. Réessaie dans une minute.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recents.push(maintenant);
    this.essais.set(cle, recents);
    if (this.essais.size > 10_000) this.nettoyer(maintenant);
    return true;
  }

  private nettoyer(maintenant: number) {
    for (const [cle, t] of this.essais) if (!t.some((x) => maintenant - x < FENETRE_MS)) this.essais.delete(cle);
  }
}
