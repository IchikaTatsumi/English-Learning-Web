import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { Topic } from './entities/topic.entity';
// ✅ Import Result entity để dùng trong service tính toán tiến độ
import { Result } from '../results/entities/result.entity';

@Module({
  imports: [
    // ✅ Đăng ký cả Topic và Result vào TypeOrmModule
    // Điều này giúp TopicService dùng được @InjectRepository(Result)
    TypeOrmModule.forFeature([Topic, Result]),
  ],
  controllers: [TopicController],
  providers: [TopicService],
  // ✅ Export TopicService để các module khác (như VocabularyModule) có thể dùng
  exports: [TopicService],
})
export class TopicModule {}
