import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { CreateVocabularyDTO, UpdateVocabularyDTO } from './dto/vocabulary.dto';

@Injectable()
export class VocabularyService {
  private readonly logger = new Logger(VocabularyService.name);

  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
  ) {}

  async createVocabulary(dto: CreateVocabularyDTO): Promise<Vocabulary> {
    this.logger.log(`📝 Creating vocabulary: ${dto.word}`);
    const vocabulary = this.vocabularyRepository.create(dto);
    return await this.vocabularyRepository.save(vocabulary);
  }

  async updateVocabulary(
    id: number,
    dto: UpdateVocabularyDTO,
  ): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id },
    });
    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }
    Object.assign(vocabulary, dto);
    return await this.vocabularyRepository.save(vocabulary);
  }

  async getAllVocabularies(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      relations: ['topic'],
      order: { word: 'ASC' },
    });
  }

  // ✅ Thêm hàm này để Controller gọi
  async getVocabularyById(id: number): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id },
      relations: ['topic'],
    });
    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }
    return vocabulary;
  }

  async deleteVocabulary(id: number): Promise<void> {
    await this.vocabularyRepository.delete(id);
  }
}
