import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config } from './config';
import { DbService } from './db/db.service';
import { AuthService } from './auth/auth.service';
import { MailService } from './auth/mail.service';
import { AuthGuard, SessionFacultativeGuard } from './auth/auth.guard';
import { LimiteGuard } from './auth/limite.guard';
import { AuthController } from './auth/auth.controller';
import { CurriculumService } from './curriculum/curriculum.service';
import { CurriculumController } from './curriculum/curriculum.controller';
import { ProgressController } from './progress/progress.controller';
import { AdminController } from './admin/admin.controller';
import { EvolutionService } from './evolution/evolution.service';
import { MoiController, PhotosController } from './moi/moi.controller';
import { PhotoService } from './moi/photo.service';
import { ContactController } from './contact/contact.controller';
import { SiteController } from './site/site.controller';

@Controller()
class SanteController {
  @Get('sante')
  sante() { return { ok: true }; }
}

@Module({
  controllers: [SanteController, AuthController, CurriculumController, ProgressController, AdminController, MoiController, PhotosController, ContactController, SiteController],
  providers: [DbService, AuthService, MailService, AuthGuard, SessionFacultativeGuard, LimiteGuard, CurriculumService, EvolutionService, PhotoService],
})
class AppModule {}

async function demarrer() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Derrière un reverse proxy (Caddy, Traefik), l'adresse IP du client vient de X-Forwarded-For.
  app.set('trust proxy', 1);
  app.enableCors({ origin: config.corsOrigin.split(',').map((s) => s.trim()) });
  app.setGlobalPrefix('api');
  await app.listen(config.port);
  console.log(`API Saint Stack Academy sur le port ${config.port}`);
}
demarrer();
