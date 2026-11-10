import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const LIMITE = 'limite';
/** Limite propre à une route, par exemple @Limite(3, 3_600_000) : 3 envois par heure. */
export const Limite = (max: number, fenetreMs: number) => SetMetadata(LIMITE, { max, fenetreMs });

/**
 * Limitation de débit en mémoire, par adresse IP et par route. Par défaut : 5 tentatives par minute.
 * Au-delà, la réponse est 429. Suffisant pour une seule instance de l'API.
 */
@Injectable()
export class LimiteGuard implements CanActivate {
  private readonly essais = new Map<string, number[]>();
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const { max, fenetreMs } = this.reflector.get<{ max: number; fenetreMs: number }>(LIMITE, ctx.getHandler()) ?? { max: 5, fenetreMs: 60_000 };
    const req = ctx.switchToHttp().getRequest();
    const ip = String(req.ip ?? req.socket?.remoteAddress ?? 'inconnue');
    const cle = `${req.method} ${req.route?.path ?? req.url} ${ip}`;
    const maintenant = Date.now();
    const recents = (this.essais.get(cle) ?? []).filter((t) => maintenant - t < fenetreMs);
    if (recents.length >= max) {
      this.essais.set(cle, recents);
      const attente = fenetreMs >= 3_600_000 ? 'dans une heure' : 'dans une minute';
      throw new HttpException(`Trop de tentatives. Réessaie ${attente}.`, HttpStatus.TOO_MANY_REQUESTS);
    }
    recents.push(maintenant);
    this.essais.set(cle, recents);
    if (this.essais.size > 10_000) this.nettoyer(maintenant);
    return true;
  }

  private nettoyer(maintenant: number) {
    for (const [cle, t] of this.essais) if (!t.some((x) => maintenant - x < 3_600_000)) this.essais.delete(cle);
  }
}
