import { Body, Controller, Get, HttpCode, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService, Utilisateur } from './auth.service';
import { AuthGuard, Moi } from './auth.guard';
import { LimiteGuard } from './limite.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Crée un compte non vérifié et envoie le lien de vérification. Aucun jeton de session. */
  @Post('inscription')
  @UseGuards(LimiteGuard)
  inscription(@Body() b: Record<string, unknown>) {
    return this.auth.inscrire(b ?? {});
  }

  @Get('verifier')
  verifier(@Query('jeton') jeton: string) {
    return this.auth.verifierEmail(jeton);
  }

  @Get('confirmer-email')
  confirmerEmail(@Query('jeton') jeton: string) {
    return this.auth.confirmerEmail(jeton);
  }

  @Post('renvoyer-verification')
  @HttpCode(200)
  @UseGuards(LimiteGuard)
  renvoyer(@Body() b: { email?: string }) {
    return this.auth.renvoyerVerification(b?.email);
  }

  @Post('connexion')
  @HttpCode(200)
  @UseGuards(LimiteGuard)
  connexion(@Body() b: { email?: string; motDePasse?: string }) {
    return this.auth.connecter(b?.email, b?.motDePasse);
  }

  @Post('mot-de-passe-oublie')
  @HttpCode(200)
  @UseGuards(LimiteGuard)
  oublie(@Body() b: { email?: string }) {
    return this.auth.motDePasseOublie(b?.email);
  }

  @Post('reinitialiser')
  @HttpCode(200)
  @UseGuards(LimiteGuard)
  reinitialiser(@Body() b: { jeton?: string; motDePasse?: string }) {
    return this.auth.reinitialiser(b?.jeton, b?.motDePasse);
  }

  @Get('moi')
  @UseGuards(AuthGuard)
  moi(@Moi() u: Utilisateur) {
    return this.auth.profil(u.id);
  }

  @Patch('moi')
  @UseGuards(AuthGuard)
  modifier(@Moi() u: Utilisateur, @Body() b: Record<string, unknown>) {
    return this.auth.modifier(u.id, b ?? {});
  }
}
