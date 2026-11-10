import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService, Role, Utilisateur } from './auth.service';

export const ROLES = 'roles';
/** Restreint une route à certains rôles, par exemple @Roles('admin'). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);

/** Récupère l'utilisateur connecté dans un contrôleur (undefined sur une route publique sans session). */
export const Moi = createParamDecorator((_: unknown, ctx: ExecutionContext): Utilisateur => ctx.switchToHttp().getRequest().utilisateur);

/** Exige une session valide (et le rôle demandé par @Roles, vérifié côté serveur). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const entete: string = req.headers['authorization'] ?? '';
    if (!entete.startsWith('Bearer ')) throw new UnauthorizedException('Connexion requise.');
    const u = this.auth.verifier(entete.slice(7));
    // Un compte supprimé ou suspendu voit son jeton refusé dès la requête suivante ; le rôle vient de la base.
    const etat = await this.auth.etatCompte(u.id);
    if (!etat) throw new UnauthorizedException('Session expirée, reconnecte-toi.');
    req.utilisateur = { ...u, role: etat.role };
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES, [ctx.getHandler(), ctx.getClass()]);
    if (roles?.length && !roles.includes(req.utilisateur.role)) throw new ForbiddenException("Réservé à l'administrateur.");
    return true;
  }
}

/** Session facultative : les routes publiques reconnaissent l'admin s'il est connecté. */
@Injectable()
export class SessionFacultativeGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const entete: string = req.headers['authorization'] ?? '';
    if (entete.startsWith('Bearer ')) {
      try {
        const u = this.auth.verifier(entete.slice(7));
        const etat = await this.auth.etatCompte(u.id);
        req.utilisateur = etat ? { ...u, role: etat.role } : undefined;
      } catch { req.utilisateur = undefined; }
    }
    return true;
  }
}
