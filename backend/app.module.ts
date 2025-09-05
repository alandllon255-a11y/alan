import { Module } from '@nestjs/common';
import { GamificationModule } from './gamification/gamification.module.js';
import { ChatModule } from './chat/chat.module.js';
import { AnswersController } from './answers/answers.controller.js';
import { AnswersService } from './answers/answers.service.js';
import { ProfileController } from './users/profile.controller.js';
import { LeaderboardController } from './leaderboard/leaderboard.controller.js';

@Module({
  imports: [GamificationModule, ChatModule],
  controllers: [AnswersController, ProfileController, LeaderboardController],
  providers: [AnswersService],
})
export class AppModule {}


