import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService, Utilisateur } from './auth.service';
import { AuthGuard, Moi } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('inscription')
  inscription(@Body() b: { nom: string; email: string; motDePasse: string; codeInvitation?: string }) {
    return this.auth.inscrire(b.nom, b.email, b.motDePasse, b.codeInvitation ?? '');
  }

  @Post('connexion')
  connexion(@Body() b: { email: string; motDePasse: string }) {
    return this.auth.connecter(b.email, b.motDePasse);
  }

  @Get('moi')
  @UseGuards(AuthGuard)
  moi(@Moi() u: Utilisateur) {
    return u;
  }
}
