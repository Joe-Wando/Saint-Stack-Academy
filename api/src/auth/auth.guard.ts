import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService, Role, Utilisateur } from './auth.service';

export const ROLES = 'roles';
/** Restreint une route à certains rôles, par exemple @Roles('formateur'). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);

/** Récupère l'utilisateur connecté dans un contrôleur. */
export const Moi = createParamDecorator((_: unknown, ctx: ExecutionContext): Utilisateur => ctx.switchToHttp().getRequest().utilisateur);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const entete: string = req.headers['authorization'] ?? '';
    if (!entete.startsWith('Bearer ')) throw new UnauthorizedException('Connexion requise.');
    req.utilisateur = this.auth.verifier(entete.slice(7));
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES, [ctx.getHandler(), ctx.getClass()]);
    if (roles?.length && !roles.includes(req.utilisateur.role)) throw new ForbiddenException('Réservé au formateur.');
    return true;
  }
}
