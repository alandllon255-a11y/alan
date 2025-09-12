import { Module } from '@nestjs/common';
import { GamificationModule } from './gamification/gamification.module.js';
import { AnswersController } from './answers/answers.controller.js';
import { AnswersService } from './answers/answers.service.js';
import { ProfileController } from './users/profile.controller.js';
import { LeaderboardController } from './leaderboard/leaderboard.controller.js';
import { MediaService } from './media/media.service.js';

@Module({
  imports: [GamificationModule],
  controllers: [AnswersController, ProfileController, LeaderboardController],
  providers: [AnswersService, MediaService],
})
export class AppModule {}


