import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger'
import { Request } from 'express'
import { PeopleService } from './people.service'
import { CreatePeopleDto } from './dto/create-people.dto'
import { UpdatePeopleDto } from './dto/update-people.dto'
import { createUrlByIdAndClass, getPrevNext } from '../utils'
import { PaginatedResultDto } from '../pagination/paginated-result.dto'
import { NeedAdmin } from '../auth/decorators/needAdmin.decorator'
import { People } from './entities/people.entity'
import { ApiResponseData } from '../pagination/data-response-api.decorator'

@ApiTags('people')
@ApiBearerAuth()
@NeedAdmin(true)
@Controller('people/')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get(':id')
  @NeedAdmin(false)
  @ApiResponseData(People)
  @ApiOperation({ summary: 'Find one people by id' })
  async findOne(@Param('id') id: string) {
    const url = createUrlByIdAndClass('people', id)
    return await this.peopleService.findOne(url)
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create people' })
  async create(@Body() createPeopleDto: CreatePeopleDto) {
    return await this.peopleService.create(createPeopleDto)
  }

  @Get()
  @NeedAdmin(false)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiOperation({ summary: 'Get all people with pagination' })
  async findAll(@Query('page') page: number, @Req() req: Request) {
    page = +page || 1

    const count = await this.peopleService.count()
    if (page > Math.ceil(count / 10)) {
      throw new BadRequestException('Page not found')
    }

    const results = await this.peopleService.find10(page)
    const pages = getPrevNext(req, page, count)

    return new PaginatedResultDto(count, pages.next, pages.prev, results)
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update people' })
  async update(
    @Param('id') id: string,
    @Body() updatePeopleDto: UpdatePeopleDto,
  ) {
    const url = createUrlByIdAndClass('people', id)

    return await this.peopleService.update(url, updatePeopleDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete people by id' })
  async remove(@Param('id') id: string) {
    const url = createUrlByIdAndClass('people', id)

    return await this.peopleService.remove(url)
  }
}
