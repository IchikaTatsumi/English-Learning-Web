import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { VocabularyService } from './vocabulary.service';
// ✅ Import đúng tên class
import {
  CreateVocabularyDTO,
  UpdateVocabularyDTO,
  VocabularyDTO,
} from './dto/vocabulary.dto';
import { Role } from 'src/core/enums/role.enum';
import { Roles } from 'src/core/decorators/role.decorator';
import { Public } from 'src/core/decorators/public.decorator';

@ApiBearerAuth()
@ApiTags('Vocabulary')
@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lấy tất cả từ vựng' })
  @ApiOkResponse({ type: [VocabularyDTO] }) // Document cho Swagger
  async getAllVocabularies(): Promise<VocabularyDTO[]> {
    const vocabularies = await this.vocabularyService.getAllVocabularies();
    // ✅ Chuyển đổi sang DTO snake_case
    return VocabularyDTO.fromEntities(vocabularies);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy từ vựng theo ID' })
  @ApiOkResponse({ type: VocabularyDTO })
  async getVocabularyById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VocabularyDTO> {
    // ✅ Gọi trực tiếp service (hiệu năng tốt hơn)
    const vocabulary = await this.vocabularyService.getVocabularyById(id);
    return VocabularyDTO.fromEntity(vocabulary);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Tạo từ vựng mới' })
  async createVocabulary(
    @Body() dto: CreateVocabularyDTO,
  ): Promise<VocabularyDTO> {
    const vocabulary = await this.vocabularyService.createVocabulary(dto);
    return VocabularyDTO.fromEntity(vocabulary);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật từ vựng' })
  async updateVocabulary(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVocabularyDTO,
  ): Promise<VocabularyDTO> {
    const vocabulary = await this.vocabularyService.updateVocabulary(id, dto);
    return VocabularyDTO.fromEntity(vocabulary);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa từ vựng' })
  async deleteVocabulary(@Param('id', ParseIntPipe) id: number) {
    await this.vocabularyService.deleteVocabulary(id);
  }
}
