import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { GamificationModule } from './gamification/gamification.module.js';
import { AnswersController } from './answers/answers.controller.js';
import { AnswersService } from './answers/answers.service.js';
import { ProfileController } from './users/profile.controller.js';
import { LeaderboardController } from './leaderboard/leaderboard.controller.js';
import { UserContextMiddleware } from './common/user.middleware.js';
import { QuestionsController } from './questions/questions.controller.js';
import { QuestionsService } from './questions/questions.service.js';
import { CommentsController } from './comments/comments.controller.js';
import { HealthController } from './health/health.controller.js';
import { createRateLimiter } from './common/rate-limit.middleware.js';
import { AuthController } from './auth/auth.controller.js';
import { StoreController } from './store/store.controller.js';
import { GamificationController } from './gamification/gamification.controller.js';

@Module({
  imports: [GamificationModule],
  controllers: [AnswersController, ProfileController, LeaderboardController, QuestionsController, CommentsController, HealthController, AuthController, StoreController, GamificationController],
  providers: [AnswersService, QuestionsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserContextMiddleware).forRoutes('*');
    consumer.apply(createRateLimiter(60_000, 100, 'answers')).forRoutes(AnswersController);
    consumer.apply(createRateLimiter(60_000, 100, 'comments')).forRoutes(CommentsController);
  }
}


