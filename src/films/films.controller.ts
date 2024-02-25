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
import { FilmsService } from './films.service'
import { CreateFilmDto } from './dto/create-film.dto'
import { UpdateFilmDto } from './dto/update-film.dto'
import { createUrlByIdAndClass, getPrevNext } from '../utils'
import { NeedAdmin } from '../auth/decorators/needAdmin.decorator'

@ApiTags('films')
@ApiBearerAuth()
@NeedAdmin(true)
@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @NeedAdmin(false)
  @Get(':id')
  @ApiOperation({ summary: 'Find one film by id' })
  async findOne(@Param('id') id: string) {
    const url = createUrlByIdAndClass('films', id)
    return { data: await this.filmsService.findOne(url) }
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create film' })
  create(@Body() createFilmDto: CreateFilmDto) {
    return this.filmsService.create(createFilmDto)
  }

  @NeedAdmin(false)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiOperation({ summary: 'Get all films with pagination' })
  // @UseInterceptors(FileInterceptor('file'))
  async findAll(@Query('page') page: number, @Req() req: Request) {
    page = +page || 1

    const count = await this.filmsService.count()
    if (page > Math.ceil(count / 10)) {
      throw new BadRequestException('Page not found')
    }

    const results = await this.filmsService.find10(page)
    const urls = getPrevNext(req, page, count)

    return { count, ...urls, results }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update film' })
  update(@Param('id') id: string, @Body() updateFilmDto: UpdateFilmDto) {
    const url = createUrlByIdAndClass('films', id)
    console.log(url)
    return this.filmsService.update(url, updateFilmDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete film by id' })
  async remove(@Param('id') id: string) {
    const url = createUrlByIdAndClass('films', id)

    return { data: await this.filmsService.remove(url) }
  }
}
