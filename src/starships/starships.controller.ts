import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { StarshipsService } from './starships.service'
import { CreateStarshipDto } from './dto/create-starship.dto'
import { UpdateStarshipDto } from './dto/update-starship.dto'
import { createUrlByIdAndClass, getPrevNext } from '../utils'
import { PaginatedResultDto } from '../pagination/paginated-result.dto'
import { NeedAdmin } from '../auth/decorators/needAdmin.decorator'

@ApiTags('starships')
@ApiBearerAuth()
@NeedAdmin(true)
@Controller('starships')
export class StarshipsController {
  constructor(private readonly starshipsService: StarshipsService) {}

  @NeedAdmin(false)
  @Get(':id')
  @ApiOperation({ summary: 'Get starship by id' })
  async findOne(@Param('id') id: string) {
    const url = createUrlByIdAndClass('starships', id)
    return await this.starshipsService.findOne(url)
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create starship' })
  async create(@Body() createStarshipDto: CreateStarshipDto) {
    return await this.starshipsService.create(createStarshipDto)
  }

  @NeedAdmin(false)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiOperation({ summary: 'Get all starships with pagination' })
  async findAll(@Query('page') page: number, @Req() req: Request) {
    page = +page || 1

    const count = await this.starshipsService.count()
    if (page > Math.ceil(count / 10)) {
      throw new BadRequestException('Page not found')
    }

    const results = await this.starshipsService.find10(page)
    const pages = getPrevNext(req, page, count)

    return new PaginatedResultDto(count, pages.next, pages.prev, results)
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update starship by id' })
  async update(
    @Param('id') id: string,
    @Body() updateStarshipDto: UpdateStarshipDto,
  ) {
    const url = createUrlByIdAndClass('starships', id)

    return await this.starshipsService.update(url, updateStarshipDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete starship by id' })
  async remove(@Param('id') id: string) {
    const url = createUrlByIdAndClass('starships', id)

    return await this.starshipsService.remove(url)
  }
}
