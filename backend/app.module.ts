import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { GamificationModule } from './gamification/gamification.module.js';
import { AnswersController } from './answers/answers.controller.js';
import { AnswersService } from './answers/answers.service.js';
import { ProfileController } from './users/profile.controller.js';
import { LeaderboardController } from './leaderboard/leaderboard.controller.js';
import { UserContextMiddleware } from './common/user.middleware.js';
import { QuestionsController } from './questions/questions.controller.js';
import { QuestionsService } from './questions/questions.service.js';

@Module({
  imports: [GamificationModule],
  controllers: [AnswersController, ProfileController, LeaderboardController, QuestionsController],
  providers: [AnswersService, QuestionsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserContextMiddleware).forRoutes('*');
  }
}


