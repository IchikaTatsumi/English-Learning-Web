import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { Result } from '../results/entities/result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Result])],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [TopicService, TypeOrmModule.forFeature([Topic])],
})
export class TopicModule {}
