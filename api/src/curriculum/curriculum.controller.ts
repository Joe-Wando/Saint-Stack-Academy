import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard, Moi } from '../auth/auth.guard';
import { Utilisateur } from '../auth/auth.service';
import { CurriculumService } from './curriculum.service';

@Controller()
@UseGuards(AuthGuard)
export class CurriculumController {
  constructor(private readonly curriculum: CurriculumService) {}

  @Get('programme')
  programme(@Moi() u: Utilisateur) {
    return this.curriculum.programme(u.role);
  }

  @Get('cours/:slug')
  cours(@Param('slug') slug: string, @Moi() u: Utilisateur) {
    return this.curriculum.un(slug, u.role);
  }
}
