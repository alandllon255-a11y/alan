import { Module } from '@nestjs/common';
import { GamificationModule } from './gamification/gamification.module';
import { AnswersController } from './answers/answers.controller';
import { AnswersService } from './answers/answers.service';
import { ProfileController } from './users/profile.controller';
import { LeaderboardController } from './leaderboard/leaderboard.controller';

@Module({
  imports: [GamificationModule],
  controllers: [AnswersController, ProfileController, LeaderboardController],
  providers: [AnswersService],
})
export class AppModule {}


