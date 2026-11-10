import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from './config';
import { DbService } from './db/db.service';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthController } from './auth/auth.controller';
import { CurriculumService } from './curriculum/curriculum.service';
import { CurriculumController } from './curriculum/curriculum.controller';
import { ProgressController } from './progress/progress.controller';
import { FormateurController } from './formateur/formateur.controller';

@Controller()
class SanteController {
  @Get('sante')
  sante() { return { ok: true }; }
}

@Module({
  controllers: [SanteController, AuthController, CurriculumController, ProgressController, FormateurController],
  providers: [DbService, AuthService, AuthGuard, CurriculumService],
})
class AppModule {}

async function demarrer() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: config.corsOrigin.split(',').map((s) => s.trim()) });
  app.setGlobalPrefix('api');
  await app.listen(config.port);
  console.log(`API Saint Stack Academy sur le port ${config.port}`);
}
demarrer();
