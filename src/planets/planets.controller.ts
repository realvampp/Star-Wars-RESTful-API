import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { createUrlByIdAndClass, getPrevNext } from '../utils'
import { PlanetsService } from './planets.service'
import { CreatePlanetDto } from './dto/create-planet.dto'
import { UpdatePlanetDto } from './dto/update-planet.dto'
import { PaginatedResultDto } from '../pagination/paginated-result.dto'
import { NeedAdmin } from '../auth/decorators/needAdmin.decorator'

@ApiTags('planets')
@ApiBearerAuth()
@NeedAdmin(true)
@Controller('planets')
export class PlanetsController {
  constructor(private readonly planetsService: PlanetsService) {}

  @NeedAdmin(false)
  @Get(':id')
  @ApiOperation({ summary: 'Get planet by id' })
  async findOne(@Param('id') id: string) {
    const url = createUrlByIdAndClass('planets', id)

    return this.planetsService.findOne(url)
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create planet' })
  async create(@Body() createPlanetDto: CreatePlanetDto) {
    return this.planetsService.create(createPlanetDto)
  }

  @NeedAdmin(false)
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiOperation({ summary: 'Get all planets with pagination' })
  async findAll(@Query('page') page: number, @Req() req: Request) {
    page = +page || 1

    const count = await this.planetsService.count()
    if (page > Math.ceil(count / 10)) {
      throw new BadRequestException('Page not found')
    }

    const results = await this.planetsService.find10(page)
    const pages = getPrevNext(req, page, count)

    return new PaginatedResultDto(count, pages.next, pages.prev, results)
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update planet by id' })
  async update(
    @Param('id') id: string,
    @Body() updatePlanetDto: UpdatePlanetDto,
  ) {
    const url = createUrlByIdAndClass('planets', id)

    return await this.planetsService.update(url, updatePlanetDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete planet by id' })
  async remove(@Param('id') id: string) {
    const url = createUrlByIdAndClass('planets', id)

    return this.planetsService.remove(url)
  }
}
