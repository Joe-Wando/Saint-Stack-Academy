import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard, Moi, SessionFacultativeGuard } from '../auth/auth.guard';
import { AuthService, Utilisateur } from '../auth/auth.service';
import { CurriculumService } from './curriculum.service';

@Controller()
export class CurriculumController {
  constructor(private readonly curriculum: CurriculumService, private readonly auth: AuthService) {}

  /** La structure L1, L2, L3 et les parcours, avec les cours de chaque UE. Publique. */
  @Get('referentiel')
  @UseGuards(SessionFacultativeGuard)
  referentiel(@Moi() u?: Utilisateur) {
    return this.curriculum.referentiel(u);
  }

  /** Tous les résumés de cours visibles (les privés seulement pour l'admin). Publique. */
  @Get('cours')
  @UseGuards(SessionFacultativeGuard)
  liste(@Moi() u?: Utilisateur) {
    return this.curriculum.liste(u);
  }

  @Get('cours/:slug')
  @UseGuards(AuthGuard)
  cours(@Param('slug') slug: string, @Moi() u: Utilisateur) {
    return this.curriculum.un(slug, u);
  }

  @Get('mon-niveau')
  @UseGuards(AuthGuard)
  async monNiveau(@Moi() u: Utilisateur) {
    const p = await this.auth.profil(u.id);
    return this.curriculum.monNiveau(u, p.niveau, p.optionL3);
  }
}
