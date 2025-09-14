import { Module } from '@nestjs/common';
import { GamificationModule } from './gamification/gamification.module.js';
import { AnswersController } from './answers/answers.controller.js';
import { AnswersService } from './answers/answers.service.js';
import { ProfileController } from './users/profile.controller.js';
import { MediaModule } from './media/media.module.js';
import { JwtAuthGuard } from './auth/jwt.guard.js';
import { LeaderboardController } from './leaderboard/leaderboard.controller.js';

@Module({
  imports: [GamificationModule, MediaModule],
  controllers: [AnswersController, ProfileController, LeaderboardController],
  providers: [AnswersService, JwtAuthGuard],
})
export class AppModule {}


